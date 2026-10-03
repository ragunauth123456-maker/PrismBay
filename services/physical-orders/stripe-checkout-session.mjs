import { createHash } from 'node:crypto';

const MIN_SESSION_LIFETIME_SECONDS = 31 * 60;
const MAX_SESSION_LIFETIME_SECONDS = 24 * 60 * 60;

function text(value) { return String(value ?? '').trim(); }
function cents(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) throw new Error('A non-negative USD amount is required');
  return Math.round((n + Number.EPSILON) * 100);
}
function sha(value) { return createHash('sha256').update(String(value)).digest('hex'); }
function validateId(value, label, prefix) {
  const v = text(value);
  if (!v || v.length > 220 || (prefix && !v.startsWith(prefix))) throw new Error(`${label} is invalid`);
  return v;
}
function parseAging(value) {
  const matches = String(value || '').match(/\d+/g)?.map(Number).filter(n => Number.isInteger(n) && n > 0 && n <= 60) || [];
  if (!matches.length) return null;
  const minimum = Math.min(...matches);
  const maximum = Math.max(...matches);
  return { minimum: { unit: 'business_day', value: minimum }, maximum: { unit: 'business_day', value: maximum } };
}

export function buildStripeCheckoutSessionParams({
  quote,
  priceId,
  customerShippingChargeUsd,
  successUrl,
  cancelUrl,
  now = Date.now(),
  sessionLifetimeSeconds = MIN_SESSION_LIFETIME_SECONDS,
} = {}) {
  if (!quote?.approved) throw new Error('An approved quote assessment is required');
  const stripePriceId = validateId(priceId, 'Stripe price ID', 'price_');
  const quoteId = validateId(quote.quoteId, 'Quote ID');
  const sku = validateId(quote.sku, 'Store SKU');
  const variantSku = validateId(quote.variantSku, 'CJ variant SKU');
  const quantity = Number(quote.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 5) throw new Error('Approved quantity must be 1 to 5');
  if (quote.country !== 'US' || !/^\d{5}$/.test(text(quote.zip))) throw new Error('Approved US buyer ZIP is required');
  if (quote.finalDestinationFreight !== true || quote.freightScope !== 'buyer_destination_zip') throw new Error('Exact buyer-destination freight is required');
  if (quote.automaticSupplierOrdering !== false) throw new Error('Unsafe supplier-order authority detected');
  if (quote.shippingPolicyPass !== true) throw new Error('Shipping economics policy must pass');
  const shippingCents = cents(customerShippingChargeUsd);
  const supplierFreightCents = cents(quote.freightUsd);
  if (shippingCents > supplierFreightCents) throw new Error('Customer shipping charge cannot exceed verified supplier freight');
  const lifetime = Number(sessionLifetimeSeconds);
  if (!Number.isInteger(lifetime) || lifetime < MIN_SESSION_LIFETIME_SECONDS || lifetime > MAX_SESSION_LIFETIME_SECONDS) throw new Error('Checkout lifetime must be 31 minutes to 24 hours');
  const expiresAt = Math.floor(now / 1000) + lifetime;
  const destinationHash = sha(`US:${quote.zip}`);
  const deliveryEstimate = parseAging(quote.freightAging);
  const success = text(successUrl);
  const cancel = text(cancelUrl);
  if (!/^https:\/\//.test(success) || !/^https:\/\//.test(cancel)) throw new Error('HTTPS success and cancel URLs are required');

  const shippingRateData = {
    type: 'fixed_amount',
    fixed_amount: { amount: shippingCents, currency: 'usd' },
    display_name: 'Verified shipping',
    metadata: { quote_id: quoteId, sku, cj_variant_sku: variantSku },
    ...(deliveryEstimate ? { delivery_estimate: deliveryEstimate } : {}),
  };

  const metadata = {
    prismbay_flow: 'quote_gated_physical_v1',
    quote_id: quoteId,
    store_sku: sku,
    cj_variant_sku: variantSku,
    destination_hash: destinationHash,
    quote_requires_capture_revalidation: 'true',
    automatic_supplier_ordering: 'false',
  };

  return {
    mode: 'payment',
    ui_mode: 'hosted_page',
    origin_context: 'web',
    line_items: [{ price: stripePriceId, quantity }],
    payment_method_types: ['card'],
    payment_intent_data: {
      capture_method: 'manual',
      metadata,
    },
    shipping_address_collection: { allowed_countries: ['US'] },
    shipping_options: [{ shipping_rate_data: shippingRateData }],
    phone_number_collection: { enabled: true },
    allow_promotion_codes: false,
    customer_creation: 'if_required',
    client_reference_id: quoteId,
    metadata,
    custom_text: {
      shipping_address: { message: 'Shipping was quoted for the approved destination. Payment is authorized first and fulfillment availability is revalidated before capture.' },
      submit: { message: 'Your card may be authorized before final capture while PrismBay Clean revalidates stock and shipping.' },
    },
    expires_at: expiresAt,
    success_url: success,
    cancel_url: cancel,
  };
}

export async function createQuoteGatedCheckoutSession({ stripe, idempotencyKey, ...input } = {}) {
  if (!stripe?.checkout?.sessions?.create || typeof stripe.checkout.sessions.create !== 'function') throw new Error('Stripe Checkout client is required');
  const params = buildStripeCheckoutSessionParams(input);
  const key = text(idempotencyKey || input?.quote?.quoteId);
  if (!key || key.length > 255) throw new Error('Valid Stripe idempotency key is required');
  return stripe.checkout.sessions.create(params, { idempotencyKey: key });
}

export const __test = { parseAging, cents };
