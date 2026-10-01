// Conservative alternate sourcing for the existing CJ read-only verifier.
// Search terms change recall only. Every returned product must still pass
// strict name, sale-status, US-stock and positive-price checks.
const alternates = Object.freeze({
  'cordless-handheld-vacuum':['cordless portable handheld car vacuum cleaner','mini cordless hand vacuum cleaner'],
  'hanging-closet-organizer':['hanging closet shelf storage organizer','wardrobe hanging storage shelves organizer'],
  'roll-up-dish-rack':['silicone roll up dish drying rack','over sink roll up drying rack'],
  'extendable-high-zone-duster':['telescopic microfiber duster','extendable long reach dusting cleaner'],
  'dryer-vent-cleaner-kit':['dryer vent lint cleaning brush kit','dryer duct lint cleaner brush'],
  'self-standing-floor-mop':['self standing floor mop','upright standing flat mop'],
  'window-washer-squeegee':['window glass washer squeegee','window cleaning squeegee washer'],
  'appliance-cord-organizer':['kitchen appliance cord organizer','adhesive cord wrapper holder appliance'],
  'rug-grippers':['non slip rug gripper adhesive','rug corner gripper pads'],
  'bottle-brush-set':['bottle cleaning brush set','water bottle cleaning brush kit'],
  'sheet-laundry-detangler':['bed sheet laundry detangler','laundry sheet anti tangle ball'],
  'pan-scraper':['non scratch pot pan scraper','cookware dish pan cleaning scraper'],
});

export function candidateSearches(candidate) {
  const primary = typeof candidate?.query === 'string' ? candidate.query.trim() : '';
  if (!primary || primary.length > 100) return [];
  const extras = alternates[String(candidate?.slug || '')] || [];
  const seen = new Set();
  return [primary, ...extras].filter(query => {
    const key = String(query || '').trim().toLowerCase();
    if (!key || key.length > 100 || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 3);
}

export function uniqueEligibleProducts(productLists, limit = 3) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 3) throw new Error('Invalid candidate inspection limit');
  const out=[], seen=new Set();
  for (const products of productLists) {
    for (const product of products) {
      const id=String(product?.id || '');
      if (!id || seen.has(id)) continue;
      seen.add(id);out.push(product);
      if (out.length>=limit) return out;
    }
  }
  return out;
}

export function selectBestInspection(results) {
  if (!Array.isArray(results) || results.length===0) return null;
  // No amount of warehouse inventory can replace verified variant stock
  // or a genuinely priced freight estimate.
  const grade=r=>Number(Boolean(r.freightVerified))*4+
    Number(Boolean(r.variantInventoryVerified))*2+
    Number(Boolean(r.supplierVerified));
  return [...results].sort((a,b)=>grade(b)-grade(a))[0];
}
