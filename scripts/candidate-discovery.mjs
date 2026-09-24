import fs from 'node:fs/promises';

// Curated dictionary: add explicit product phrases, never infer products from tokens.
export const taxonomy = [
  ['drawer-dividers', 'Drawer Dividers', 'organization', ['drawer dividers', 'drawer divider']],
  ['under-sink-organizer', 'Under Sink Organizer', 'organization', ['under sink organizer', 'under sink organizers']],
  ['shoe-storage-bench', 'Shoe Storage Bench', 'organization', ['shoe storage bench', 'shoe storage benches']],
  ['vacuum-storage-bags', 'Vacuum Storage Bags', 'organization', ['vacuum storage bags']],
  ['electric-spin-scrubber', 'Electric Spin Scrubber', 'cleaning', ['electric spin scrubber', 'electric spin scrubbers']],
  ['upholstery-cleaner', 'Upholstery Cleaner', 'cleaning', ['upholstery cleaner', 'upholstery cleaners']],
  ['silicone-toilet-brush', 'Silicone Toilet Brush', 'cleaning', ['silicone toilet brush', 'silicone toilet brushes']],
  ['shower-shelf', 'Shower Shelf', 'home', ['shower shelf', 'shower shelves']],
].map(([slug, name, category, phrases]) => ({ slug, name, category, phrases, query: phrases[0], videoFit: 0.5 }));

// Publisher groups, not feed names, establish independence. Aggregators are excluded.
export const discoverySources = [
  { source: 'apartment-therapy', publisher: 'apartment-therapy-media', host: 'www.apartmenttherapy.com', url: 'https://www.apartmenttherapy.com/main.rss' },
  { source: 'bob-vila', publisher: 'recurrent', host: 'www.bobvila.com', url: 'https://www.bobvila.com/feed/' },
  { source: 'good-housekeeping', publisher: 'hearst', host: 'www.goodhousekeeping.com', url: 'https://www.goodhousekeeping.com/rss/all.xml/' },
];
const DAY = 86400000;
const normalize = value => String(value).normalize('NFKC').toLowerCase().replace(/[\u2010-\u2015-]/g, ' ').replace(/\s+/g, ' ').trim();
function matches(title, phrase) {
  const escaped = normalize(phrase).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}($|[^\\p{L}\\p{N}])`, 'u').test(normalize(title));
}
function evidence(item, source, now) {
  if (!item || typeof item.title !== 'string' || !item.publishedAt) return null;
  const time = new Date(item.publishedAt).getTime();
  if (!Number.isFinite(time) || time > now || now - time > 30 * DAY) return null;
  try {
    const url = new URL(item.link);
    if (url.protocol !== 'https:' || url.hostname !== source.host || url.username || url.password) return null;
    url.search = ''; url.hash = '';
    return { title: item.title, link: url.href, publishedAt: new Date(time).toISOString(), source: source.source };
  } catch { return null; }
}

export function expandSeeds(baseSeeds, feeds, previous = {}, now = new Date()) {
  const timestamp = new Date(now).getTime();
  const records = [];
  for (const product of taxonomy) {
    if (baseSeeds.some(seed => seed.slug === product.slug || product.phrases.some(phrase => normalize(seed.query) === normalize(phrase)))) continue;
    const old = Array.isArray(previous.records) ? previous.records.find(record => record?.slug === product.slug) : null;
    const inputs = [...(Array.isArray(old?.evidence) ? old.evidence : [])];
    for (const feed of feeds) {
      if (feed.ok && Array.isArray(feed.items)) inputs.push(...feed.items.map(item => ({ ...item, source: feed.source })));
    }
    const seenTitles = new Set(), seenUrls = new Set(), publishers = new Set(), signals = [];
    for (const item of inputs) {
      const source = discoverySources.find(source => source.source === item?.source);
      const signal = source && evidence(item, source, timestamp);
      if (!signal || !product.phrases.some(phrase => matches(signal.title, phrase))) continue;
      const title = normalize(signal.title).replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
      if (seenTitles.has(title) || seenUrls.has(signal.link)) continue;
      seenTitles.add(title); seenUrls.add(signal.link); publishers.add(source.publisher); signals.push(signal);
    }
    if (!signals.length) continue;
    records.push({ slug: product.slug, status: signals.length >= 2 && publishers.size >= 2 ? 'research' : 'observing', evidence: signals });
  }
  return {
    state: { schemaVersion: 1, taxonomyVersion: 1, updatedAt: new Date(timestamp).toISOString(), records },
    seeds: [...baseSeeds, ...records.filter(record => record.status === 'research').map(record => ({ ...taxonomy.find(product => product.slug === record.slug), discoveryEvidence: record.evidence }))],
  };
}

export async function readDiscoveryState(path) {
  try {
    const state = JSON.parse(await fs.readFile(path, 'utf8'));
    return state?.schemaVersion === 1 && Array.isArray(state.records) ? state : {};
  } catch (error) {
    if (error.code === 'ENOENT' || error instanceof SyntaxError) return {};
    throw error;
  }
}
export async function writeDiscoveryState(path, state) {
  await fs.writeFile(`${path}.tmp`, JSON.stringify(state, null, 2) + '\n');
  await fs.rename(`${path}.tmp`, path);
}

export function unverifiedGates() {
  return { freightReady: false, mediaRightsReady: false, liveStripePricingReady: false, promotionReady: false, listed: false };
}
