import test from 'node:test';
import assert from 'node:assert/strict';
import { DIGITAL_CHECKOUT_TOKENS, PHYSICAL_PRODUCTS, validatePaidStore, validateScorecard, validatePhysicalStore, validateCatalog } from './revenue-health-check.mjs';

test('paid store requires every configured digital checkout token and customer policy routes', () => {
  const html = 'x'.repeat(6100) + DIGITAL_CHECKOUT_TOKENS.join(' ') + ' www.prismbayai.com/refunds www.prismbayai.com/contact';
  assert.deepEqual(validatePaidStore(html).checkoutLinks, 4);
  assert.throws(() => validatePaidStore(html.replace(DIGITAL_CHECKOUT_TOKENS[2], 'missing')), /paid_store_invalid/);
  assert.throws(() => validatePaidStore(html.replace('www.prismbayai.com/refunds', '')), /paid_store_invalid/);
});

test('free assessment remains visibly no-paywall and wired to its client script', () => {
  const html = 'Free AI Vendor Evidence Check No login or paywall scorecard-ui.mjs';
  assert.doesNotThrow(() => validateScorecard(html));
  assert.throws(() => validateScorecard(html.replace('No login or paywall', '')), /scorecard_invalid/);
});

test('physical storefront must show all nine products and the supplier-verification safety boundary', () => {
  const html = PHYSICAL_PRODUCTS.join(' ') + ' Supplier stock and final delivery route are reconfirmed before fulfillment';
  assert.equal(validatePhysicalStore(html).productsVisible, 9);
  assert.throws(() => validatePhysicalStore(html.replace(PHYSICAL_PRODUCTS[0], '')), /physical_store_invalid/);
  assert.throws(() => validatePhysicalStore(PHYSICAL_PRODUCTS.join(' ')), /safety_copy_missing/);
});

test('catalog rejects stale, incomplete and duplicate public attention data', () => {
  const now = Date.parse('2026-09-25T20:00:00Z');
  const base = {
    updatedAt: '2026-09-25T19:00:00Z',
    products: Array.from({length: 9}, (_, i) => ({ slug: 'p' + i, signalScore: 10 - i })),
  };
  assert.equal(validateCatalog(base, now).products, 9);
  assert.throws(() => validateCatalog({...base, updatedAt:'2026-09-23T00:00:00Z'}, now), /catalog_stale/);
  assert.throws(() => validateCatalog({...base, products:base.products.slice(0,8)}, now), /catalog_incomplete/);
  assert.throws(() => validateCatalog({...base, products:[...base.products.slice(0,8), base.products[0]]}, now), /duplicate_slugs/);
});
