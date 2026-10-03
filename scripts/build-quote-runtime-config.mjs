import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

function positive(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function safeStripeUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return url.protocol === 'https:' && ['buy.stripe.com', 'checkout.stripe.com'].includes(url.hostname) ? url.toString() : null;
  } catch { return null; }
}

export function buildRuntimeConfig(handoff = {}) {
  const rows = Array.isArray(handoff?.quoteProducts) ? handoff.quoteProducts : [];
  const products = [];
  for (const row of rows) {
    const sku = String(row?.sku || '').trim();
    const cjVariantId = String(row?.cjVariantId || '').trim();
    const supplierCostUsd = positive(row?.supplierCostUsd);
    const retailUsd = positive(row?.retailUsd);
    const originCountryCode = String(row?.originCountryCode || '').toUpperCase();
    const stripePaymentUrl = safeStripeUrl(row?.stripePaymentUrl);
    const feeRatePct = positive(row?.feeRatePct) ?? 3.2;
    const returnReservePct = positive(row?.returnReservePct) ?? 5;
    const maxFreightUsd = positive(row?.freightBudget?.maxFreightUsd);
    const evidence = row?.evidence || {};
    const verified = Boolean(
      /^[A-Za-z0-9._-]{1,80}$/.test(sku) && cjVariantId && supplierCostUsd && retailUsd &&
      /^[A-Z]{2}$/.test(originCountryCode) && stripePaymentUrl && maxFreightUsd &&
      evidence.supplierIdentityVerified === true && evidence.variantInventoryVerified === true &&
      evidence.screeningFreightVerified === true && evidence.checkoutInfrastructureVerified === true &&
      evidence.finalBuyerZipVerified === false && row.activationAllowed === false
    );
    if (!verified) continue;
    products.push({ sku, cjVariantId, supplierCostUsd, retailUsd, originCountryCode, feeRatePct, returnReservePct, stripePaymentUrl });
  }
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    sourceCheckedAt: handoff?.checkedAt || null,
    deploymentMode: 'quote_runtime_config_candidate',
    requiresSecureSecrets: ['CJ_API_KEY', 'QUOTE_SIGNING_SECRET', 'CJ_QUOTE_PRODUCTS_JSON'],
    automaticActivation: false,
    finalBuyerZipRequiredPerSession: true,
    supplierOrderingEnabled: false,
    productCount: products.length,
    envValue: JSON.stringify({ products }),
    products,
  };
}

export async function main(source = 'growth-reports/quote-enable-candidates.json', destination = 'growth-reports/quote-runtime-config.json') {
  const handoff = JSON.parse(await fs.readFile(source, 'utf8'));
  const output = buildRuntimeConfig(handoff);
  await fs.mkdir('growth-reports', { recursive: true });
  await fs.writeFile(destination, JSON.stringify(output, null, 2) + '\n');
  console.log(JSON.stringify({ quoteRuntimeProducts: output.productCount, automaticActivation: false, finalBuyerZipRequiredPerSession: true }));
  return output;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
