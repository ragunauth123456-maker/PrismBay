import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const scoreFields = ['demand','shipping','demo','safety','returnRisk','competitionOpportunity','supplierDiscoverability'];
const forbidden = /(supplement|vitamin|alcohol|nicotine|weapon|pesticide|medical drug|prescription|adult product)/i;

export function researchScore(candidate = {}) {
  const scores = candidate.scores || {};
  return scoreFields.reduce((sum, key) => sum + (Number.isFinite(Number(scores[key])) ? Number(scores[key]) : 0), 0);
}

function parseDate(value) {
  const ts = Date.parse(String(value || ''));
  return Number.isFinite(ts) ? ts : null;
}
function sourceAgeDays(source = {}, asOf = new Date().toISOString()) {
  const observed = parseDate(source.retrieved || source.published);
  const now = parseDate(asOf) ?? Date.now();
  if (observed === null) return null;
  return Math.max(0, Math.floor((now - observed) / 86_400_000));
}
function freshnessScore(days) {
  if (days === null) return 20;
  if (days <= 7) return 100;
  if (days <= 30) return 85;
  if (days <= 90) return 65;
  if (days <= 180) return 45;
  if (days <= 365) return 30;
  return 15;
}

export function evidenceQuality(candidate = {}, sources = [], asOf = new Date().toISOString()) {
  const sourceMap = new Map((Array.isArray(sources) ? sources : []).map(source => [source.id, source]));
  const rows = (Array.isArray(candidate.evidence) ? candidate.evidence : []).map(id => sourceMap.get(id)).filter(Boolean);
  const publishers = new Set(rows.map(row => String(row.publisher || '').trim()).filter(Boolean));
  const markets = new Set(rows.map(row => String(row.market || '').trim()).filter(Boolean));
  const ages = rows.map(row => sourceAgeDays(row, asOf));
  const freshness = ages.map(freshnessScore);
  const averageFreshness = freshness.length ? freshness.reduce((sum, value) => sum + value, 0) / freshness.length : 0;
  const freshEvidenceCount = ages.filter(days => days !== null && days <= 30).length;
  const publisherPoints = publishers.size >= 3 ? 50 : publishers.size === 2 ? 40 : publishers.size === 1 ? 20 : 0;
  const marketPoints = markets.size >= 2 ? 20 : markets.size === 1 ? 10 : 0;
  const evidencePoints = Math.min(rows.length, 4) * 5;
  const confidence = Math.min(100, Math.round(averageFreshness * 0.35 + publisherPoints + marketPoints + evidencePoints));
  return {
    evidenceCount: rows.length,
    publisherCount: publishers.size,
    marketCount: markets.size,
    freshEvidenceCount,
    averageFreshness: +averageFreshness.toFixed(1),
    confidence,
    independentlyCorroborated: publishers.size >= 2,
    sourceAgesDays: ages,
  };
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
  const asOf = seed.asOf || new Date().toISOString();
  const candidates = seed.candidates.map(c => {
    const evidence = Array.isArray(c.evidence) ? c.evidence.filter(id => sourceIds.has(id)) : [];
    const score = researchScore(c);
    const quality = evidenceQuality({ ...c, evidence }, seed.sources, asOf);
    const blocked = forbidden.test(`${c.name || ''} ${c.category || ''}`);
    const econ = economicsGate(economics[c.slug] || {});
    const adjustedResearchScore = +(score * (0.8 + 0.2 * quality.confidence / 100)).toFixed(1);
    const commercialProximityBonus = c.storeSku ? 6 : 0;
    const priorityScore = +(adjustedResearchScore + commercialProximityBonus).toFixed(1);
    const corroborationGate = quality.independentlyCorroborated || (Boolean(c.storeSku) && quality.freshEvidenceCount >= 1);
    const researchStage = blocked ? 'blocked_category' : score >= 85 && quality.confidence >= 55 && corroborationGate ? 'source_now' : score >= 75 ? 'watch_or_source' : 'watch';
    return {...c, evidenceCount:evidence.length, evidenceQuality:quality, researchScore:score, adjustedResearchScore, commercialProximityBonus, priorityScore, researchStage, commercialState:econ.profitReady?'profit_ready':'research_only', economics:econ};
  }).sort((a,b) => b.priorityScore - a.priorityScore || b.evidenceQuality.confidence - a.evidenceQuality.confidence || b.researchScore - a.researchScore || String(a.slug).localeCompare(String(b.slug)));
  const sourcingQueue = candidates.filter(c => c.researchStage === 'source_now' && c.commercialState !== 'profit_ready').slice(0,5);
  const profitReady = candidates.filter(c => c.commercialState === 'profit_ready');
  return {
    schemaVersion:2,
    generatedAt:new Date().toISOString(),
    objective:'Continuously discover and validate products using fresh, independently corroborated demand evidence and positive verified contribution economics before launch.',
    researchOnly:true,
    sourceCount:seed.sources.length,
    candidateCount:candidates.length,
    sourcingQueue:sourcingQueue.map(c => ({slug:c.slug,name:c.name,researchScore:c.researchScore,priorityScore:c.priorityScore,evidenceCount:c.evidenceCount,evidenceConfidence:c.evidenceQuality.confidence,publisherCount:c.evidenceQuality.publisherCount,freshEvidenceCount:c.evidenceQuality.freshEvidenceCount,next:['verify exact supplier and variant','verify physical stock','quote destination freight','collect product cost','set evidence-backed retail price','calculate fees and contribution margin']})),
    profitReadyCount:profitReady.length,
    profitReady:profitReady.map(c => ({slug:c.slug,name:c.name,economics:c.economics})),
    candidates,
    safeguards:{trendIsNotProfitProof:true,staleSignalsDecayed:true,independentCorroborationTracked:true,paidSpend:false,automaticSupplierOrdering:false,bulkOutreach:false,fabricatedReviews:false,restrictedCategoriesBlocked:true}
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
