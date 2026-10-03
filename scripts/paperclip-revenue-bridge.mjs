import fs from 'node:fs/promises';

async function readJson(file) { try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch { return null; } }

const promotion = await readJson('growth-reports/retail-promotion-swarm.json');
const tiktok = await readJson('growth-reports/tiktok-retail-readiness.json');
const firstSale = await readJson('growth-reports/first-sale-verification.json');
const storefront = await readJson('growth-reports/storefront-cro-auditor.json');
const supplier = await readJson('growth-reports/cj-worker-review.json');

const nearReady = Array.isArray(promotion?.nearReady) ? promotion.nearReady : [];
const nearest = nearReady[0] || null;
const tasks = [];

if (!firstSale?.verifiedFirstSale) {
  tasks.push({priority:1, assignee:'revenue-ceo', status:'active', title:'Drive first verified profitable non-test order'});
}
if (nearest?.missing?.length) {
  tasks.push({priority:1, assignee:'supplier-readiness', status:'blocked_or_active', title:`Close commercial gates for ${nearest.slug}`, blockers:nearest.missing});
}
if (tiktok?.siteVerificationReady === false) {
  tasks.push({priority:2, assignee:'growth-lead', status:'owner_or_provider_evidence', title:'Install exact TikTok provider verification file', evidenceRequired:['TikTok Developer Portal verification file']});
}
if (tiktok?.saleReadyProductCount === 0) {
  tasks.push({priority:2, assignee:'supplier-readiness', status:'active', title:'Produce at least one sale-ready SKU'});
}
if (storefront?.result?.activeStorefront?.status !== 200) {
  tasks.push({priority:1, assignee:'storefront-cro', status:'active', title:'Restore live storefront availability'});
}
if (!firstSale?.checks?.shipmentVerified) {
  tasks.push({priority:3, assignee:'analytics', status:'awaiting_real_order', title:'Collect privacy-safe supplier and shipment evidence after a real order'});
}

tasks.push({priority:3, assignee:'creator-partnerships', status:'research_only', title:'Maintain qualified creator and partner shortlist with no auto-send'});
tasks.push({priority:3, assignee:'cloud-ops', status:'active', title:'Keep GitHub retail swarm and evidence checks green'});

const board = {
  schemaVersion:1,
  generatedAt:new Date().toISOString(),
  company:'PrismBay Revenue Operations',
  goal:'First verified profitable non-test PrismBay Clean retail order with truthful attribution and verified fulfillment.',
  promotionEligibleCount:Number(promotion?.promotionEligibleCount || 0),
  verifiedFirstSale:firstSale?.verifiedFirstSale === true,
  nearestSaleReadyCandidate:nearest,
  supplierReviewCheckedAt:supplier?.checkedAt || null,
  tiktokReady:tiktok?.readyForPublicRetailPublishing === true,
  storefrontHttpStatus:storefront?.result?.activeStorefront?.status ?? null,
  tasks:tasks.sort((a,b)=>a.priority-b.priority),
  rules:{zeroCostDefault:true,noSpam:true,noFakeEngagement:true,noUnverifiedPromotion:true,educationalYouTubeSeparated:true}
};
await fs.mkdir('growth-reports',{recursive:true});
await fs.writeFile('growth-reports/paperclip-revenue-board.json',JSON.stringify(board,null,2)+'\n');
console.log(JSON.stringify(board,null,2));
