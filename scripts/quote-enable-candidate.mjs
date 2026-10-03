import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { matchesIntendedProduct } from './cj-match-policy.mjs';

const positive = value => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
};

function safeStripeUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return url.protocol === 'https:' && ['buy.stripe.com', 'checkout.stripe.com'].includes(url.hostname) ? url.toString() : null;
  } catch { return null; }
}

export function buildQuoteEnableCandidates(report, authorization) {
  if (!report || !Array.isArray(report.results) || !Number.isFinite(Date.parse(report.checkedAt))) throw new Error('valid CJ report required');
  const checkout = authorization?.checkoutInfrastructure || {};
  const allowedSkus = new Set(Array.isArray(checkout.verifiedCheckoutSkus) ? checkout.verifiedCheckoutSkus.map(String) : []);
  const checkoutUrls = checkout.verifiedCheckoutUrls && typeof checkout.verifiedCheckoutUrls === 'object' ? checkout.verifiedCheckoutUrls : {};

  const candidates = [];
  for (const row of report.results) {
    const slug = String(row?.slug || '').trim();
    const product = row?.product || {};
    const retailUsd = positive(row?.retailPriceUsd);
    const supplierCostUsd = positive(product?.productCostUsd);
    const cjVariantId = String(product?.variantId || '').trim();
    const originCountryCode = String(product?.warehouse || row?.originCountryCode || '').toUpperCase();
    const paymentUrl = safeStripeUrl(checkoutUrls[slug]);
    const identityVerified = Boolean(slug && product?.name && matchesIntendedProduct({ slug }, product.name));
    const eligible = Boolean(
      authorization?.ownerAuthorized === true &&
      checkout.deployed === true &&
      checkout.stripeWebhookSecretConfigured === true &&
      checkout.checkoutAllowedOnlyAfterFinalZipFreight === true &&
      allowedSkus.has(slug) && paymentUrl && identityVerified &&
      row?.supplierVerified === true && row?.variantInventoryVerified === true && row?.freightVerified === true &&
      cjVariantId && supplierCostUsd && retailUsd && /^[A-Z]{2}$/.test(originCountryCode)
    );
    if (!eligible) continue;
    candidates.push({
      sku: slug,
      cjVariantId,
      cjVariantSku: typeof product?.variantSku === 'string' ? product.variantSku : null,
      cjProductSku: typeof product?.sku === 'string' ? product.sku : null,
      supplierCostUsd,
      retailUsd,
      originCountryCode,
      stripePaymentUrl: paymentUrl,
      feeRatePct: 3.2,
      returnReservePct: 5,
      evidence: {
        supplierIdentityVerified: true,
        variantInventoryVerified: true,
        screeningFreightVerified: true,
        checkoutInfrastructureVerified: true,
        finalBuyerZipVerified: false,
      },
      activationAllowed: false,
      activationReason: 'exact_buyer_zip_quote_required_per_session',
    });
  }
  return {
    schemaVersion: 1,
    checkedAt: report.checkedAt,
    mode: 'quote_enable_candidate_only',
    automaticActivation: false,
    supplierOrderingEnabled: false,
    finalBuyerZipRequired: true,
    candidateCount: candidates.length,
    quoteProducts: candidates,
  };
}

export async function main(source = 'growth-reports/cj-supplier-verification.json', destination = 'growth-reports/quote-enable-candidates.json') {
  const [report, authorization] = await Promise.all([
    fs.readFile(source, 'utf8').then(JSON.parse),
    fs.readFile('config/retail-commercial-authorization.json', 'utf8').then(JSON.parse),
  ]);
  const output = buildQuoteEnableCandidates(report, authorization);
  await fs.mkdir('growth-reports', { recursive: true });
  await fs.writeFile(destination, JSON.stringify(output, null, 2) + '\n');
  console.log(JSON.stringify({ quoteEnableCandidates: output.candidateCount, automaticActivation: false, finalBuyerZipRequired: true }));
  return output;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
