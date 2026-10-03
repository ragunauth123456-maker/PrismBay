import test from 'node:test';
import assert from 'node:assert/strict';
import { computeEconomics, createQuoteService, issueQuoteToken, parseQuoteCatalog, verifyQuoteToken } from './shipping-quote.mjs';

const secret = 'x'.repeat(40);
const env = {
  CJ_API_KEY: 'test-key',
  QUOTE_SIGNING_SECRET: secret,
  QUOTE_TTL_SECONDS: '900',
  CJ_QUOTE_PRODUCTS_JSON: JSON.stringify({ products: [{
    sku: 'crevice',
    cjVariantId: 'VID-CREVICE-1',
    supplierCostUsd: 2,
    retailUsd: 19.99,
    originCountryCode: 'US',
    feeRatePct: 3.2,
    returnReservePct: 5,
    stripePaymentUrl: 'https://buy.stripe.com/test-crevice',
  }] }),
};

function fakeFetchFactory({ freight = 4.5, inventory = 100 } = {}) {
  const calls = [];
  const fetchImpl = async (url, options = {}) => {
    const text = String(url);
    calls.push({ url: text, method: options.method || 'GET', body: options.body || null });
    if (text.includes('/authentication/getAccessToken')) return { ok: true, json: async () => ({ data: { accessToken: 'token', accessTokenExpiryDate: '2099-01-01T00:00:00Z' } }) };
    if (text.includes('/product/stock/queryByVid')) return { ok: true, json: async () => ({ data: [{ vid: 'VID-CREVICE-1', countryCode: 'US', cjInventoryNum: inventory }] }) };
    if (text.includes('/logistic/freightCalculate')) return { ok: true, json: async () => ({ data: [{ logisticName: 'USPS', logisticPrice: freight, logisticAging: '5-8 days' }] }) };
    throw new Error('unexpected upstream call');
  };
  return { fetchImpl, calls };
}

test('catalog only accepts fully specified quote products and Stripe-hosted checkout URLs', () => {
  const catalog = parseQuoteCatalog(env);
  assert.equal(catalog.size, 1);
  assert.equal(catalog.get('crevice').variantId, 'VID-CREVICE-1');
  assert.match(catalog.get('crevice').stripePaymentUrl, /^https:\/\/buy\.stripe\.com\//);
  const bad = parseQuoteCatalog({ ...env, CJ_QUOTE_PRODUCTS_JSON: JSON.stringify({ products: [{ sku: 'x', cjVariantId: 'v', supplierCostUsd: 1, retailUsd: 10, stripePaymentUrl: 'https://evil.example/pay' }] }) });
  assert.equal(bad.size, 0);
});

test('economics fail closed when shipping destroys contribution', () => {
  const product = parseQuoteCatalog(env).get('crevice');
  const result = computeEconomics({ product, quantity: 1, freightUsd: 15 });
  assert.equal(result.approved, false);
  assert.equal(result.reason, 'commercial_thresholds_failed');
});

test('valid buyer ZIP can receive a signed checkout quote when stock and economics pass', async () => {
  const { fetchImpl, calls } = fakeFetchFactory();
  const service = createQuoteService({ env, fetchImpl, now: () => 1_800_000_000_000 });
  const result = await service.quote({ sku: 'crevice', zip: '10001', quantity: 1 });
  assert.equal(result.ok, true);
  assert.equal(result.checkoutAllowed, true);
  assert.equal(result.finalDestinationVerified, true);
  assert.equal(result.shipping.usd, 4.5);
  assert.match(result.quoteToken, /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  const freightCall = calls.find(x => x.url.includes('/logistic/freightCalculate'));
  assert.ok(freightCall);
  assert.equal(JSON.parse(freightCall.body).zip, '10001');
  assert.equal(calls.some(x => /order|pay/i.test(new URL(x.url).pathname)), false);

  const checkout = service.authorizeCheckout({ quoteToken: result.quoteToken, zip: '10001' });
  assert.equal(checkout.checkoutAllowed, true);
  assert.equal(checkout.paymentUrl, 'https://buy.stripe.com/test-crevice');
  assert.equal(checkout.supplierOrderingEnabled, false);
});

test('signed quote cannot be reused for another ZIP or after expiry', () => {
  const now = 1_800_000_000_000;
  const token = issueQuoteToken({ sku: 'crevice', quantity: 1, zip: '10001', freightUsd: 4, economics: { contributionUsd: 9 }, secret, ttlSeconds: 60, now });
  assert.equal(verifyQuoteToken({ token, zip: '10001', secret, now }).valid, true);
  assert.equal(verifyQuoteToken({ token, zip: '90210', secret, now }).reason, 'quote_destination_mismatch');
  assert.equal(verifyQuoteToken({ token, zip: '10001', secret, now: now + 61_000 }).reason, 'quote_expired');
});

test('quote refuses unregistered SKU and invalid ZIP before supplier calls', async () => {
  const { fetchImpl, calls } = fakeFetchFactory();
  const service = createQuoteService({ env, fetchImpl });
  assert.deepEqual(await service.quote({ sku: 'unknown', zip: '10001' }), { ok: false, status: 404, error: 'sku_not_quote_enabled' });
  assert.deepEqual(await service.quote({ sku: 'crevice', zip: 'ABC' }), { ok: false, status: 400, error: 'invalid_quote_request' });
  assert.equal(calls.length, 0);
});

test('quote refuses checkout when origin inventory is insufficient', async () => {
  const { fetchImpl } = fakeFetchFactory({ inventory: 0 });
  const service = createQuoteService({ env, fetchImpl });
  const result = await service.quote({ sku: 'crevice', zip: '10001', quantity: 1 });
  assert.equal(result.checkoutAllowed, undefined);
  assert.equal(result.error, 'verified_origin_stock_unavailable');
});

test('signed quote token enforces minimum secret length', () => {
  assert.throws(() => issueQuoteToken({ sku: 'crevice', quantity: 1, zip: '10001', freightUsd: 4, economics: { contributionUsd: 9 }, secret: 'short' }), /32 characters/);
});
