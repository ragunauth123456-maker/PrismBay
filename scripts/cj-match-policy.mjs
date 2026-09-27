// Fail-closed product identity checks. Keyword search alone is never a supplier match.
// No product reaches checkout, even on an identity match, without separate stock,
// freight, media-rights, pricing and manual commercial approval.
const policy = Object.freeze({
  'cordless-handheld-vacuum': {
    required: [/\b(vacuum|vac)\b/i, /\b(handheld|hand-held|cordless)\b/i],
    excluded: [/\b(shop[\s-]*vac|wet[\s/-]*dry|gallon|industrial|canister|upright|robot|paint sprayer)\b/i],
  },
  'extendable-high-zone-duster': {
    required: [/\bduster\b/i, /(extend|telescop|high[\s-]*zone|long[\s-]*reach)/i],
    excluded: [/\b(feather costume|paint roller)\b/i],
  },
  'dryer-vent-cleaner-kit': {
    required: [/\b(dryer|lint)\b/i, /\b(vent|duct)\b/i, /\b(clean|brush|kit)\b/i],
    excluded: [/\b(dryer machine|hair dryer)\b/i],
  },
  'self-standing-floor-mop': {
    required: [/\bmop\b/i, /\b(stand|self[\s-]*standing|upright)\b/i],
    excluded: [/\b(robot|vacuum)\b/i],
  },
  'window-washer-squeegee': {
    required: [/\b(window|glass)\b/i, /\b(wash|squeegee|clean)\b/i],
    excluded: [/\b(car windshield replacement|paint)\b/i],
  },
  'roll-up-dish-rack': {
    required: [/\b(dish|drying)\b/i, /\brack\b/i, /\b(roll[\s-]*up|foldable|folding|silicone)\b/i],
    excluded: [/\b(shoe|sneaker|flower print|clothes rack)\b/i],
  },
  'appliance-cord-organizer': {
    required: [/\b(cord|cable)\b/i, /\b(organizer|holder|wrap|clip)\b/i],
    excluded: [/\b(electrical junction|wall wiring)\b/i],
  },
  'rug-grippers': {
    required: [/\b(rug|carpet)\b/i, /\b(grip|non[\s-]*slip|adhesive)\b/i],
    excluded: [/\b(carpet cleaner|vacuum)\b/i],
  },
  'bottle-brush-set': {
    required: [/\bbottle\b/i, /\bbrush\b/i],
    excluded: [/\b(electric toothbrush|paint brush)\b/i],
  },
  'sheet-laundry-detangler': {
    required: [/\b(sheet|laundry)\b/i, /\b(detangl|tangle|twist|ball)\b/i],
    excluded: [/\b(hair|pet grooming)\b/i],
  },
  'hanging-closet-organizer': {
    required: [/\b(closet|wardrobe)\b/i, /\b(hanging|hangable|suspended)\b/i, /\b(organizer|shelf|storage)\b/i],
    excluded: [/\b(jewelry|mirror|cabinet|lockable|wall[\s-]*door)\b/i],
  },
  'pan-scraper': {
    required: [/\b(pan|pot|cookware|dish)\b/i, /\b(scrap|scrub)\b/i],
    excluded: [/\b(paint|wallpaper|industrial)\b/i],
  },
});

export function hasApprovedProductClass(slug) {
  return Object.prototype.hasOwnProperty.call(policy, String(slug || ''));
}

export function matchesIntendedProduct(candidate, name) {
  const rule = policy[String(candidate?.slug || '')];
  if (!rule || typeof name !== 'string' || !name.trim() || name.length > 500) return false;
  return rule.required.every(pattern => pattern.test(name)) &&
    !rule.excluded.some(pattern => pattern.test(name));
}

export function approvedClassCount() { return Object.keys(policy).length; }
