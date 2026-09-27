// Conservative alternate sourcing for the existing CJ read-only verifier.
// Search terms change recall only. Every returned product must still pass
// strict name, sale-status, US-stock and positive-price checks.
const alternates = Object.freeze({
  'cordless-handheld-vacuum':'cordless portable handheld car vacuum cleaner',
  'hanging-closet-organizer':'hanging closet shelf storage organizer',
  'roll-up-dish-rack':'silicone roll up dish drying rack',
  'extendable-high-zone-duster':'telescopic microfiber duster',
  'dryer-vent-cleaner-kit':'dryer vent lint cleaning brush kit',
  'self-standing-floor-mop':'self standing floor mop',
  'window-washer-squeegee':'window glass washer squeegee',
  'appliance-cord-organizer':'kitchen appliance cord organizer',
  'rug-grippers':'non slip rug gripper adhesive',
  'bottle-brush-set':'bottle cleaning brush set',
  'sheet-laundry-detangler':'bed sheet laundry detangler',
  'pan-scraper':'non scratch pot pan scraper',
});

export function candidateSearches(candidate) {
  const primary = typeof candidate?.query === 'string' ? candidate.query.trim() : '';
  const secondary = alternates[String(candidate?.slug || '')] || '';
  if (!primary || primary.length > 100 || !secondary) return primary ? [primary] : [];
  return primary.toLowerCase() === secondary.toLowerCase() ? [primary] : [primary,secondary];
}

export function uniqueEligibleProducts(productLists, limit = 2) {
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
  // or a genuinely priced country freight estimate.
  const grade=r=>Number(Boolean(r.freightVerified))*4+
    Number(Boolean(r.variantInventoryVerified))*2+
    Number(Boolean(r.supplierVerified));
  return [...results].sort((a,b)=>grade(b)-grade(a))[0];
}
