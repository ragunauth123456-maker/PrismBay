import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRuntimeConfig } from './build-quote-runtime-config.mjs';

const verified = {
  checkedAt: '2026-10-03T16:00:00Z',
  quoteProducts: [{
    sku: 'crevice', cjVariantId: 'VID-1', supplierCostUsd: 1.75, retailUsd: 12.95,
    originCountryCode: 'US', feeRatePct: 3.2, returnReservePct: 5,
    stripePaymentUrl: 'https://buy.stripe.com/test',
    freightBudget: { maxFreightUsd: 5 },
    evidence: {
      supplierIdentityVerified: true, variantInventoryVerified: true,
      screeningFreightVerified: true, checkoutInfrastructureVerified: true,
      finalBuyerZipVerified: false,
    },
    activationAllowed: false,
  }],
};

test('verified handoff becomes runtime env candidate without auto activation', () => {
  const out = buildRuntimeConfig(verified);
  assert.equal(out.productCount, 1);
  assert.equal(out.automaticActivation, false);
  assert.equal(out.finalBuyerZipRequiredPerSession, true);
  assert.equal(out.supplierOrderingEnabled, false);
  const parsed = JSON.parse(out.envValue);
  assert.equal(parsed.products[0].sku, 'crevice');
  assert.equal(parsed.products[0].cjVariantId, 'VID-1');
  assert.deepEqual(out.requiresSecureSecrets, ['CJ_API_KEY', 'QUOTE_SIGNING_SECRET', 'CJ_QUOTE_PRODUCTS_JSON']);
});

test('unverified or auto-activated rows are excluded', () => {
  const bad = structuredClone(verified);
  bad.quoteProducts[0].evidence.variantInventoryVerified = false;
  assert.equal(buildRuntimeConfig(bad).productCount, 0);
  const bad2 = structuredClone(verified);
  bad2.quoteProducts[0].activationAllowed = true;
  assert.equal(buildRuntimeConfig(bad2).productCount, 0);
});

test('non-Stripe checkout URLs are excluded', () => {
  const bad = structuredClone(verified);
  bad.quoteProducts[0].stripePaymentUrl = 'https://example.com/pay';
  assert.equal(buildRuntimeConfig(bad).productCount, 0);
});
