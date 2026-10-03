import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStripeCheckoutSessionParams, createQuoteGatedCheckoutSession } from './stripe-checkout-session.mjs';

const NOW = Date.parse('2026-10-03T17:00:00Z');

function approvedQuote(overrides = {}) {
  return {
    approved: true,
    quoteId: 'quote-1234567890',
    sku: 'crevice',
    variantSku: 'CJJT173147702BY',
    quantity: 1,
    country: 'US',
    zip: '10001',
    freightUsd: 6.31,
    freightAging: '5-11',
    freightScope: 'buyer_destination_zip',
    finalDestinationFreight: true,
    shippingPolicyPass: true,
    automaticSupplierOrdering: false,
    ...overrides,
  };
}

test('builds hosted manual-capture checkout with verified shipping and no promotions', () => {
  const params = buildStripeCheckoutSessionParams({
    quote: approvedQuote(),
    priceId: 'price_1UHk2FKDLFBMHojQFIuweqrA',
    customerShippingChargeUsd: 1.96,
    successUrl: 'https://example.com/order-received?session_id={CHECKOUT_SESSION_ID}',
    cancelUrl: 'https://example.com/crevice/?checkout=cancelled',
    now: NOW,
  });
  assert.equal(params.mode, 'payment');
  assert.equal(params.ui_mode, 'hosted_page');
  assert.deepEqual(params.payment_method_types, ['card']);
  assert.equal(params.payment_intent_data.capture_method, 'manual');
  assert.equal(params.allow_promotion_codes, false);
  assert.deepEqual(params.shipping_address_collection.allowed_countries, ['US']);
  assert.equal(params.shipping_options[0].shipping_rate_data.fixed_amount.amount, 196);
  assert.equal(params.shipping_options[0].shipping_rate_data.fixed_amount.currency, 'usd');
  assert.equal(params.shipping_options[0].shipping_rate_data.delivery_estimate.minimum.value, 5);
  assert.equal(params.shipping_options[0].shipping_rate_data.delivery_estimate.maximum.value, 11);
  assert.equal(params.line_items[0].price, 'price_1UHk2FKDLFBMHojQFIuweqrA');
  assert.equal(params.line_items[0].quantity, 1);
  assert.equal(params.metadata.automatic_supplier_ordering, 'false');
  assert.equal(params.metadata.quote_requires_capture_revalidation, 'true');
  assert.notEqual(params.metadata.destination_hash, '10001');
  assert.equal(params.expires_at, Math.floor(NOW / 1000) + 31 * 60);
});

test('rejects unapproved, country-only, unsafe, discounted-economics or shipping-markup routes', () => {
  const common = {
    priceId: 'price_1UHk2FKDLFBMHojQFIuweqrA',
    customerShippingChargeUsd: 1.96,
    successUrl: 'https://example.com/success',
    cancelUrl: 'https://example.com/cancel',
    now: NOW,
  };
  assert.throws(() => buildStripeCheckoutSessionParams({ ...common, quote: approvedQuote({ approved: false }) }), /approved quote/);
  assert.throws(() => buildStripeCheckoutSessionParams({ ...common, quote: approvedQuote({ finalDestinationFreight: false, freightScope: 'country_estimate' }) }), /Exact buyer-destination freight/);
  assert.throws(() => buildStripeCheckoutSessionParams({ ...common, quote: approvedQuote({ automaticSupplierOrdering: true }) }), /Unsafe supplier-order/);
  assert.throws(() => buildStripeCheckoutSessionParams({ ...common, quote: approvedQuote({ shippingPolicyPass: false }) }), /Shipping economics policy/);
  assert.throws(() => buildStripeCheckoutSessionParams({ ...common, quote: approvedQuote(), customerShippingChargeUsd: 6.32 }), /cannot exceed verified supplier freight/);
});

test('session lifetime cannot undercut Stripe hosted Checkout minimum', () => {
  assert.throws(() => buildStripeCheckoutSessionParams({
    quote: approvedQuote(),
    priceId: 'price_1UHk2FKDLFBMHojQFIuweqrA',
    customerShippingChargeUsd: 2,
    successUrl: 'https://example.com/success',
    cancelUrl: 'https://example.com/cancel',
    now: NOW,
    sessionLifetimeSeconds: 10 * 60,
  }), /31 minutes/);
});

test('creator uses quote id as idempotency key and never creates payment for a rejected quote', async () => {
  const calls = [];
  const stripe = { checkout: { sessions: { create: async (params, options) => { calls.push({ params, options }); return { id: 'cs_test_123', url: 'https://checkout.stripe.com/c/pay/test' }; } } } };
  const session = await createQuoteGatedCheckoutSession({
    stripe,
    quote: approvedQuote(),
    priceId: 'price_1UHk2FKDLFBMHojQFIuweqrA',
    customerShippingChargeUsd: 2,
    successUrl: 'https://example.com/success',
    cancelUrl: 'https://example.com/cancel',
    now: NOW,
  });
  assert.equal(session.id, 'cs_test_123');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].options.idempotencyKey, 'quote-1234567890');

  await assert.rejects(() => createQuoteGatedCheckoutSession({
    stripe,
    quote: approvedQuote({ approved: false }),
    priceId: 'price_1UHk2FKDLFBMHojQFIuweqrA',
    customerShippingChargeUsd: 2,
    successUrl: 'https://example.com/success',
    cancelUrl: 'https://example.com/cancel',
    now: NOW,
  }), /approved quote/);
  assert.equal(calls.length, 1);
});
