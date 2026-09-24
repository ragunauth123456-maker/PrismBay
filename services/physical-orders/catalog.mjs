import { readFileSync } from 'node:fs';

export const SKUS = Object.freeze(['scrubber', 'pethair', 'crevice', 'pressure-washer', 'mattress-vacuum', 'garment-steamer', 'mini-mop', 'drain-catcher', 'home-caddy']);

// This is an import boundary, not a guessed catalog. Export IDs from the physical app.
export function loadCatalog(path) {
  const catalog = JSON.parse(readFileSync(path, 'utf8'));
  if (catalog.store !== 'PrismBay Clean' || !/^acct_[a-zA-Z0-9]+$/.test(catalog.accountId) || !Array.isArray(catalog.mappings)) throw Error('Invalid physical catalog');
  const seen = new Set();
  for (const row of catalog.mappings) {
    if (!/^(plink_|price_|prod_)[a-zA-Z0-9]+$/.test(row.stripeId) || seen.has(row.stripeId) || !Array.isArray(row.items) || !row.items.length) throw Error('Invalid mapping');
    seen.add(row.stripeId);
    for (const item of row.items) if (!SKUS.includes(item.sku) || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) throw Error('Invalid physical item');
  }
  return catalog;
}

export function mapItems(session, catalog) {
  const id = value => typeof value === 'string' ? value : value?.id;
  const lookup = value => catalog.mappings.find(row => row.stripeId === id(value));
  const link = lookup(session.payment_link);
  // Payment-link mappings describe the exact fixed basket, including bundle composition.
  if (link) return structuredClone(link.items);
  const lines = session.line_items;
  if (!lines || lines.has_more !== false || !lines.data?.length) return null;
  const items = [];
  for (const line of lines.data) {
    const mapping = lookup(line.price) || lookup(line.price?.product);
    if (!mapping || !Number.isSafeInteger(line.quantity) || line.quantity < 1 || line.quantity > 100) return null;
    for (const item of mapping.items) items.push({ sku: item.sku, quantity: item.quantity * line.quantity });
  }
  return items;
}
