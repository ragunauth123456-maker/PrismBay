import test from 'node:test';
import assert from 'node:assert/strict';
import { checkoutEconomics, evaluateCheckoutQuote, issueCheckoutPermit, verifyCheckoutPermit } from './checkout-quote-gate.mjs';

const NOW = Date.parse('2026-10-03T16:00:00Z');
const SECRET = '0123456789abcdef0123456789abcdef0123456789abcdef';

function validQuote(overrides = {}) {
  return {
    sku: 'crevice',
    variantId: 'cj-variant-123',
    quantity: 1,
    country: 'US',
    zip: '10001',
    supplierVariantVerified: true,
    inventoryVerified: true,
    inventory: 100,
    priceVerified: true,
    checkoutInfrastructureVerified: true,
    commercialAuthorizationVerified: true,
    listingRightsVerified: true,
    finalDestinationFreight: true,
    freightScope: 'buyer_destination_zip',
    freightQuotedAt: new Date(NOW - 2 * 60 * 1000).toISOString(),
    stockVerifiedAt: new Date(NOW - 5 * 60 * 1000).toISOString(),
    retailUsd: 15,
    productCostUsd: 2,
    freightUsd: 3,
    feeRatePct: 3,
    ...overrides,
  };
}

test('economics gate applies contribution and landed-cost thresholds', () => {
  const pass = checkoutEconomics({ retailUsd: 15, productCostUsd: 2, freightUsd: 3, feeRatePct: 3 });
  assert.equal(pass.verified, true);
  assert.equal(pass.pass, true);
  assert.equal(pass.contributionUsd, 8.8);

  const fail = checkoutEconomics({ retailUsd: 10, productCostUsd: 4, freightUsd: 4, feeRatePct: 3 });
  assert.equal(fail.pass, false);
});

test('approved quote requires exact destination freight and every commercial gate', () => {
  const approved = evaluateCheckoutQuote(validQuote(), NOW);
  assert.equal(approved.approved, true);
  assert.deepEqual(approved.reasons, []);
  assert.equal(approved.globalCheckoutUnlock, false);
  assert.equal(approved.automaticSupplierOrdering, false);

  const countryEstimateOnly = evaluateCheckoutQuote(validQuote({ finalDestinationFreight: false, freightScope: 'country_estimate' }), NOW);
  assert.equal(countryEstimateOnly.approved, false);
  assert.ok(countryEstimateOnly.reasons.includes('exact_buyer_destination_freight_required'));
});

test('stale stock, stale freight, or low margin blocks checkout', () => {
  const staleFreight = evaluateCheckoutQuote(validQuote({ freightQuotedAt: new Date(NOW - 11 * 60 * 1000).toISOString() }), NOW);
  assert.ok(staleFreight.reasons.includes('fresh_freight_quote_required'));

  const staleStock = evaluateCheckoutQuote(validQuote({ stockVerifiedAt: new Date(NOW - 31 * 60 * 1000).toISOString() }), NOW);
  assert.ok(staleStock.reasons.includes('fresh_stock_verification_required'));

  const lowMargin = evaluateCheckoutQuote(validQuote({ retailUsd: 10, productCostUsd: 4, freightUsd: 4 }), NOW);
  assert.ok(lowMargin.reasons.includes('commercial_thresholds_fail'));
});

test('permit is scoped to exact SKU, buyer session, destination and short lifetime', () => {
  const assessment = evaluateCheckoutQuote(validQuote(), NOW);
  const permit = issueCheckoutPermit({ assessment, sessionId: 'buyer-session-abc-123', secret: SECRET, now: NOW, ttlMs: 5 * 60 * 1000 });

  const verified = verifyCheckoutPermit({ token: permit.token, sessionId: 'buyer-session-abc-123', country: 'US', zip: '10001', sku: 'crevice', secret: SECRET, now: NOW + 60 * 1000 });
  assert.equal(verified.valid, true);
  assert.equal(verified.sku, 'crevice');
  assert.equal(verified.variantId, 'cj-variant-123');

  assert.equal(verifyCheckoutPermit({ token: permit.token, sessionId: 'other-session-abc-123', country: 'US', zip: '10001', sku: 'crevice', secret: SECRET, now: NOW + 60 * 1000 }).reason, 'session_scope_mismatch');
  assert.equal(verifyCheckoutPermit({ token: permit.token, sessionId: 'buyer-session-abc-123', country: 'US', zip: '90210', sku: 'crevice', secret: SECRET, now: NOW + 60 * 1000 }).reason, 'destination_scope_mismatch');
  assert.equal(verifyCheckoutPermit({ token: permit.token, sessionId: 'buyer-session-abc-123', country: 'US', zip: '10001', sku: 'pethair', secret: SECRET, now: NOW + 60 * 1000 }).reason, 'sku_scope_mismatch');
  assert.equal(verifyCheckoutPermit({ token: permit.token, sessionId: 'buyer-session-abc-123', country: 'US', zip: '10001', sku: 'crevice', secret: SECRET, now: NOW + 6 * 60 * 1000 }).reason, 'expired_permit');
});

test('tampering invalidates permit signature', () => {
  const assessment = evaluateCheckoutQuote(validQuote(), NOW);
  const permit = issueCheckoutPermit({ assessment, sessionId: 'buyer-session-abc-123', secret: SECRET, now: NOW });
  const [payload, signature] = permit.token.split('.');
  const tampered = `${payload.slice(0, -1)}${payload.endsWith('A') ? 'B' : 'A'}.${signature}`;
  const result = verifyCheckoutPermit({ token: tampered, sessionId: 'buyer-session-abc-123', country: 'US', zip: '10001', sku: 'crevice', secret: SECRET, now: NOW + 1000 });
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'invalid_permit_signature');
});
