import crypto from 'node:crypto';

const CJ_BASE = 'https://developers.cjdropshipping.com/api2.0/v1';

function positiveNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function intInRange(value, min, max) {
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
}

function safeSku(value) {
  const sku = String(value || '').trim();
  return /^[A-Za-z0-9._-]{1,80}$/.test(sku) ? sku : null;
}

function safeZip(value) {
  const zip = String(value || '').trim();
  return /^\d{5}$/.test(zip) ? zip : null;
}

function safePaymentUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return url.protocol === 'https:' && ['buy.stripe.com', 'checkout.stripe.com'].includes(url.hostname) ? url.toString() : null;
  } catch { return null; }
}

function normalizeCatalog(raw = {}) {
  const products = Array.isArray(raw?.products) ? raw.products : [];
  const map = new Map();
  for (const row of products) {
    const sku = safeSku(row?.sku);
    const variantId = String(row?.cjVariantId || '').trim();
    const supplierCostUsd = positiveNumber(row?.supplierCostUsd);
    const retailUsd = positiveNumber(row?.retailUsd);
    const originCountryCode = String(row?.originCountryCode || 'US').toUpperCase();
    const feeRatePct = positiveNumber(row?.feeRatePct) ?? 3.2;
    const returnReservePct = positiveNumber(row?.returnReservePct) ?? 5;
    const stripePaymentUrl = safePaymentUrl(row?.stripePaymentUrl);
    if (!sku || !variantId || variantId.length > 200 || !supplierCostUsd || !retailUsd || !stripePaymentUrl || !/^[A-Z]{2}$/.test(originCountryCode)) continue;
    map.set(sku, Object.freeze({ sku, variantId, supplierCostUsd, retailUsd, originCountryCode, feeRatePct, returnReservePct, stripePaymentUrl }));
  }
  return map;
}

function canonicalPayload(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

function signPayload(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

function zipDigest(zip, secret) {
  return crypto.createHmac('sha256', secret).update(String(zip)).digest('base64url');
}

function safeEqualText(a, b) {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function parseQuoteCatalog(env = process.env) {
  let parsed = { products: [] };
  try { parsed = JSON.parse(String(env.CJ_QUOTE_PRODUCTS_JSON || '{"products":[]}')); } catch {}
  return normalizeCatalog(parsed);
}

export function computeEconomics({ product, quantity, freightUsd }) {
  const qty = intInRange(quantity, 1, 25);
  const freight = positiveNumber(freightUsd);
  if (!product || !qty || !freight) return { approved: false, reason: 'invalid_economics_inputs' };

  const merchandise = product.supplierCostUsd * qty;
  const revenue = product.retailUsd * qty;
  const fees = revenue * (product.feeRatePct / 100);
  const returnsReserve = revenue * (product.returnReservePct / 100);
  const landed = merchandise + freight;
  const contribution = revenue - landed - fees - returnsReserve;
  const contributionPct = revenue > 0 ? (contribution / revenue) * 100 : 0;
  const landedPct = revenue > 0 ? (landed / revenue) * 100 : 100;

  const approved = contribution >= 3 && contributionPct >= 25 && landedPct <= 55;
  return {
    approved,
    reason: approved ? 'commercial_thresholds_passed' : 'commercial_thresholds_failed',
    revenueUsd: +revenue.toFixed(2),
    merchandiseUsd: +merchandise.toFixed(2),
    freightUsd: +freight.toFixed(2),
    landedUsd: +landed.toFixed(2),
    feesUsd: +fees.toFixed(2),
    returnsReserveUsd: +returnsReserve.toFixed(2),
    contributionUsd: +contribution.toFixed(2),
    contributionPct: +contributionPct.toFixed(2),
    landedPctOfRetail: +landedPct.toFixed(2),
  };
}

export function issueQuoteToken({ sku, quantity, zip, freightUsd, economics, secret, ttlSeconds = 900, now = Date.now() }) {
  if (!secret || String(secret).length < 32) throw new Error('QUOTE_SIGNING_SECRET must be at least 32 characters');
  const exp = Math.floor(now / 1000) + Math.max(60, Math.min(Number(ttlSeconds) || 900, 1800));
  const payload = canonicalPayload({ v: 1, sku, quantity, zipHash: zipDigest(zip, secret), freightUsd, contributionUsd: economics.contributionUsd, exp });
  return `${payload}.${signPayload(payload, secret)}`;
}

export function verifyQuoteToken({ token, zip, secret, now = Date.now() }) {
  if (!secret || String(secret).length < 32) return { valid: false, reason: 'quote_signing_not_configured' };
  const destinationZip = safeZip(zip);
  const [payload, signature, extra] = String(token || '').split('.');
  if (!destinationZip || !payload || !signature || extra) return { valid: false, reason: 'invalid_quote_token' };
  const expected = signPayload(payload, secret);
  if (!safeEqualText(expected, signature)) return { valid: false, reason: 'invalid_quote_signature' };
  let decoded;
  try { decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')); } catch { return { valid: false, reason: 'invalid_quote_payload' }; }
  if (decoded?.v !== 1 || !safeSku(decoded?.sku) || !intInRange(decoded?.quantity, 1, 25) || !positiveNumber(decoded?.freightUsd) || !positiveNumber(decoded?.contributionUsd) || !Number.isInteger(decoded?.exp)) return { valid: false, reason: 'invalid_quote_payload' };
  if (decoded.exp <= Math.floor(now / 1000)) return { valid: false, reason: 'quote_expired' };
  if (!safeEqualText(decoded.zipHash, zipDigest(destinationZip, secret))) return { valid: false, reason: 'quote_destination_mismatch' };
  return { valid: true, quote: decoded };
}

function cjHeaders(token) {
  return { 'CJ-Access-Token': token, 'Content-Type': 'application/json', 'User-Agent': 'PrismBay-Exact-Quote/1.1' };
}

async function jsonFetch(fetchImpl, url, options = {}) {
  const response = await fetchImpl(url, options);
  if (!response?.ok) throw new Error(`upstream_${response?.status || 'error'}`);
  return response.json();
}

export function createQuoteService({ env = process.env, fetchImpl = globalThis.fetch, now = () => Date.now() } = {}) {
  if (typeof fetchImpl !== 'function') throw new Error('fetch implementation required');
  const products = parseQuoteCatalog(env);
  const apiKey = String(env.CJ_API_KEY || '').trim();
  const quoteSecret = String(env.QUOTE_SIGNING_SECRET || '');
  const ttlSeconds = Number(env.QUOTE_TTL_SECONDS || 900);
  let accessToken = '';
  let accessTokenExpiresAt = 0;

  async function getToken() {
    if (accessToken && now() < accessTokenExpiresAt - 60_000) return accessToken;
    if (!apiKey) throw new Error('cj_api_key_missing');
    const auth = await jsonFetch(fetchImpl, `${CJ_BASE}/authentication/getAccessToken`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': 'PrismBay-Exact-Quote/1.1' }, body: JSON.stringify({ apiKey })
    });
    const token = String(auth?.data?.accessToken || '').trim();
    if (!token) throw new Error('cj_access_token_missing');
    accessToken = token;
    const expireAt = Date.parse(auth?.data?.accessTokenExpiryDate || '');
    accessTokenExpiresAt = Number.isFinite(expireAt) ? expireAt : now() + 60 * 60 * 1000;
    return token;
  }

  return Object.freeze({
    configuredSkus: Object.freeze([...products.keys()]),
    async quote(input = {}) {
      const sku = safeSku(input.sku);
      const zip = safeZip(input.zip);
      const quantity = intInRange(input.quantity ?? 1, 1, 25);
      if (!sku || !zip || !quantity) return { ok: false, status: 400, error: 'invalid_quote_request' };
      const product = products.get(sku);
      if (!product) return { ok: false, status: 404, error: 'sku_not_quote_enabled' };
      if (!quoteSecret || quoteSecret.length < 32) return { ok: false, status: 503, error: 'quote_signing_not_configured' };

      const token = await getToken();
      const stockUrl = new URL(`${CJ_BASE}/product/stock/queryByVid`);
      stockUrl.searchParams.set('vid', product.variantId);
      const stockPayload = await jsonFetch(fetchImpl, stockUrl, { headers: cjHeaders(token) });
      const stockRows = Array.isArray(stockPayload?.data) ? stockPayload.data : [];
      const stock = stockRows.find(row => String(row?.vid || '') === product.variantId && String(row?.countryCode || '').toUpperCase() === product.originCountryCode && Number(row?.cjInventoryNum || 0) >= quantity);
      if (!stock) return { ok: false, status: 409, error: 'verified_origin_stock_unavailable' };

      const freightPayload = await jsonFetch(fetchImpl, `${CJ_BASE}/logistic/freightCalculate`, {
        method: 'POST', headers: cjHeaders(token),
        body: JSON.stringify({ startCountryCode: product.originCountryCode, endCountryCode: 'US', zip, products: [{ quantity, vid: product.variantId }] })
      });
      const methods = (Array.isArray(freightPayload?.data) ? freightPayload.data : [])
        .map(row => ({ name: String(row?.logisticName || '').trim(), usd: positiveNumber(row?.logisticPrice), aging: String(row?.logisticAging || '').trim() || null }))
        .filter(row => row.name && row.usd)
        .sort((a, b) => a.usd - b.usd);
      if (!methods.length) return { ok: false, status: 409, error: 'priced_freight_unavailable' };

      const shipping = methods[0];
      const economics = computeEconomics({ product, quantity, freightUsd: shipping.usd });
      if (!economics.approved) return { ok: true, status: 200, checkoutAllowed: false, sku, quantity, destination: { country: 'US', zip }, shipping, economics, finalDestinationVerified: true };

      const quoteToken = issueQuoteToken({ sku, quantity, zip, freightUsd: shipping.usd, economics, secret: quoteSecret, ttlSeconds, now: now() });
      return { ok: true, status: 200, checkoutAllowed: true, sku, quantity, destination: { country: 'US', zip }, shipping, economics, finalDestinationVerified: true, quoteToken, expiresInSeconds: Math.max(60, Math.min(ttlSeconds || 900, 1800)), supplierOrderingEnabled: false };
    },
    authorizeCheckout(input = {}) {
      const verified = verifyQuoteToken({ token: input.quoteToken, zip: input.zip, secret: quoteSecret, now: now() });
      if (!verified.valid) return { ok: false, status: 403, error: verified.reason };
      const product = products.get(verified.quote.sku);
      if (!product) return { ok: false, status: 404, error: 'sku_not_quote_enabled' };
      return { ok: true, status: 200, checkoutAllowed: true, sku: product.sku, quantity: verified.quote.quantity, paymentUrl: product.stripePaymentUrl, expiresAt: verified.quote.exp, supplierOrderingEnabled: false };
    },
  });
}
