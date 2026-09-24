import fs from 'node:fs/promises';

const seeds = [
  { slug: 'cordless-handheld-vacuum', name: 'Cordless Handheld Vacuum', query: 'cordless handheld vacuum', videoFit: 0.98 },
  { slug: 'extendable-high-zone-duster', name: 'Extendable High-Zone Duster', query: 'extendable high zone duster', videoFit: 0.90 },
  { slug: 'dryer-vent-cleaner-kit', name: 'Dryer Vent Cleaner Kit', query: 'dryer vent cleaner kit', videoFit: 0.94 },
  { slug: 'self-standing-floor-mop', name: 'Self-Standing Floor Mop', query: 'self standing floor mop', videoFit: 0.88 },
  { slug: 'window-washer-squeegee', name: '3-in-1 Window Washer & Squeegee', query: 'window washer squeegee', videoFit: 0.91 },
  { slug: 'roll-up-dish-rack', name: 'Roll-Up Dish Drying Rack', query: 'roll up dish drying rack', videoFit: 0.82 },
  { slug: 'appliance-cord-organizer', name: 'Appliance Cord Organizer', query: 'appliance cord organizer', videoFit: 0.80 },
  { slug: 'rug-grippers', name: 'Reusable Rug Grippers', query: 'rug grippers reusable', videoFit: 0.78 },
  { slug: 'bottle-brush-set', name: 'Bottle Brush Cleaning Set', query: 'bottle brush cleaning set', videoFit: 0.84 },
  { slug: 'sheet-laundry-detangler', name: 'Bed Sheet Laundry Detangler', query: 'sheet laundry detangler', videoFit: 0.90 },
  { slug: 'hanging-closet-organizer', name: 'Hanging Closet Organizer', query: 'hanging closet organizer', videoFit: 0.75 },
  { slug: 'pan-scraper', name: 'Non-Scratch Pan Scraper', query: 'pan scraper cleaning tool', videoFit: 0.86 },
];

const DAY = 86400000;
const now = new Date();
const cjToken = process.env.CJ_ACCESS_TOKEN || '';

function decodeXml(value = '') {
  return value.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim()
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}
function parseItems(xml) {
  const items = [];
  for (const block of xml.match(/<item\b[\s\S]*?<\/item>/gi) || []) {
    const title = decodeXml(block.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '');
    const link = decodeXml(block.match(/<link>([\s\S]*?)<\/link>/i)?.[1] || '');
    const rawDate = decodeXml(block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] || '');
    const publishedAt = rawDate ? new Date(rawDate) : null;
    if (title) items.push({ title, link, publishedAt });
  }
  return items;
}

async function fetchFeed(url, source) {
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: { 'user-agent': 'PrismBay-Viral-Candidate-Engine/1.0' },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return { source, ok: false, items: [] };
    return { source, ok: true, items: parseItems(await response.text()) };
  } catch {
    return { source, ok: false, items: [] };
  }
}

function uniqueItems(feeds) {
  const seen = new Set();
  const out = [];
  for (const feed of feeds) {
    for (const item of feed.items) {
      const key = item.title.toLowerCase().replace(/\s+/g, ' ').trim();
      if (!seen.has(key)) {
        seen.add(key);
        out.push({ ...item, source: feed.source });
      }
    }
  }
  return out;
}
function attentionMetrics(items, videoFit) {
  const dated = items.filter(item => item.publishedAt instanceof Date && !Number.isNaN(item.publishedAt.getTime()));
  const last7 = dated.filter(item => now - item.publishedAt <= 7 * DAY).length;
  const last30 = dated.filter(item => now - item.publishedAt <= 30 * DAY).length;
  const volume = Math.min(1, items.length / 25);
  const recency = Math.min(1, (last7 * 2 + last30) / 16);
  const score = Math.round((volume * 45 + recency * 30 + videoFit * 25) * 10) / 10;
  return { score, mentions: items.length, last7, last30 };
}

function attentionLabel(score) {
  if (score >= 70) return 'high-attention';
  if (score >= 55) return 'promotion-watch';
  if (score >= 35) return 'research';
  return 'low-signal';
}

function safeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function roundRetail(value) {
  return Math.max(14.95, Math.ceil(value) - 0.05);
}

function flattenCjProducts(payload) {
  const content = payload?.data?.content;
  if (!Array.isArray(content)) return [];
  return content.flatMap(group => Array.isArray(group?.productList) ? group.productList : []);
}
async function searchCj(query, trendingOnly = true) {
  if (!cjToken) return [];
  const url = new URL('https://developers.cjdropshipping.com/api2.0/v1/product/listV2');
  url.searchParams.set('keyWord', query);
  url.searchParams.set('page', '1');
  url.searchParams.set('size', '20');
  url.searchParams.set('countryCode', 'US');
  url.searchParams.set('addMarkStatus', '1');
  url.searchParams.set('startWarehouseInventory', '10');
  url.searchParams.set('verifiedWarehouse', '1');
  url.searchParams.set('zonePlatform', 'tiktok');
  url.searchParams.set('sort', 'desc');
  url.searchParams.set('orderBy', '1');
  url.searchParams.append('features', 'enable_category');
  url.searchParams.append('features', 'enable_video');
  if (trendingOnly) url.searchParams.set('productFlag', '0');

  try {
    const response = await fetch(url, {
      headers: { 'CJ-Access-Token': cjToken, 'user-agent': 'PrismBay-Viral-Candidate-Engine/1.0' },
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) return [];
    const payload = await response.json();
    return flattenCjProducts(payload);
  } catch {
    return [];
  }
}

async function supplierMatch(seed) {
  if (!cjToken) return null;
  let products = await searchCj(seed.query, true);
  if (!products.length) products = await searchCj(seed.query, false);
  const eligible = products.filter(item =>
    String(item?.saleStatus) === '3' &&
    safeNumber(item?.totalVerifiedInventory) !== null &&
    safeNumber(item?.totalVerifiedInventory) >= 10 &&
    safeNumber(item?.sellPrice) !== null &&
    safeNumber(item?.sellPrice) > 0
  );
  if (!eligible.length) return null;
  eligible.sort((a, b) =>
    (safeNumber(b?.listedNum) || 0) - (safeNumber(a?.listedNum) || 0) ||
    (safeNumber(b?.totalVerifiedInventory) || 0) - (safeNumber(a?.totalVerifiedInventory) || 0)
  );
  const item = eligible[0];
  const cost = safeNumber(item.nowPrice) || safeNumber(item.discountPrice) || safeNumber(item.sellPrice);
  const suggestedRetail = roundRetail((cost || 0) * 2.6);
  return {
    provider: 'CJdropshipping',
    productId: item.id,
    sku: item.sku || item.spu || null,
    name: item.nameEn || seed.name,
    image: item.bigImage || null,
    productCostUsd: cost,
    suggestedRetailUsd: suggestedRetail,
    listedNum: safeNumber(item.listedNum) || 0,
    verifiedInventory: safeNumber(item.totalVerifiedInventory) || 0,
    deliveryCycleDays: item.deliveryCycle || null,
    hasVideo: Number(item.isVideo) === 1,
    freeShippingFlag: Number(item.addMarkStatus) === 1,
    saleStatus: String(item.saleStatus),
  };
}
async function scoreSeed(seed) {
  const phrase = encodeURIComponent('"' + seed.query + '"');
  const socialPhrase = encodeURIComponent('"' + seed.query + '" TikTok OR Amazon');
  const feeds = await Promise.all([
    fetchFeed(`https://news.google.com/rss/search?q=${socialPhrase}&hl=en-US&gl=US&ceid=US:en`, 'Google News'),
    fetchFeed(`https://www.bing.com/news/search?q=${phrase}&format=rss`, 'Bing News'),
  ]);
  const items = uniqueItems(feeds);
  const metrics = attentionMetrics(items, seed.videoFit);
  const supplier = await supplierMatch(seed);
  const deliveryDays = supplier ? Number.parseInt(String(supplier.deliveryCycleDays || ''), 10) : NaN;
  const supplierReady = Boolean(
    supplier &&
    supplier.freeShippingFlag &&
    supplier.verifiedInventory >= 10 &&
    supplier.productCostUsd > 0 &&
    supplier.suggestedRetailUsd >= supplier.productCostUsd * 2
  );
  const promotionReady = Boolean(
    metrics.score >= 55 &&
    supplierReady &&
    (!Number.isFinite(deliveryDays) || deliveryDays <= 7)
  );

  return {
    slug: seed.slug,
    name: seed.name,
    query: seed.query,
    attentionScore: metrics.score,
    attentionLabel: attentionLabel(metrics.score),
    evidence: {
      publicMentions: metrics.mentions,
      mentionsLast7Days: metrics.last7,
      mentionsLast30Days: metrics.last30,
      sourcesAvailable: feeds.filter(feed => feed.ok).map(feed => feed.source),
      sampleSignals: items.slice(0, 4).map(item => ({
        title: item.title,
        source: item.source,
        publishedAt: item.publishedAt && !Number.isNaN(item.publishedAt.getTime()) ? item.publishedAt.toISOString() : null,
        url: item.link || null,
      })),
    },
    supplier,
    supplierReady,
    promotionReady,
    nextAction: !cjToken ? 'connect-cj' : !supplierReady ? 'continue-supplier-search' : 'calculate-freight-and-create-offer',
  };
}
const scored = [];
for (const seed of seeds) scored.push(await scoreSeed(seed));
scored.sort((a, b) => b.attentionScore - a.attentionScore || a.name.localeCompare(b.name));
const ranked = scored.map((item, index) => ({ ...item, rank: index + 1 }));

const catalog = {
  schemaVersion: 1,
  updatedAt: now.toISOString(),
  market: 'US',
  supplierIntegration: cjToken ? 'connected' : 'awaiting-cj-auth',
  methodology: 'Public attention and recency identify candidates. Supplier promotion requires verified US inventory and product-level checks. Freight and checkout creation occur only after supplier validation.',
  candidates: ranked,
};

const promotionQueue = {
  updatedAt: now.toISOString(),
  supplierIntegration: catalog.supplierIntegration,
  items: ranked
    .filter(item => item.attentionScore >= 55)
    .slice(0, 8)
    .map(item => ({
      rank: item.rank,
      slug: item.slug,
      product: item.name,
      attentionScore: item.attentionScore,
      supplierReady: item.supplierReady,
      promotionReady: item.promotionReady,
      nextAction: item.nextAction,
      supplier: item.supplier,
    })),
};

await fs.mkdir('public', { recursive: true });
await fs.mkdir('growth-reports', { recursive: true });
await fs.writeFile('public/viral-candidates.json', JSON.stringify(catalog, null, 2) + '\n');
await fs.writeFile('growth-reports/viral-promotion-queue.json', JSON.stringify(promotionQueue, null, 2) + '\n');

console.log(JSON.stringify({
  updatedAt: catalog.updatedAt,
  supplierIntegration: catalog.supplierIntegration,
  topCandidates: ranked.slice(0, 6).map(item => ({
    rank: item.rank,
    slug: item.slug,
    attentionScore: item.attentionScore,
    supplierReady: item.supplierReady,
    nextAction: item.nextAction,
  })),
}, null, 2));
