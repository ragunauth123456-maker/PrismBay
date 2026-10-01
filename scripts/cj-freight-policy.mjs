// Read-only CJ freight quote normalization. Never treat a zero-cost method
// as confirmed free shipping without CJ/supplier confirmation.
const positiveNumber = value => {
  if (value === null || value === undefined || typeof value === 'boolean' ||
      (typeof value === 'string' && !value.trim())) return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
};

const nonNegativeNumber = value => {
  if (value === null || value === undefined || typeof value === 'boolean' ||
      (typeof value === 'string' && !value.trim())) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

function rangeUpper(value) {
  if (typeof value === 'number') return positiveNumber(value);
  if (typeof value !== 'string') return null;
  const text = value.trim().replace(/[≥≤]/g, '');
  if (!text) return null;
  const values = text.split('-').map(Number).filter(Number.isFinite);
  if (!values.length || values.some(v => v <= 0)) return null;
  return Math.max(...values);
}

function productProps(detail) {
  const values = Array.isArray(detail?.productProEnSet) ? detail.productProEnSet : [];
  return [...new Set(values.map(v => String(v || '').trim()).filter(v => v && v.length <= 100))];
}

export function parseCJFreight(payload, scope = 'country_estimate', zip = null) {
  const services = Array.isArray(payload?.data) ? payload.data : [];
  const offers = [];
  let zeroPriced = 0;
  let invalid = 0;
  for (const service of services) {
    const raw = nonNegativeNumber(service?.logisticPrice);
    if (raw === null) { invalid++; continue; }
    if (raw === 0) { zeroPriced++; continue; }
    const name = String(service?.logisticName || '').trim();
    if (!name || name.length > 100) { invalid++; continue; }
    const aging = String(service?.logisticAging || '').trim();
    offers.push({ name, usd: raw, aging: aging || null, scope,
      exampleZip: scope.includes('zip') ? zip : null,
      finalDestinationVerified: false });
  }
  offers.sort((a, b) => a.usd - b.usd);
  return { offers: offers.slice(0, 5), zeroPriced, invalid,
    returnedMethods: services.length,
    diagnostic: offers.length ? 'priced_estimate_available' :
      zeroPriced ? 'zero_priced_methods_require_supplier_confirmation' :
        services.length ? 'no_usable_shipping_quote' : 'no_shipping_methods_returned' };
}

// CJ documents Freight Calculation Tip as the more accurate trial-calculation route.
// Prefer totalPostageFee because CJ defines it as wrapped postage plus applicable
// tax/clearance/tariff amounts. Fall back to wrapPostage and discountFee only when
// the total is absent. Zero remains ambiguous and never authorizes checkout.
export function parseCJFreightTip(payload, scope = 'tip_example_zip_estimate', zip = null) {
  const services = Array.isArray(payload?.data) ? payload.data : [];
  const offers = [];
  let zeroPriced = 0;
  let invalid = 0;
  for (const service of services) {
    const candidates = [service?.totalPostageFee, service?.wrapPostage, service?.discountFee]
      .map(nonNegativeNumber).filter(v => v !== null);
    if (!candidates.length) { invalid++; continue; }
    const usd = candidates[0];
    if (usd === 0) { zeroPriced++; continue; }
    const name = String(service?.option?.enName || service?.channel?.enName || '').trim();
    if (!name || name.length > 100) { invalid++; continue; }
    const aging = String(service?.arrivalTime || service?.option?.arrivalTime || '').trim();
    offers.push({ name, usd, aging: aging || null, scope,
      exampleZip: scope.includes('zip') ? zip : null,
      finalDestinationVerified: false });
  }
  offers.sort((a, b) => a.usd - b.usd);
  return { offers: offers.slice(0, 5), zeroPriced, invalid,
    returnedMethods: services.length,
    diagnostic: offers.length ? 'priced_tip_estimate_available' :
      zeroPriced ? 'zero_priced_tip_methods_require_supplier_confirmation' :
        services.length ? 'no_usable_tip_shipping_quote' : 'no_tip_shipping_methods_returned' };
}

export function freightRequest(vid, zip = null) {
  if (typeof vid !== 'string' || !vid.trim() || vid.length > 200) {
    throw new Error('A validated variant ID is required');
  }
  if (zip !== null && !/^\d{5}$/.test(zip)) {
    throw new Error('Illustrative US ZIP must be five digits');
  }
  return {
    startCountryCode: 'US',
    endCountryCode: 'US',
    products: [{ quantity: 1, vid }],
    ...(zip ? { zip } : {}),
  };
}

// Build only fields documented by CJ for Freight Calculation Tip. Variant volume is
// documented in mm^3 while Tip expects cm^3, so divide by 1000. Product packWeight
// is treated as the packaged-weight ceiling when it exceeds variant net weight.
export function freightTipRequest({ variant, detail, zip = null, origin = 'US' } = {}) {
  const sku = typeof variant?.variantSku === 'string' ? variant.variantSku.trim() : '';
  const weight = positiveNumber(variant?.variantWeight);
  const volumeMm3 = positiveNumber(variant?.variantVolume) ??
    (positiveNumber(variant?.variantLength) && positiveNumber(variant?.variantWidth) && positiveNumber(variant?.variantHeight)
      ? Number(variant.variantLength) * Number(variant.variantWidth) * Number(variant.variantHeight)
      : null);
  const props = productProps(detail);
  const pack = rangeUpper(detail?.packWeight);
  if (!sku || sku.length > 200 || weight === null || volumeMm3 === null || !props.length) {
    throw new Error('CJ Tip requires verified SKU, weight, volume and logistics properties');
  }
  if (zip !== null && !/^\d{5}$/.test(zip)) throw new Error('Illustrative US ZIP must be five digits');
  if (!/^[A-Z]{2}$/.test(String(origin || ''))) throw new Error('Origin must be a two-letter country code');
  const wrapWeight = Math.ceil(Math.max(weight, pack || weight));
  const volume = Number((volumeMm3 / 1000).toFixed(3));
  if (!(volume > 0)) throw new Error('CJ Tip volume must be positive');
  const productType = String(detail?.productType ?? '').trim();
  const row = {
    srcAreaCode: origin,
    destAreaCode: 'US',
    weight: Math.ceil(weight),
    wrapWeight,
    volume,
    productProp: props,
    skuList: [sku],
    freightTrialSkuList: [{ skuQuantity: 1, sku }],
    shippingMode: 2,
    ...(zip ? { zip } : {}),
  };
  if (/^[01345]$/.test(productType)) {
    row.productTypes = [productType];
    if (productType === '5') row.trialCalculationType = '1';
  }
  return { reqDTOS: [row] };
}

export function chooseQuote(country, example = null, tip = null) {
  const chosen = country.offers.length ? country :
    tip?.offers.length ? tip :
    example?.offers.length ? example : null;
  const sources = [country, example, tip].filter(Boolean);
  return {
    offers: chosen?.offers || [],
    scope: chosen?.offers?.[0]?.scope || null,
    zeroPriced: sources.reduce((sum, q) => sum + (q.zeroPriced || 0), 0),
    returnedMethods: sources.reduce((sum, q) => sum + (q.returnedMethods || 0), 0),
    diagnostic: chosen ? chosen.diagnostic :
      sources.some(q => q.zeroPriced) ? 'zero_priced_methods_require_supplier_confirmation' :
        tip?.diagnostic || example?.diagnostic || country.diagnostic,
    finalDestinationVerified: false,
  };
}
