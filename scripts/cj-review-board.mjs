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
    saleReadyCount: 0, allRequireManualCommercialApproval: true,
    note: 'Country-level freight is not a destination ZIP quote. Product media and checkout require separate authorization.',
    candidates,
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
  const output = buildCJReview(report);
  await fs.mkdir('growth-reports', {recursive:true});
  await fs.writeFile(destination, JSON.stringify(output, null, 2) + '\n');
  const summary = {
    checkedAt: output.checkedAt, cjAuthentication: output.authenticationVerified,
    candidatesReviewed: output.sourceCandidateCount, genuineMatches: output.independentProductMatches,
    falseMatchesRejected: output.rejectedFalseMatches,
    variantsConfirmed: output.verifiedVariantCount,
    countryFreightEstimates: output.countryFreightEstimateCount,
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
