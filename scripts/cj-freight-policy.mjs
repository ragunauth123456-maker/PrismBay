// Read-only CJ freight quote normalization. Never treat a zero-cost method
// as confirmed free shipping without CJ/supplier confirmation.
export function parseCJFreight(payload, scope = 'country_estimate', zip = null) {
  const services = Array.isArray(payload?.data) ? payload.data : [];
  const offers = [];
  let zeroPriced = 0;
  let invalid = 0;
  for (const service of services) {
    const raw = service?.logisticPrice;
    if (raw === null || raw === undefined || typeof raw === 'boolean' ||
        (typeof raw === 'string' && !raw.trim())) { invalid++; continue; }
    const usd = Number(raw);
    if (!Number.isFinite(usd) || usd < 0) { invalid++; continue; }
    if (usd === 0) { zeroPriced++; continue; }
    const name = String(service?.logisticName || '').trim();
    if (!name || name.length > 100) { invalid++; continue; }
    const aging = String(service?.logisticAging || '').trim();
    offers.push({ name, usd, aging: aging || null, scope,
      exampleZip: scope === 'example_zip_estimate' ? zip : null,
      finalDestinationVerified: false });
  }
  offers.sort((a, b) => a.usd - b.usd);
  return { offers: offers.slice(0, 5), zeroPriced, invalid,
    returnedMethods: services.length,
    diagnostic: offers.length ? 'priced_estimate_available' :
      zeroPriced ? 'zero_priced_methods_require_supplier_confirmation' :
        services.length ? 'no_usable_shipping_quote' : 'no_shipping_methods_returned' };
}

export function freightRequest(vid, zip = null) {
  if (typeof vid !== 'string' || !vid.trim() || vid.length > 200) {
    throw new Error('A validated variant ID is required');
  }
  if (zip !== null && !/^\\d{5}$/.test(zip)) {
    throw new Error('Illustrative US ZIP must be five digits');
  }
  return {
    startCountryCode: 'US',
    endCountryCode: 'US',
    products: [{ quantity: 1, vid }],
    ...(zip ? { zip } : {}),
  };
}

export function chooseQuote(country, example = null) {
  const chosen = country.offers.length ? country : example?.offers.length ? example : null;
  return {
    offers: chosen?.offers || [],
    scope: chosen === country ? 'country_estimate' :
      chosen === example ? 'example_zip_estimate' : null,
    zeroPriced: country.zeroPriced + (example?.zeroPriced || 0),
    returnedMethods: country.returnedMethods + (example?.returnedMethods || 0),
    diagnostic: chosen ? chosen.diagnostic :
      (country.zeroPriced || example?.zeroPriced) ?
        'zero_priced_methods_require_supplier_confirmation' :
        example?.diagnostic || country.diagnostic,
    finalDestinationVerified: false,
  };
}
