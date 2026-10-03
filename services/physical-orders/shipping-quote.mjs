import crypto from 'node:crypto';

const CJ_BASE = 'https://developers.cjdropshipping.com/api2.0/v1';

function positiveNumber(value) { const n = Number(value); return Number.isFinite(n) && n > 0 ? n : null; }
function intInRange(value, min, max) { const n = Number(value); return Number.isInteger(n) && n >= min && n <= max ? n : null; }
function safeSku(value) { const sku = String(value || '').trim(); return /^[A-Za-z0-9._-]{1,80}$/.test(sku) ? sku : null; }
function safeZip(value) { const zip = String(value || '').trim(); return /^\d{5}$/.test(zip) ? zip : null; }
function safePaymentUrl(value) { try { const url = new URL(String(value || '')); return url.protocol === 'https:' && ['buy.stripe.com', 'checkout.stripe.com'].includes(url.hostname) ? url.toString() : null; } catch { return null; } }
function rangeUpper(value) {
  if (typeof value === 'number') return positiveNumber(value);
  if (typeof value !== 'string') return null;
  const values = value.trim().replace(/[≥≤]/g, '').split('-').map(Number).filter(Number.isFinite);
  return values.length && values.every(v => v > 0) ? Math.max(...values) : null;
}

function catalogFingerprint(product) {
  return crypto.createHash('sha256').update(JSON.stringify({ sku: product.sku, variantId: product.variantId, supplierCostUsd: product.supplierCostUsd, retailUsd: product.retailUsd, originCountryCode: product.originCountryCode, feeRatePct: product.feeRatePct, returnReservePct: product.returnReservePct, stripePaymentUrl: product.stripePaymentUrl })).digest('base64url');
}
function normalizeCatalog(raw = {}) {
  const map = new Map();
  for (const row of Array.isArray(raw?.products) ? raw.products : []) {
    const sku = safeSku(row?.sku), variantId = String(row?.cjVariantId || '').trim(), supplierCostUsd = positiveNumber(row?.supplierCostUsd), retailUsd = positiveNumber(row?.retailUsd), originCountryCode = String(row?.originCountryCode || 'US').toUpperCase(), feeRatePct = positiveNumber(row?.feeRatePct) ?? 3.2, returnReservePct = positiveNumber(row?.returnReservePct) ?? 5, stripePaymentUrl = safePaymentUrl(row?.stripePaymentUrl);
    if (!sku || !variantId || variantId.length > 200 || !supplierCostUsd || !retailUsd || !stripePaymentUrl || !/^[A-Z]{2}$/.test(originCountryCode)) continue;
    const product = { sku, variantId, supplierCostUsd, retailUsd, originCountryCode, feeRatePct, returnReservePct, stripePaymentUrl };
    map.set(sku, Object.freeze({ ...product, catalogFingerprint: catalogFingerprint(product) }));
  }
  return map;
}
function canonicalPayload(obj) { return Buffer.from(JSON.stringify(obj)).toString('base64url'); }
function signPayload(payload, secret) { return crypto.createHmac('sha256', secret).update(payload).digest('base64url'); }
function zipDigest(zip, secret) { return crypto.createHmac('sha256', secret).update(String(zip)).digest('base64url'); }
function safeEqualText(a, b) { const left = Buffer.from(String(a || '')), right = Buffer.from(String(b || '')); return left.length === right.length && crypto.timingSafeEqual(left, right); }

export function parseQuoteCatalog(env = process.env) { let parsed = { products: [] }; try { parsed = JSON.parse(String(env.CJ_QUOTE_PRODUCTS_JSON || '{"products":[]}')); } catch {} return normalizeCatalog(parsed); }
export function computeEconomics({ product, quantity, freightUsd }) {
  const qty = intInRange(quantity, 1, 25), freight = positiveNumber(freightUsd);
  if (!product || !qty || !freight) return { approved: false, reason: 'invalid_economics_inputs' };
  const merchandise = product.supplierCostUsd * qty, revenue = product.retailUsd * qty, fees = revenue * (product.feeRatePct / 100), returnsReserve = revenue * (product.returnReservePct / 100), landed = merchandise + freight, contribution = revenue - landed - fees - returnsReserve, contributionPct = revenue > 0 ? (contribution / revenue) * 100 : 0, landedPct = revenue > 0 ? (landed / revenue) * 100 : 100;
  const approved = contribution >= 3 && contributionPct >= 25 && landedPct <= 55;
  return { approved, reason: approved ? 'commercial_thresholds_passed' : 'commercial_thresholds_failed', revenueUsd: +revenue.toFixed(2), merchandiseUsd: +merchandise.toFixed(2), freightUsd: +freight.toFixed(2), landedUsd: +landed.toFixed(2), feesUsd: +fees.toFixed(2), returnsReserveUsd: +returnsReserve.toFixed(2), contributionUsd: +contribution.toFixed(2), contributionPct: +contributionPct.toFixed(2), landedPctOfRetail: +landedPct.toFixed(2) };
}
export function issueQuoteToken({ sku, quantity, zip, freightUsd, economics, catalogFingerprint: fingerprint, secret, ttlSeconds = 900, now = Date.now(), nonce = null }) {
  if (!secret || String(secret).length < 32) throw new Error('QUOTE_SIGNING_SECRET must be at least 32 characters');
  if (!fingerprint || typeof fingerprint !== 'string') throw new Error('catalog fingerprint required');
  const exp = Math.floor(now / 1000) + Math.max(60, Math.min(Number(ttlSeconds) || 900, 1800));
  const payload = canonicalPayload({ v: 3, jti: nonce || crypto.randomBytes(18).toString('base64url'), sku, quantity, zipHash: zipDigest(zip, secret), freightUsd, contributionUsd: economics.contributionUsd, catalogFingerprint: fingerprint, exp });
  return `${payload}.${signPayload(payload, secret)}`;
}
export function verifyQuoteToken({ token, zip, secret, now = Date.now() }) {
  if (!secret || String(secret).length < 32) return { valid: false, reason: 'quote_signing_not_configured' };
  const destinationZip = safeZip(zip), [payload, signature, extra] = String(token || '').split('.');
  if (!destinationZip || !payload || !signature || extra) return { valid: false, reason: 'invalid_quote_token' };
  if (!safeEqualText(signPayload(payload, secret), signature)) return { valid: false, reason: 'invalid_quote_signature' };
  let decoded; try { decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')); } catch { return { valid: false, reason: 'invalid_quote_payload' }; }
  if (decoded?.v !== 3 || !/^[A-Za-z0-9_-]{16,80}$/.test(String(decoded?.jti || '')) || !safeSku(decoded?.sku) || !intInRange(decoded?.quantity, 1, 25) || !positiveNumber(decoded?.freightUsd) || !positiveNumber(decoded?.contributionUsd) || !/^[A-Za-z0-9_-]{32,100}$/.test(String(decoded?.catalogFingerprint || '')) || !Number.isInteger(decoded?.exp)) return { valid: false, reason: 'invalid_quote_payload' };
  if (decoded.exp <= Math.floor(now / 1000)) return { valid: false, reason: 'quote_expired' };
  if (!safeEqualText(decoded.zipHash, zipDigest(destinationZip, secret))) return { valid: false, reason: 'quote_destination_mismatch' };
  return { valid: true, quote: decoded };
}
function cjHeaders(token) { return { 'CJ-Access-Token': token, 'Content-Type': 'application/json', 'User-Agent': 'PrismBay-Exact-Quote/2.0' }; }
async function jsonFetch(fetchImpl, url, options = {}) { const response = await fetchImpl(url, options); if (!response?.ok) throw new Error(`upstream_${response?.status || 'error'}`); return response.json(); }

function simpleFreightMethods(payload) {
  return (Array.isArray(payload?.data) ? payload.data : []).map(row => ({ name: String(row?.logisticName || '').trim(), usd: positiveNumber(row?.logisticPrice), aging: String(row?.logisticAging || '').trim() || null, evidence: 'zip_simple' })).filter(row => row.name && row.usd).sort((a, b) => a.usd - b.usd);
}
function tipFreightMethods(payload) {
  return (Array.isArray(payload?.data) ? payload.data : []).map(row => {
    const usd = [row?.totalPostageFee, row?.wrapPostage, row?.discountFee].map(positiveNumber).find(Boolean) || null;
    return { name: String(row?.option?.enName || row?.channel?.enName || '').trim(), usd, aging: String(row?.arrivalTime || row?.option?.arrivalTime || '').trim() || null, evidence: 'zip_tip' };
  }).filter(row => row.name && row.usd).sort((a, b) => a.usd - b.usd);
}
function buildTipRequest({ variant, detail, product, quantity, zip }) {
  const sku = String(variant?.variantSku || '').trim();
  const unitWeight = positiveNumber(variant?.variantWeight);
  const unitVolumeMm3 = positiveNumber(variant?.variantVolume) ?? (positiveNumber(variant?.variantLength) && positiveNumber(variant?.variantWidth) && positiveNumber(variant?.variantHeight) ? Number(variant.variantLength) * Number(variant.variantWidth) * Number(variant.variantHeight) : null);
  const props = Array.isArray(detail?.productProEnSet) ? [...new Set(detail.productProEnSet.map(v => String(v || '').trim()).filter(Boolean))] : [];
  if (!sku || sku.length > 200 || !unitWeight || !unitVolumeMm3 || !props.length) return null;
  const packWeight = rangeUpper(detail?.packingWeight ?? detail?.packWeight);
  const weight = Math.ceil(unitWeight * quantity);
  const wrapWeight = Math.ceil(Math.max(unitWeight, packWeight || unitWeight) * quantity);
  const volume = Number(((unitVolumeMm3 * quantity) / 1000).toFixed(3));
  if (!(volume > 0)) return null;
  const row = {
    srcAreaCode: product.originCountryCode,
    destAreaCode: 'US',
    weight,
    wrapWeight,
    volume,
    totalGoodsAmount: +(product.supplierCostUsd * quantity).toFixed(2),
    productProp: props,
    skuList: [sku],
    freightTrialSkuList: [{ skuQuantity: quantity, sku }],
    shippingMode: 2,
    zip,
  };
  const productType = String(detail?.productType ?? '').trim();
  if (/^[01345]$/.test(productType)) {
    row.productTypes = [productType];
    if (productType === '5') row.trialCalculationType = '1';
  }
  return { reqDTOS: [row] };
}

export function createQuoteService({ env = process.env, fetchImpl = globalThis.fetch, now = () => Date.now(), consumeQuoteOnce = null } = {}) {
  if (typeof fetchImpl !== 'function') throw new Error('fetch implementation required');
  const products = parseQuoteCatalog(env), apiKey = String(env.CJ_API_KEY || '').trim(), quoteSecret = String(env.QUOTE_SIGNING_SECRET || ''), ttlSeconds = Number(env.QUOTE_TTL_SECONDS || 900);
  let accessToken = '', accessTokenExpiresAt = 0;
  const consumedQuotes = new Map();
  function purgeConsumed() { const epoch = Math.floor(now() / 1000); for (const [jti, exp] of consumedQuotes) if (exp <= epoch) consumedQuotes.delete(jti); }
  async function consumeOnce(quote) {
    if (typeof consumeQuoteOnce === 'function') return Boolean(await consumeQuoteOnce({ jti: quote.jti, exp: quote.exp }));
    purgeConsumed();
    if (consumedQuotes.has(quote.jti)) return false;
    consumedQuotes.set(quote.jti, quote.exp);
    return true;
  }
  async function getToken() {
    if (accessToken && now() < accessTokenExpiresAt - 60_000) return accessToken;
    if (!apiKey) throw new Error('cj_api_key_missing');
    const auth = await jsonFetch(fetchImpl, `${CJ_BASE}/authentication/getAccessToken`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': 'PrismBay-Exact-Quote/2.0' }, body: JSON.stringify({ apiKey }) });
    const token = String(auth?.data?.accessToken || '').trim(); if (!token) throw new Error('cj_access_token_missing');
    accessToken = token; const expireAt = Date.parse(auth?.data?.accessTokenExpiryDate || ''); accessTokenExpiresAt = Number.isFinite(expireAt) ? expireAt : now() + 60 * 60 * 1000; return token;
  }
  async function verifyCurrentStock(product, quantity) {
    const token = await getToken();
    const stockUrl = new URL(`${CJ_BASE}/product/stock/queryByVid`); stockUrl.searchParams.set('vid', product.variantId);
    const stockPayload = await jsonFetch(fetchImpl, stockUrl, { headers: cjHeaders(token) });
    const stockRows = Array.isArray(stockPayload?.data) ? stockPayload.data : [];
    return stockRows.find(row => String(row?.vid || '') === product.variantId && String(row?.countryCode || '').toUpperCase() === product.originCountryCode && Number(row?.cjInventoryNum || 0) >= quantity) || null;
  }
  async function resolveShipping(product, quantity, zip) {
    const token = await getToken();
    let tipDiagnostic = 'tip_metadata_unavailable';
    try {
      const variantUrl = new URL(`${CJ_BASE}/product/variant/queryByVid`); variantUrl.searchParams.set('vid', product.variantId);
      const variantPayload = await jsonFetch(fetchImpl, variantUrl, { headers: cjHeaders(token) });
      const variant = variantPayload?.data;
      if (String(variant?.vid || '') !== product.variantId || !variant?.pid) throw new Error('variant_identity_mismatch');
      const detailUrl = new URL(`${CJ_BASE}/product/query`); detailUrl.searchParams.set('pid', String(variant.pid));
      const detailPayload = await jsonFetch(fetchImpl, detailUrl, { headers: cjHeaders(token) });
      const detail = detailPayload?.data;
      const tipRequest = buildTipRequest({ variant, detail, product, quantity, zip });
      if (tipRequest) {
        const tipPayload = await jsonFetch(fetchImpl, `${CJ_BASE}/logistic/freightCalculateTip`, { method: 'POST', headers: cjHeaders(token), body: JSON.stringify(tipRequest) });
        const methods = tipFreightMethods(tipPayload);
        if (methods.length) return { methods, source: 'zip_tip', fallbackUsed: false, diagnostic: 'accurate_zip_tip_priced' };
        tipDiagnostic = 'tip_returned_no_priced_methods';
      }
    } catch (error) {
      tipDiagnostic = String(error?.message || '').startsWith('upstream_') ? 'tip_upstream_unavailable' : 'tip_metadata_or_identity_unavailable';
    }
    const freightPayload = await jsonFetch(fetchImpl, `${CJ_BASE}/logistic/freightCalculate`, { method: 'POST', headers: cjHeaders(token), body: JSON.stringify({ startCountryCode: product.originCountryCode, endCountryCode: 'US', zip, products: [{ quantity, vid: product.variantId }] }) });
    const methods = simpleFreightMethods(freightPayload);
    return { methods, source: methods.length ? 'zip_simple_fallback' : null, fallbackUsed: true, diagnostic: methods.length ? `simple_zip_priced_after_${tipDiagnostic}` : `no_priced_shipping_after_${tipDiagnostic}` };
  }
  return Object.freeze({
    configuredSkus: Object.freeze([...products.keys()]),
    async quote(input = {}) {
      const sku = safeSku(input.sku), zip = safeZip(input.zip), quantity = intInRange(input.quantity ?? 1, 1, 25);
      if (!sku || !zip || !quantity) return { ok: false, status: 400, error: 'invalid_quote_request' };
      const product = products.get(sku); if (!product) return { ok: false, status: 404, error: 'sku_not_quote_enabled' };
      if (!quoteSecret || quoteSecret.length < 32) return { ok: false, status: 503, error: 'quote_signing_not_configured' };
      const stock = await verifyCurrentStock(product, quantity); if (!stock) return { ok: false, status: 409, error: 'verified_origin_stock_unavailable' };
      const shippingEvidence = await resolveShipping(product, quantity, zip);
      if (!shippingEvidence.methods.length) return { ok: false, status: 409, error: 'priced_freight_unavailable', shippingDiagnostic: shippingEvidence.diagnostic };
      const shipping = shippingEvidence.methods[0], economics = computeEconomics({ product, quantity, freightUsd: shipping.usd });
      const common = { ok: true, status: 200, checkoutAllowed: economics.approved, sku, quantity, destination: { country: 'US', zip }, shipping, shippingEvidence: { source: shippingEvidence.source, fallbackUsed: shippingEvidence.fallbackUsed, diagnostic: shippingEvidence.diagnostic }, economics, destinationZipPriced: true, stockVerifiedAtQuote: true };
      if (!economics.approved) return common;
      const quoteToken = issueQuoteToken({ sku, quantity, zip, freightUsd: shipping.usd, economics, catalogFingerprint: product.catalogFingerprint, secret: quoteSecret, ttlSeconds, now: now() });
      return { ...common, quoteToken, expiresInSeconds: Math.max(60, Math.min(ttlSeconds || 900, 1800)), supplierOrderingEnabled: false };
    },
    async authorizeCheckout(input = {}) {
      const verified = verifyQuoteToken({ token: input.quoteToken, zip: input.zip, secret: quoteSecret, now: now() });
      if (!verified.valid) return { ok: false, status: 403, error: verified.reason };
      const product = products.get(verified.quote.sku); if (!product) return { ok: false, status: 404, error: 'sku_not_quote_enabled' };
      if (!safeEqualText(verified.quote.catalogFingerprint, product.catalogFingerprint)) return { ok: false, status: 409, error: 'quote_catalog_changed' };
      const stock = await verifyCurrentStock(product, verified.quote.quantity);
      if (!stock) return { ok: false, status: 409, error: 'stock_changed_since_quote' };
      const freshShipping = await resolveShipping(product, verified.quote.quantity, safeZip(input.zip));
      if (!freshShipping.methods.length) return { ok: false, status: 409, error: 'shipping_changed_since_quote' };
      const freshEconomics = computeEconomics({ product, quantity: verified.quote.quantity, freightUsd: freshShipping.methods[0].usd });
      if (!freshEconomics.approved) return { ok: false, status: 409, error: 'economics_changed_since_quote' };
      if (!(await consumeOnce(verified.quote))) return { ok: false, status: 409, error: 'quote_already_used' };
      return { ok: true, status: 200, checkoutAllowed: true, sku: product.sku, quantity: verified.quote.quantity, paymentUrl: product.stripePaymentUrl, expiresAt: verified.quote.exp, quoteUse: 'consumed_once_persistently_when_configured', stockRevalidatedAtCheckout: true, shippingRevalidatedAtCheckout: true, shippingEvidence: { source: freshShipping.source, fallbackUsed: freshShipping.fallbackUsed }, economicsRevalidatedAtCheckout: true, supplierOrderingEnabled: false };
    },
  });
}
