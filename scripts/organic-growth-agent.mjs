import fs from 'node:fs/promises';

const role = process.argv[2] || 'Storefront CRO Auditor';
const SHOP = process.env.PRISMBAY_SHOP_URL || 'https://prismbay-clean-49izhg.v2.appdeploy.ai/tiktok/';
const SHOP_CUSTOM = process.env.PRISMBAY_SHOP_CUSTOM_URL || 'https://shop.prismbayai.com/tiktok';
const SITE = process.env.PRISMBAY_SITE_URL || 'https://www.prismbayai.com';
const VERIFY = process.env.TIKTOK_VERIFY_URL || SITE + '/tiktokioWxniaZWfubplFsge1pzgPGhS04LORJ.txt';
const products = [
  'Cordless Pressure Washer','Cordless Handheld Vacuum','5-in-1 Electric Spin Scrubber',
  'Mattress Vacuum','Portable Garment Steamer','Portable Home Caddy',
  'Reusable Pet Hair Remover','Self-Squeeze Mini Mop','3-in-1 Crevice Cleaning Brush',
  'Sink Drain Catcher 2-Pack'
];

async function fetchText(url) {
  const r = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'PrismBay-Growth-Agent/1.0' } });
  const text = await r.text();
  return { ok: r.ok, status: r.status, url: r.url, text };
}

const match = (html, re) => (html.match(re)?.[1] || '').trim();
const count = (html, re) => [...html.matchAll(re)].length;
const strip = s => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

async function croAudit() {
  async function inspect(target) {
    const r = await fetchText(target);
    const html = r.text;
    return { target, status: r.status, finalUrl: r.url,
      title: strip(match(html, /<title[^>]*>([\s\S]*?)<\/title>/i)),
      description: match(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i),
      canonical: match(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)/i),
      h1: strip(match(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i)),
      ctaCount: count(html, /<(?:a|button)\b[^>]*>[\s\S]*?(?:buy|shop|checkout|order|view|see|get)[\s\S]*?<\/(?:a|button)>/gi),
      hasProductSchema: /"@type"\s*:\s*"(?:Product|ItemList)"/i.test(html),
      hasExpiredAugustCopy: /August\s+27|Aug\.?\s*27/i.test(html)
    };
  }
  return { activeStorefront: await inspect(SHOP), customDomain: await inspect(SHOP_CUSTOM) };
}

async function publisherReadiness() {
  const urls = [SITE + '/terms', SITE + '/privacy', VERIFY];
  const results = [];
  for (const url of urls) {
    const r = await fetchText(url);
    results.push({ url, status: r.status, ok: r.ok, finalUrl: r.url, bodyPreview: strip(r.text).slice(0, 160) });
  }
  const verification = results.find(x => x.url === VERIFY);
  return { checks: results, tiktokVerificationReady: Boolean(verification?.ok && /tiktok-developers-site-verification=/i.test(verification.bodyPreview)) };
}

function hookWriter() {
  const hour = new Date().getUTCHours();
  const p = products[hour % products.length];
  const hooks = [
    `Still doing this by hand? Meet the ${p}.`,
    `One practical tool for the mess you keep putting off: ${p}.`,
    `Quick reset idea: use the ${p} where it actually saves effort.`
  ];
  return { product: p, hooks, cta: 'See the product details at PrismBay Clean.', note: 'No unverified performance claims are added.' };
}

function trendScout() {
  return {
    priorityProducts: products.slice(0, 5),
    liveResearchQueries: [
      'TikTok Shop US cleaning tools current demand',
      'TikTok Shop cordless pressure washer current demand',
      'TikTok Shop electric spin scrubber current demand',
      'TikTok Shop garment steamer current demand'
    ],
    instruction: 'Use connected live-web research to validate demand before changing product priority.'
  };
}

function creatorScout() {
  return {
    segments: ['CleanTok','home organization','car cleaning','pet hair','household tools'],
    qualification: ['recent relevant content','real engagement','clear contact route','commission/revenue-share fit','no paid-upfront requirement'],
    outreachRule: 'Do not bulk-spam. Contact only qualified creators with a relevant product angle.'
  };
}

async function analyticsReviewer() {
  const statusUrl = 'https://prismbay-sales-control-plane-production.up.railway.app/status';
  const r = await fetchText(statusUrl);
  let parsed = null;
  try { parsed = JSON.parse(r.text); } catch {}
  return {
    statusEndpoint: statusUrl,
    httpStatus: r.status,
    live: r.ok,
    reported: parsed,
    rule: 'Internal/test traffic is not counted as demand or revenue.'
  };
}

async function offerOptimizer() {
  const r = await fetchText(SHOP);
  const html = r.text;
  const countdown = strip(match(html, /<div[^>]+id=["']timer["'][^>]*>([\s\S]*?)<\/div>/i));
  const saleEnd = match(html, /Ends\s+([A-Z][a-z]{2}\s+\d{1,2})/i);
  return {
    shopStatus: r.status,
    countdownText: countdown || null,
    saleEndText: saleEnd || null,
    staleAugustCopy: /August\s+27|Aug\.?\s*27/i.test(html),
    recommendation: 'Keep price/value claims tied to live checkout values; remove expired urgency immediately.'
  };
}

async function githubSupport() {
  const repos = ['puppeteer/puppeteer','browser-use/browser-use','microsoft/playwright','honojs/hono'];
  const out = [];
  for (const repo of repos) {
    const r = await fetch('https://api.github.com/repos/' + repo, { headers: { 'user-agent': 'PrismBay-Growth-Agent/1.0', accept: 'application/vnd.github+json' } });
    const j = r.ok ? await r.json() : {};
    out.push({ repo, status: r.status, updatedAt: j.updated_at || null, pushedAt: j.pushed_at || null, stars: j.stargazers_count ?? null, license: j.license?.spdx_id || null });
  }
  return { repos: out, use: 'Reference only; adopt code only after license and fit review.' };
}

const runners = {
  'Trend Scout': trendScout,
  'Hook/Creative Writer': hookWriter,
  'Storefront CRO Auditor': croAudit,
  'Creator/Partner Scout': creatorScout,
  'Publisher': publisherReadiness,
  'Analytics Reviewer': analyticsReviewer,
  'Offer Optimizer': offerOptimizer,
  'GitHub Support Scout': githubSupport
};

if (!runners[role]) {
  console.error('Unknown role:', role);
  process.exit(2);
}

const startedAt = new Date().toISOString();
const result = await runners[role]();
const report = { role, startedAt, finishedAt: new Date().toISOString(), result };
const safe = role.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
await fs.mkdir('growth-reports', { recursive: true });
await fs.writeFile('growth-reports/' + safe + '.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

const summary = process.env.GITHUB_STEP_SUMMARY;
if (summary) {
  const lines = [
    '## ' + role,
    '',
    'Started: ' + startedAt,
    '',
    '```json',
    JSON.stringify(result, null, 2).slice(0, 12000),
    '```',
    ''
  ];
  await fs.appendFile(summary, lines.join('\n'));
}
