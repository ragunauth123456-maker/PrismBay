import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { computeEconomics, createQuoteService, issueQuoteToken, parseQuoteCatalog, verifyQuoteToken } from './shipping-quote.mjs';
import { createLedgerQuoteConsumer } from './quote-replay.mjs';
import { openLedger } from './ledger.mjs';

const secret = 'x'.repeat(40);
const env = {
  CJ_API_KEY: 'test-key',
  QUOTE_SIGNING_SECRET: secret,
  QUOTE_TTL_SECONDS: '900',
  CJ_QUOTE_PRODUCTS_JSON: JSON.stringify({ products: [{
    sku: 'crevice', cjVariantId: 'VID-CREVICE-1', supplierCostUsd: 2, retailUsd: 19.99,
    originCountryCode: 'US', feeRatePct: 3.2, returnReservePct: 5,
    stripePaymentUrl: 'https://buy.stripe.com/test-crevice',
  }] }),
};

function response(data) { return { ok: true, status: 200, json: async () => data }; }
function fakeFetchFactory({ freight = 4.5, tipFreight = 3.75, inventory = 100, inventorySequence = null, tipEnabled = true, routeState = {} } = {}) {
  const calls = [];
  let stockCall = 0;
  const fetchImpl = async (url, options = {}) => {
    const text = String(url);
    calls.push({ url: text, method: options.method || 'GET', body: options.body || null });
    if (text.includes('/authentication/getAccessToken')) return response({ data: { accessToken: 'token', accessTokenExpiryDate: '2099-01-01T00:00:00Z' } });
    if (text.includes('/product/stock/queryByVid')) {
      const vid = new URL(text).searchParams.get('vid');
      if (routeState[vid]) return response({ data: [{ vid, countryCode: routeState[vid].country || 'US', cjInventoryNum: routeState[vid].inventory ?? 100 }] });
      const current = Array.isArray(inventorySequence) ? inventorySequence[Math.min(stockCall++, inventorySequence.length - 1)] : inventory;
      return response({ data: [{ vid: 'VID-CREVICE-1', countryCode: 'US', cjInventoryNum: current }] });
    }
    if (text.includes('/product/variant/queryByVid')) {
      const vid = new URL(text).searchParams.get('vid');
      return response({ data: { vid, pid: `PID-${vid}`, variantSku: `SKU-${vid}`, variantWeight: 100, variantVolume: 100000 } });
    }
    if (text.includes('/product/query')) return response({ data: { productProEnSet: ['COMMON'], packingWeight: '120', productType: 0 } });
    if (text.includes('/logistic/freightCalculateTip')) {
      const body = JSON.parse(options.body || '{}');
      const sku = body?.reqDTOS?.[0]?.skuList?.[0] || '';
      const vid = sku.replace(/^SKU-/, '');
      const route = routeState[vid];
      const price = route?.tipFreight ?? tipFreight;
      return response({ data: (route?.tipEnabled ?? tipEnabled) ? [{ totalPostageFee: price, option: { enName: 'CJPacket Accurate' }, arrivalTime: '5-8 days' }] : [] });
    }
    if (text.includes('/logistic/freightCalculate')) {
      const body = JSON.parse(options.body || '{}');
      const vid = body?.products?.[0]?.vid;
      const price = routeState[vid]?.freight ?? freight;
      return response({ data: [{ logisticName: 'USPS Simple', logisticPrice: price, logisticAging: '5-8 days' }] });
    }
    throw new Error(`unexpected upstream call: ${text}`);
  };
  return { fetchImpl, calls };
}

test('catalog accepts legacy single route and fingerprints commercial config', () => {
  const catalog = parseQuoteCatalog(env);
  assert.equal(catalog.size, 1);
  assert.equal(catalog.get('crevice').routes.length, 1);
  assert.equal(catalog.get('crevice').variantId, 'VID-CREVICE-1');
  assert.match(catalog.get('crevice').catalogFingerprint, /^[A-Za-z0-9_-]{32,100}$/);
});

test('economics fail closed when shipping destroys contribution', () => {
  const product = parseQuoteCatalog(env).get('crevice');
  assert.equal(computeEconomics({ product, quantity: 1, freightUsd: 15 }).approved, false);
});

test('quote prefers accurate Freight Calculation Tip and revalidates before checkout', async () => {
  const { fetchImpl, calls } = fakeFetchFactory();
  const consumed = new Set();
  const service = createQuoteService({ env, fetchImpl, now: () => 1_800_000_000_000, consumeQuoteOnce: async ({ jti }) => consumed.has(jti) ? false : (consumed.add(jti), true) });
  const quote = await service.quote({ sku: 'crevice', zip: '10001', quantity: 1 });
  assert.equal(quote.checkoutAllowed, true);
  assert.equal(quote.shipping.usd, 3.75);
  assert.equal(quote.shippingEvidence.source, 'zip_tip');
  const checkout = await service.authorizeCheckout({ quoteToken: quote.quoteToken, zip: '10001' });
  assert.equal(checkout.checkoutAllowed, true);
  assert.equal(checkout.shippingRevalidatedAtCheckout, true);
  assert.equal(checkout.economicsRevalidatedAtCheckout, true);
  assert.equal(calls.some(x => /shopping\/order|shopping\/pay/i.test(new URL(x.url).pathname)), false);
  assert.equal((await service.authorizeCheckout({ quoteToken: quote.quoteToken, zip: '10001' })).error, 'quote_already_used');
});

test('simple ZIP freight remains a labeled fallback', async () => {
  const { fetchImpl } = fakeFetchFactory({ tipEnabled: false, freight: 4.5 });
  const service = createQuoteService({ env, fetchImpl, now: () => 1_800_000_000_000 });
  const result = await service.quote({ sku: 'crevice', zip: '90210', quantity: 1 });
  assert.equal(result.shippingEvidence.source, 'zip_simple_fallback');
  assert.equal(result.shippingEvidence.fallbackUsed, true);
});

test('multi-route portfolio fails over from out-of-stock primary to approved backup', async () => {
  const multiEnv = { ...env, CJ_QUOTE_PRODUCTS_JSON: JSON.stringify({ products: [{
    sku: 'crevice', retailUsd: 19.99, feeRatePct: 3.2, returnReservePct: 5, stripePaymentUrl: 'https://buy.stripe.com/test-crevice',
    routes: [
      { routeId: 'primary', cjVariantId: 'VID-A', supplierCostUsd: 2, originCountryCode: 'US' },
      { routeId: 'backup', cjVariantId: 'VID-B', supplierCostUsd: 2.5, originCountryCode: 'US' }
    ]
  }] }) };
  const { fetchImpl } = fakeFetchFactory({ routeState: { 'VID-A': { inventory: 0, tipFreight: 2 }, 'VID-B': { inventory: 100, tipFreight: 3 } } });
  const service = createQuoteService({ env: multiEnv, fetchImpl, now: () => 1_800_000_000_000 });
  const quote = await service.quote({ sku: 'crevice', zip: '10001', quantity: 1 });
  assert.equal(quote.checkoutAllowed, true);
  assert.equal(quote.supplierPortfolio.routesChecked, 2);
  assert.equal(quote.supplierPortfolio.selectedRouteId, 'backup');
});

test('multi-route portfolio chooses stronger approved economics when both routes are live', async () => {
  const multiEnv = { ...env, CJ_QUOTE_PRODUCTS_JSON: JSON.stringify({ products: [{
    sku: 'crevice', retailUsd: 24.99, stripePaymentUrl: 'https://buy.stripe.com/test-crevice',
    routes: [
      { routeId: 'expensive', cjVariantId: 'VID-A', supplierCostUsd: 5, originCountryCode: 'US' },
      { routeId: 'efficient', cjVariantId: 'VID-B', supplierCostUsd: 2, originCountryCode: 'US' }
    ]
  }] }) };
  const { fetchImpl } = fakeFetchFactory({ routeState: { 'VID-A': { inventory: 100, tipFreight: 5 }, 'VID-B': { inventory: 100, tipFreight: 3 } } });
  const service = createQuoteService({ env: multiEnv, fetchImpl, now: () => 1_800_000_000_000 });
  const quote = await service.quote({ sku: 'crevice', zip: '10001', quantity: 1 });
  assert.equal(quote.checkoutAllowed, true);
  assert.equal(quote.supplierPortfolio.selectedRouteId, 'efficient');
  assert.ok(quote.economics.contributionUsd > 10);
});

test('portfolio blocks checkout when every supplier route is unavailable', async () => {
  const multiEnv = { ...env, CJ_QUOTE_PRODUCTS_JSON: JSON.stringify({ products: [{
    sku: 'crevice', retailUsd: 19.99, stripePaymentUrl: 'https://buy.stripe.com/test-crevice',
    routes: [
      { routeId: 'a', cjVariantId: 'VID-A', supplierCostUsd: 2, originCountryCode: 'US' },
      { routeId: 'b', cjVariantId: 'VID-B', supplierCostUsd: 2, originCountryCode: 'US' }
    ]
  }] }) };
  const { fetchImpl } = fakeFetchFactory({ routeState: { 'VID-A': { inventory: 0 }, 'VID-B': { inventory: 0 } } });
  const service = createQuoteService({ env: multiEnv, fetchImpl });
  const result = await service.quote({ sku: 'crevice', zip: '10001', quantity: 1 });
  assert.equal(result.error, 'no_viable_supplier_route');
  assert.equal(result.supplierRoutesChecked, 2);
});

test('signed quote cannot be reused for another ZIP or after expiry', () => {
  const now = 1_800_000_000_000;
  const fingerprint = parseQuoteCatalog(env).get('crevice').catalogFingerprint;
  const token = issueQuoteToken({ sku: 'crevice', quantity: 1, zip: '10001', freightUsd: 4, economics: { contributionUsd: 9 }, catalogFingerprint: fingerprint, secret, ttlSeconds: 60, now, nonce: 'abcdefghijklmnop1234' });
  assert.equal(verifyQuoteToken({ token, zip: '10001', secret, now }).valid, true);
  assert.equal(verifyQuoteToken({ token, zip: '90210', secret, now }).reason, 'quote_destination_mismatch');
  assert.equal(verifyQuoteToken({ token, zip: '10001', secret, now: now + 61_000 }).reason, 'quote_expired');
});

test('catalog change invalidates quote before checkout URL release', async () => {
  const now = () => 1_800_000_000_000;
  const { fetchImpl } = fakeFetchFactory();
  const original = createQuoteService({ env, fetchImpl, now });
  const quote = await original.quote({ sku: 'crevice', zip: '10001', quantity: 1 });
  const changedEnv = { ...env, CJ_QUOTE_PRODUCTS_JSON: JSON.stringify({ products: [{ sku: 'crevice', cjVariantId: 'VID-CREVICE-1', supplierCostUsd: 2, retailUsd: 17.99, originCountryCode: 'US', stripePaymentUrl: 'https://buy.stripe.com/test-crevice' }] }) };
  const changed = createQuoteService({ env: changedEnv, fetchImpl, now });
  assert.equal((await changed.authorizeCheckout({ quoteToken: quote.quoteToken, zip: '10001' })).error, 'quote_catalog_changed');
});

test('quote refuses invalid requests before supplier calls', async () => {
  const { fetchImpl, calls } = fakeFetchFactory();
  const service = createQuoteService({ env, fetchImpl });
  assert.deepEqual(await service.quote({ sku: 'unknown', zip: '10001' }), { ok: false, status: 404, error: 'sku_not_quote_enabled' });
  assert.deepEqual(await service.quote({ sku: 'crevice', zip: 'ABC' }), { ok: false, status: 400, error: 'invalid_quote_request' });
  assert.equal(calls.length, 0);
});

test('ledger-backed one-time quote consumption survives restart', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'quote-replay-test-'));
  try {
    let ledger = await openLedger(dir);
    const first = createLedgerQuoteConsumer(ledger, () => 1_000_000);
    const quote = { jti: 'abcdefghijklmnop1234', exp: 5000 };
    assert.equal(await first(quote), true);
    assert.equal(await first(quote), false);
    await ledger.close();
    ledger = await openLedger(dir);
    assert.equal(await createLedgerQuoteConsumer(ledger, () => 1_000_000)(quote), false);
    await ledger.close();
  } finally { await rm(dir, { recursive: true, force: true }); }
});
