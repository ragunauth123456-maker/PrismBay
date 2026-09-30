import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { matchesIntendedProduct } from './cj-match-policy.mjs';

// Sanitized read-only handoff. A matched product never implies sale readiness.
export function buildCJReview(report) {
  if (!report || !Array.isArray(report.results) || !Number.isFinite(Date.parse(report.checkedAt))) {
    throw new Error('CJ verification report missing or invalid');
  }
  const authenticationVerified = report.authentication === 'verified';
  const candidates = report.results.map(row => {
    const intended = String(row.candidate || '');
    const productName = String(row.product?.name || '');
    const slug = typeof row.slug === 'string' ? row.slug : null;
    const identity = slug ? matchesIntendedProduct({slug}, productName) : null;
    let status = 'supplier_search_needed';
    if (row.supplierVerified) {
      status = identity === false ? 'identity_rejected' :
        identity === null ? 'manual_identity_check_required' :
        !row.variantInventoryVerified ? 'variant_stock_required' :
        !row.freightVerified ? 'destination_freight_required' :
        'commercial_review_required';
    } else if (row.status === 'search_error') {
      status = 'supplier_api_retry_required';
    }
    return {
      slug, candidate: intended, observedProduct: productName || null,
      // Public CJ catalog identifiers only, never credentials, account IDs or customer data.
      observedSupplierSku: typeof row.product?.sku === 'string' ? row.product.sku : null,
      observedVariantSku: typeof row.product?.variantSku === 'string' ? row.product.variantSku : null,
      freightDiagnostic: typeof row.freightDiagnostic === 'string' ? row.freightDiagnostic :
        (Number(row.zeroPriceQuoteCount) > 0 ? 'zero_priced_methods_require_supplier_confirmation' : null),
      freightQuoteScope: row.freightQuoteScope || null,
      zeroPricedMethodCount: Number.isInteger(row.zeroPriceQuoteCount) ? row.zeroPriceQuoteCount : 0,
      supplierClaimedMatch: Boolean(row.supplierVerified),
      independentIdentityMatch: identity, status,
      variantStockVerified: Boolean(identity === true && row.variantInventoryVerified),
      countryFreightEstimated: Boolean(identity === true && row.variantInventoryVerified && row.freightVerified),
      mediaRightsVerified: false, finalZipFreightVerified: false,
      checkoutAllowed: false, automaticPromotionAllowed: false,
    };
  });
  return {
    schemaVersion: 1, checkedAt: report.checkedAt, market: report.market || 'US',
    authenticationVerified, sourceCandidateCount: report.results.length,
    independentProductMatches: candidates.filter(c => c.independentIdentityMatch === true).length,
    rejectedFalseMatches: candidates.filter(c => c.status === 'identity_rejected').length,
    verifiedVariantCount: candidates.filter(c => c.variantStockVerified).length,
    countryFreightEstimateCount: candidates.filter(c => c.countryFreightEstimated).length,
    saleReadyCount: 0,
    zeroPricedCandidateCount: candidates.filter(c => c.zeroPricedMethodCount > 0).length,
    allRequireManualCommercialApproval: true,
    note: 'Country-level freight is not a destination ZIP quote. Product media and checkout require separate authorization.',
    candidates,
  };
}

// Carry forward distinct batches for up to thirty hours so four scheduled
// checks form a rolling twelve-candidate review rather than overwriting each other.
export function mergeCJReview(previous, fresh) {
  const current = fresh.candidates.map(c => ({...c, observedAt: fresh.checkedAt}));
  const now = Date.parse(fresh.checkedAt);
  const seen = new Set(current.map(c => c.slug).filter(Boolean));
  const retained = Array.isArray(previous?.candidates) ? previous.candidates.filter(c => {
    const observedAt = Date.parse(c.observedAt || previous?.checkedAt);
    return Boolean(c.slug) && !seen.has(c.slug) && Number.isFinite(observedAt) &&
      observedAt <= now && now - observedAt < 30 * 36e5;
  }) : [];
  // Recheck carried evidence after policy corrections. A prior accepted title
  // must not preserve stock/freight approval for a newly rejected identity.
  const combined = [...current, ...retained].map(row => {
    if (matchesIntendedProduct({slug: row.slug}, row.observedProduct)) return row;
    return {...row, independentIdentityMatch: row.slug ? false : null,
      status: row.supplierClaimedMatch ? (row.slug ? 'identity_rejected' : 'manual_identity_check_required') : row.status,
      variantStockVerified: false, countryFreightEstimated: false,
      mediaRightsVerified: false, finalZipFreightVerified: false,
      checkoutAllowed: false, automaticPromotionAllowed: false};
  });
  return {
    ...fresh, latestBatchCandidateCount: fresh.sourceCandidateCount,
    sourceCandidateCount: combined.length, candidates: combined,
    independentProductMatches: combined.filter(c => c.independentIdentityMatch === true).length,
    rejectedFalseMatches: combined.filter(c => c.status === 'identity_rejected').length,
    verifiedVariantCount: combined.filter(c => c.variantStockVerified).length,
    countryFreightEstimateCount: combined.filter(c => c.countryFreightEstimated).length,
    saleReadyCount: 0,
    zeroPricedCandidateCount: combined.filter(c => c.zeroPricedMethodCount > 0).length,
  };
}

export async function main(source = 'growth-reports/cj-supplier-verification.json', destination = 'growth-reports/cj-worker-review.json') {
  const report = JSON.parse(await fs.readFile(source, 'utf8'));
  // Prior artifact schema lacks slugs, so join exactly by normalized candidate names
  // to our published, unverified research catalog, never by fuzzy supplier titles.
  try {
    const catalog = JSON.parse(await fs.readFile('public/viral-candidates.json', 'utf8'));
    const names = new Map((catalog.candidates || []).map(c => [String(c.name || '').trim().toLowerCase(), c.slug]));
    report.results = report.results.map(r => ({...r, slug: r.slug || names.get(String(r.candidate || '').trim().toLowerCase()) || null}));
  } catch { /* Missing catalog leaves every identity match awaiting manual review. */ }
  const current = buildCJReview(report);
  let previous = null;
  try { previous = JSON.parse(await fs.readFile(destination, 'utf8')); } catch { /* first batch */ }
  const output = mergeCJReview(previous, current);
  await fs.mkdir('growth-reports', {recursive:true});
  await fs.writeFile(destination, JSON.stringify(output, null, 2) + '\n');
  const summary = {
    checkedAt: output.checkedAt, cjAuthentication: output.authenticationVerified,
    candidatesReviewed: output.sourceCandidateCount, genuineMatches: output.independentProductMatches,
    falseMatchesRejected: output.rejectedFalseMatches,
    variantsConfirmed: output.verifiedVariantCount,
    countryFreightEstimates: output.countryFreightEstimateCount,
    zeroPricedCandidatesNeedingManualQuote: output.zeroPricedCandidateCount,
    saleReady: 0,
  };
  console.log(JSON.stringify(summary));
  if (process.env.GITHUB_STEP_SUMMARY) {
    await fs.appendFile(process.env.GITHUB_STEP_SUMMARY,
      '\n## CJ supplier review (read-only)\n\n' +
      Object.entries(summary).map(([k,v]) => '- ' + k + ': ' + v).join('\n') + '\n');
  }
  return output;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
