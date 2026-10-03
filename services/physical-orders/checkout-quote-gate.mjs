import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

const DEFAULT_QUOTE_TTL_MS = 15 * 60 * 1000;
const MAX_FREIGHT_AGE_MS = 10 * 60 * 1000;
const MAX_STOCK_AGE_MS = 30 * 60 * 1000;

function number(value) {
  if (value === null || value === undefined || typeof value === 'boolean' || String(value).trim() === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function positive(value) {
  const n = number(value);
  return n !== null && n > 0 ? n : null;
}

function nonNegative(value) {
  const n = number(value);
  return n !== null && n >= 0 ? n : null;
}

function parseTime(value) {
  const t = Date.parse(String(value || ''));
  return Number.isFinite(t) ? t : null;
}

function digest(value) {
  return createHash('sha256').update(String(value)).digest('base64url');
}

function sign(payload, secret) {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

function validSecret(secret) {
  return typeof secret === 'string' && secret.length >= 32;
}

export function validateDestination(country, zip) {
  const c = String(country || '').trim().toUpperCase();
  const z = String(zip || '').trim();
  return { country: c, zip: z, valid: c === 'US' && /^\d{5}$/.test(z) };
}

export function checkoutEconomics(input = {}) {
  const retailUsd = positive(input.retailUsd);
  const productCostUsd = nonNegative(input.productCostUsd);
  const freightUsd = nonNegative(input.freightUsd);
  const feeRatePct = nonNegative(input.feeRatePct);
  if (retailUsd === null || productCostUsd === null || freightUsd === null || feeRatePct === null) {
    return { verified: false, pass: false, reason: 'complete_verified_unit_economics_required' };
  }
  const landedCostUsd = productCostUsd + freightUsd;
  const feesUsd = retailUsd * feeRatePct / 100;
  const returnsReserveUsd = retailUsd * 0.05;
  const contributionUsd = retailUsd - landedCostUsd - feesUsd - returnsReserveUsd;
  const contributionPct = contributionUsd / retailUsd * 100;
  const landedPct = landedCostUsd / retailUsd * 100;
  const pass = contributionUsd >= 3 && contributionPct >= 25 && landedPct <= 55;
  return {
    verified: true,
    pass,
    retailUsd: +retailUsd.toFixed(2),
    productCostUsd: +productCostUsd.toFixed(2),
    freightUsd: +freightUsd.toFixed(2),
    feeRatePct: +feeRatePct.toFixed(2),
    landedCostUsd: +landedCostUsd.toFixed(2),
    feesUsd: +feesUsd.toFixed(2),
    returnsReserveUsd: +returnsReserveUsd.toFixed(2),
    contributionUsd: +contributionUsd.toFixed(2),
    contributionPct: +contributionPct.toFixed(1),
    landedPct: +landedPct.toFixed(1),
    reason: pass ? 'commercial_thresholds_pass' : 'commercial_thresholds_fail',
  };
}

export function evaluateCheckoutQuote(input = {}, now = Date.now()) {
  const reasons = [];
  const destination = validateDestination(input.country, input.zip);
  const quantity = Number(input.quantity);
  const inventory = Number(input.inventory);
  const freightQuotedAt = parseTime(input.freightQuotedAt);
  const stockVerifiedAt = parseTime(input.stockVerifiedAt);
  const sku = String(input.sku || '').trim();
  const variantId = String(input.variantId || '').trim();

  if (!sku || sku.length > 120) reasons.push('valid_store_sku_required');
  if (!variantId || variantId.length > 220) reasons.push('verified_supplier_variant_required');
  if (!destination.valid) reasons.push('supported_buyer_destination_required');
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 5) reasons.push('quantity_out_of_scope');
  if (input.supplierVariantVerified !== true) reasons.push('supplier_variant_not_verified');
  if (input.inventoryVerified !== true || !Number.isFinite(inventory) || inventory < quantity) reasons.push('verified_inventory_insufficient');
  if (input.priceVerified !== true) reasons.push('retail_price_not_verified');
  if (input.checkoutInfrastructureVerified !== true) reasons.push('checkout_infrastructure_not_verified');
  if (input.commercialAuthorizationVerified !== true) reasons.push('commercial_authorization_not_verified');
  if (input.listingRightsVerified !== true) reasons.push('listing_rights_not_verified');
  if (input.finalDestinationFreight !== true || input.freightScope !== 'buyer_destination_zip') reasons.push('exact_buyer_destination_freight_required');
  if (freightQuotedAt === null || freightQuotedAt > now || now - freightQuotedAt > MAX_FREIGHT_AGE_MS) reasons.push('fresh_freight_quote_required');
  if (stockVerifiedAt === null || stockVerifiedAt > now || now - stockVerifiedAt > MAX_STOCK_AGE_MS) reasons.push('fresh_stock_verification_required');

  const economics = checkoutEconomics({
    retailUsd: input.retailUsd,
    productCostUsd: input.productCostUsd,
    freightUsd: input.freightUsd,
    feeRatePct: input.feeRatePct,
  });
  if (!economics.verified || !economics.pass) reasons.push(economics.reason);

  return {
    approved: reasons.length === 0,
    reasons: [...new Set(reasons)],
    sku: sku || null,
    variantId: variantId || null,
    quantity: Number.isInteger(quantity) ? quantity : null,
    destination: destination.valid ? { country: destination.country, zip: destination.zip } : null,
    inventory: Number.isFinite(inventory) ? inventory : null,
    economics,
    automaticSupplierOrdering: false,
    globalCheckoutUnlock: false,
  };
}

export function issueCheckoutPermit({ assessment, sessionId, secret, now = Date.now(), ttlMs = DEFAULT_QUOTE_TTL_MS } = {}) {
  if (!assessment?.approved) throw new Error('Approved quote assessment required');
  if (!validSecret(secret)) throw new Error('Checkout permit secret must be at least 32 characters');
  const session = String(sessionId || '').trim();
  if (session.length < 12 || session.length > 300) throw new Error('Valid buyer session required');
  const ttl = Number(ttlMs);
  if (!Number.isFinite(ttl) || ttl <= 0 || ttl > DEFAULT_QUOTE_TTL_MS) throw new Error('Permit TTL must be positive and no more than 15 minutes');
  const destination = assessment.destination;
  if (!destination?.country || !destination?.zip) throw new Error('Verified destination required');

  const payloadObject = {
    v: 1,
    quoteId: randomUUID(),
    sku: assessment.sku,
    variantId: assessment.variantId,
    quantity: assessment.quantity,
    sessionHash: digest(session),
    destinationHash: digest(`${destination.country}:${destination.zip}`),
    economics: assessment.economics,
    issuedAt: now,
    expiresAt: now + ttl,
    automaticSupplierOrdering: false,
  };
  const payload = Buffer.from(JSON.stringify(payloadObject), 'utf8').toString('base64url');
  const signature = sign(payload, secret);
  return { token: `${payload}.${signature}`, quoteId: payloadObject.quoteId, expiresAt: payloadObject.expiresAt };
}

export function verifyCheckoutPermit({ token, sessionId, country, zip, sku, secret, now = Date.now() } = {}) {
  if (!validSecret(secret)) return { valid: false, reason: 'invalid_permit_secret' };
  const parts = String(token || '').split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return { valid: false, reason: 'malformed_permit' };
  const [payload, suppliedSignature] = parts;
  const expectedSignature = sign(payload, secret);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return { valid: false, reason: 'invalid_permit_signature' };

  let data;
  try { data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')); } catch { return { valid: false, reason: 'invalid_permit_payload' }; }
  if (data.v !== 1 || !data.quoteId || !data.sku || !data.variantId) return { valid: false, reason: 'invalid_permit_payload' };
  if (!Number.isFinite(data.issuedAt) || !Number.isFinite(data.expiresAt) || data.expiresAt <= data.issuedAt || data.expiresAt - data.issuedAt > DEFAULT_QUOTE_TTL_MS) return { valid: false, reason: 'invalid_permit_lifetime' };
  if (now < data.issuedAt || now >= data.expiresAt) return { valid: false, reason: 'expired_permit' };
  if (data.sku !== String(sku || '').trim()) return { valid: false, reason: 'sku_scope_mismatch' };
  if (data.sessionHash !== digest(String(sessionId || '').trim())) return { valid: false, reason: 'session_scope_mismatch' };
  const destination = validateDestination(country, zip);
  if (!destination.valid || data.destinationHash !== digest(`${destination.country}:${destination.zip}`)) return { valid: false, reason: 'destination_scope_mismatch' };
  if (data.automaticSupplierOrdering !== false) return { valid: false, reason: 'unsafe_permit' };
  return { valid: true, quoteId: data.quoteId, sku: data.sku, variantId: data.variantId, quantity: data.quantity, economics: data.economics, expiresAt: data.expiresAt };
}
