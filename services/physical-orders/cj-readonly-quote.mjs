const CJ_BASE = 'https://developers.cjdropshipping.com/api2.0/v1';

function text(value) { return String(value ?? '').trim(); }
function positive(value) {
  if (value === null || value === undefined || typeof value === 'boolean' || text(value) === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}
function inventoryNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}
function validateZip(zip) {
  const z = text(zip);
  if (!/^\d{5}$/.test(z)) throw new Error('A five-digit US buyer ZIP is required');
  return z;
}
function validateSku(value, label) {
  const v = text(value);
  if (!v || v.length > 220 || !/^[A-Za-z0-9._-]+$/.test(v)) throw new Error(`${label} is invalid`);
  return v;
}
function validateQuantity(value) {
  const q = Number(value);
  if (!Number.isInteger(q) || q < 1 || q > 5) throw new Error('Quantity must be an integer from 1 to 5');
  return q;
}
function normalizeProduct(payload) {
  const data = payload?.data;
  if (Array.isArray(data)) return data.find(Boolean) || null;
  if (data && typeof data === 'object') {
    if (Array.isArray(data.productList)) return data.productList.find(Boolean) || null;
    return data;
  }
  return null;
}
function productId(row = {}) { return text(row.id ?? row.pid ?? row.productId); }
function productSku(row = {}) { return text(row.sku ?? row.productSku ?? row.spu); }
function productName(row = {}) { return text(row.nameEn ?? row.productNameEn ?? row.productName ?? row.name); }
function rows(payload) { return Array.isArray(payload?.data) ? payload.data : []; }
function chooseStock(stockRows, vid, quantity) {
  const rank = country => country === 'US' ? 0 : country === 'CN' ? 1 : 2;
  return stockRows
    .filter(row => text(row?.vid) === vid)
    .map(row => ({
      ...row,
      countryCode: text(row?.countryCode).toUpperCase(),
      cjInventoryNum: inventoryNumber(row?.cjInventoryNum),
      totalInventoryNum: inventoryNumber(row?.totalInventoryNum),
    }))
    .filter(row => /^[A-Z]{2}$/.test(row.countryCode) && row.cjInventoryNum !== null && row.totalInventoryNum !== null && row.cjInventoryNum >= quantity && row.totalInventoryNum >= quantity)
    .sort((a, b) => rank(a.countryCode) - rank(b.countryCode) || b.cjInventoryNum - a.cjInventoryNum)[0] || null;
}
function chooseFreight(payload, zip) {
  const offers = (Array.isArray(payload?.data) ? payload.data : [])
    .map(row => ({
      name: text(row?.logisticName),
      usd: positive(row?.logisticPrice),
      aging: text(row?.logisticAging) || null,
    }))
    .filter(row => row.name && row.name.length <= 100 && row.usd !== null)
    .sort((a, b) => a.usd - b.usd);
  if (!offers.length) throw new Error('CJ returned no positive-price freight method for this buyer ZIP');
  return {
    ...offers[0],
    scope: 'buyer_destination_zip',
    zip,
    finalDestinationVerified: true,
  };
}
async function jsonRequest(fetchImpl, url, init = {}) {
  const response = await fetchImpl(url, init);
  if (!response || typeof response.json !== 'function') throw new Error('Invalid CJ HTTP response');
  const payload = await response.json();
  if (response.ok === false) throw new Error(`CJ HTTP request failed with status ${response.status || 'unknown'}`);
  if (payload?.result === false || payload?.code === 1600200 || payload?.success === false) {
    const message = text(payload?.message ?? payload?.msg) || 'CJ API request failed';
    throw new Error(message.slice(0, 200));
  }
  return payload;
}
function authHeaders(token) {
  return { 'CJ-Access-Token': token, 'Content-Type': 'application/json', 'User-Agent': 'PrismBay-Checkout-Quote/1.0' };
}

export class CJReadOnlyQuoteClient {
  constructor({ apiKey, fetchImpl = globalThis.fetch, now = () => Date.now(), baseUrl = CJ_BASE } = {}) {
    this.apiKey = text(apiKey);
    this.fetchImpl = fetchImpl;
    this.now = now;
    this.baseUrl = String(baseUrl || CJ_BASE).replace(/\/$/, '');
    if (!this.apiKey) throw new Error('CJ_API_KEY is required');
    if (typeof fetchImpl !== 'function') throw new Error('fetch implementation is required');
  }

  async authenticate() {
    const payload = await jsonRequest(this.fetchImpl, `${this.baseUrl}/authentication/getAccessToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'PrismBay-Checkout-Quote/1.0' },
      body: JSON.stringify({ apiKey: this.apiKey }),
    });
    const token = text(payload?.data?.accessToken);
    if (!token) throw new Error('CJ authentication returned no access token');
    return token;
  }

  async quoteExactVariant({ expectedProductSku, expectedVariantSku, zip, quantity = 1 } = {}) {
    const productSkuExpected = validateSku(expectedProductSku, 'Expected CJ product SKU');
    const variantSkuExpected = validateSku(expectedVariantSku, 'Expected CJ variant SKU');
    const buyerZip = validateZip(zip);
    const qty = validateQuantity(quantity);
    const token = await this.authenticate();
    const headers = authHeaders(token);

    const productUrl = new URL(`${this.baseUrl}/product/query`);
    productUrl.searchParams.set('variantSku', variantSkuExpected);
    const productPayload = await jsonRequest(this.fetchImpl, productUrl, { headers });
    const product = normalizeProduct(productPayload);
    const pid = productId(product);
    const returnedProductSku = productSku(product);
    if (!product || !pid) throw new Error('Exact CJ variant no longer resolves to a product');
    if (returnedProductSku && returnedProductSku !== productSkuExpected) throw new Error('CJ product SKU does not match the approved supplier identity');
    if (product?.saleStatus !== undefined && product?.saleStatus !== null && text(product.saleStatus) !== '3') throw new Error('Approved CJ product is not currently on sale');

    const variantUrl = new URL(`${this.baseUrl}/product/variant/query`);
    variantUrl.searchParams.set('pid', pid);
    const variantPayload = await jsonRequest(this.fetchImpl, variantUrl, { headers });
    const exactVariant = rows(variantPayload).find(row => text(row?.variantSku) === variantSkuExpected && text(row?.vid));
    if (!exactVariant) throw new Error('Exact approved CJ variant is unavailable; substitution is prohibited');
    const vid = text(exactVariant.vid);
    const productCostUsd = positive(exactVariant?.variantSellPrice);
    if (productCostUsd === null) throw new Error('Exact approved CJ variant has no positive current price');

    const stockUrl = new URL(`${this.baseUrl}/product/stock/queryByVid`);
    stockUrl.searchParams.set('vid', vid);
    const stockPayload = await jsonRequest(this.fetchImpl, stockUrl, { headers });
    const stock = chooseStock(rows(stockPayload), vid, qty);
    if (!stock) throw new Error('Exact approved CJ variant has insufficient verified inventory');
    const stockVerifiedAt = new Date(this.now()).toISOString();

    const freightPayload = await jsonRequest(this.fetchImpl, `${this.baseUrl}/logistic/freightCalculate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        startCountryCode: stock.countryCode,
        endCountryCode: 'US',
        zip: buyerZip,
        products: [{ quantity: qty, vid }],
      }),
    });
    const freight = chooseFreight(freightPayload, buyerZip);
    const freightQuotedAt = new Date(this.now()).toISOString();

    return {
      supplier: 'CJdropshipping',
      supplierVariantVerified: true,
      expectedProductSku: productSkuExpected,
      returnedProductSku: returnedProductSku || productSkuExpected,
      productName: productName(product) || null,
      productId: pid,
      variantId: vid,
      variantSku: variantSkuExpected,
      variantKey: text(exactVariant?.variantKey) || null,
      productCostUsd,
      quantity: qty,
      inventoryVerified: true,
      inventory: stock.cjInventoryNum,
      originCountryCode: stock.countryCode,
      stockVerifiedAt,
      country: 'US',
      zip: buyerZip,
      finalDestinationFreight: true,
      freightScope: 'buyer_destination_zip',
      freightUsd: freight.usd,
      freightMethod: freight.name,
      freightAging: freight.aging,
      freightQuotedAt,
      automaticSupplierOrdering: false,
      supplierOrderCreated: false,
    };
  }
}

export const __test = { chooseStock, chooseFreight, validateZip, validateQuantity, normalizeProduct };
