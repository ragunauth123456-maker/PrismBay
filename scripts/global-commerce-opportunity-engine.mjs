import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const scoreFields = ['demand','shipping','demo','safety','returnRisk','competitionOpportunity','supplierDiscoverability'];
const forbidden = /(supplement|vitamin|alcohol|nicotine|weapon|pesticide|medical drug|prescription|adult product)/i;

export function researchScore(candidate = {}) {
  const scores = candidate.scores || {};
  return scoreFields.reduce((sum, key) => sum + (Number.isFinite(Number(scores[key])) ? Number(scores[key]) : 0), 0);
}

export function economicsGate(e = {}) {
  const required = ['supplierCostUsd','freightUsd','retailUsd','feeRatePct'];
  if (!required.every(k => Number.isFinite(Number(e[k])) && Number(e[k]) >= 0) || Number(e.retailUsd) <= 0) {
    return { verified:false, profitReady:false, reason:'complete_verified_unit_economics_required' };
  }
  const retail = Number(e.retailUsd);
  const landed = Number(e.supplierCostUsd) + Number(e.freightUsd);
  const fees = retail * Number(e.feeRatePct) / 100;
  const returnsReserve = retail * 0.05;
  const contributionUsd = retail - landed - fees - returnsReserve;
  const contributionPct = contributionUsd / retail * 100;
  const profitReady = contributionUsd >= 3 && contributionPct >= 25 && landed <= retail * 0.55;
  return { verified:true, profitReady, landedCostUsd:+landed.toFixed(2), returnsReserveUsd:+returnsReserve.toFixed(2), contributionUsd:+contributionUsd.toFixed(2), contributionPct:+contributionPct.toFixed(1), reason:profitReady?'thresholds_pass':'economics_below_launch_threshold' };
}

export function buildOpportunityBoard(seed, economics = {}) {
  if (!seed || !Array.isArray(seed.candidates) || !Array.isArray(seed.sources)) throw new Error('invalid market-signal seed');
  const sourceIds = new Set(seed.sources.map(s => s.id));
  const candidates = seed.candidates.map(c => {
    const evidence = Array.isArray(c.evidence) ? c.evidence.filter(id => sourceIds.has(id)) : [];
    const score = researchScore(c);
    const blocked = forbidden.test(`${c.name || ''} ${c.category || ''}`);
    const econ = economicsGate(economics[c.slug] || {});
    const researchStage = blocked ? 'blocked_category' : score >= 85 ? 'source_now' : score >= 75 ? 'watch_or_source' : 'watch';
    return {...c, evidenceCount:evidence.length, researchScore:score, researchStage, commercialState:econ.profitReady?'profit_ready':'research_only', economics:econ};
  }).sort((a,b) => b.researchScore - a.researchScore || b.evidenceCount - a.evidenceCount || String(a.slug).localeCompare(String(b.slug)));
  const sourcingQueue = candidates.filter(c => c.researchStage === 'source_now' && c.commercialState !== 'profit_ready').slice(0,5);
  const profitReady = candidates.filter(c => c.commercialState === 'profit_ready');
  return {
    schemaVersion:1,
    generatedAt:new Date().toISOString(),
    objective:'Continuously discover and validate products with positive verified contribution economics before launch.',
    researchOnly:true,
    sourceCount:seed.sources.length,
    candidateCount:candidates.length,
    sourcingQueue:sourcingQueue.map(c => ({slug:c.slug,name:c.name,researchScore:c.researchScore,evidenceCount:c.evidenceCount,next:['verify exact supplier and variant','verify physical stock','quote destination freight','collect product cost','set evidence-backed retail price','calculate fees and contribution margin']})),
    profitReadyCount:profitReady.length,
    profitReady:profitReady.map(c => ({slug:c.slug,name:c.name,economics:c.economics})),
    candidates,
    safeguards:{trendIsNotProfitProof:true,paidSpend:false,automaticSupplierOrdering:false,bulkOutreach:false,fabricatedReviews:false,restrictedCategoriesBlocked:true}
  };
}

export async function main() {
  const seed = JSON.parse(await fs.readFile('paperclip/prismbay-global-commerce/research/current-market-signals.json','utf8'));
  let economics = {};
  try { economics = JSON.parse(await fs.readFile('growth-reports/global-commerce-unit-economics.json','utf8')); } catch {}
  const board = buildOpportunityBoard(seed,economics);
  await fs.mkdir('growth-reports',{recursive:true});
  await fs.writeFile('growth-reports/global-commerce-opportunities.json',JSON.stringify(board,null,2)+'\n');
  console.log(JSON.stringify({candidateCount:board.candidateCount,sourcingQueue:board.sourcingQueue,profitReadyCount:board.profitReadyCount},null,2));
  return board;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
