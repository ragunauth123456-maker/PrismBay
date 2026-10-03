import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const scoreFields = ['demand','shipping','demo','safety','returnRisk','competitionOpportunity','supplierDiscoverability'];

function parseDate(value) {
  const t = Date.parse(String(value || ''));
  return Number.isFinite(t) ? t : null;
}

export function researchScore(candidate = {}) {
  return scoreFields.reduce((sum, key) => sum + (Number(candidate?.scores?.[key]) || 0), 0);
}

export function catalogSkus(catalog = {}) {
  const values = new Set();
  for (const mapping of Array.isArray(catalog?.mappings) ? catalog.mappings : []) {
    for (const item of Array.isArray(mapping?.items) ? mapping.items : []) {
      if (item?.sku) values.add(String(item.sku));
    }
  }
  return values;
}

export function freshEvidenceCount(candidate, sourceMap, now = Date.now(), freshDays = 14) {
  let count = 0;
  for (const id of Array.isArray(candidate?.evidence) ? candidate.evidence : []) {
    const source = sourceMap.get(id);
    if (!source) continue;
    const when = parseDate(source.retrieved || source.published);
    if (when === null) continue;
    const ageDays = Math.max(0, (now - when) / 86400000);
    if (ageDays <= freshDays) count += 1;
  }
  return count;
}

export function buildCatalogOpportunityBridge({ seed, supplierCatalog, physicalCatalog, authorization, now = Date.now() }) {
  if (!Array.isArray(seed?.candidates) || !Array.isArray(seed?.sources)) throw new Error('market signal seed required');
  const sourceMap = new Map(seed.sources.map(source => [source.id, source]));
  const supplierMap = new Map((supplierCatalog?.candidates || []).map(candidate => [candidate.slug, candidate]));
  const mappedSkus = catalogSkus(physicalCatalog);
  const checkoutSkus = new Set(authorization?.checkoutInfrastructure?.verifiedCheckoutSkus || []);

  const candidates = seed.candidates.map(candidate => {
    const supplier = supplierMap.get(candidate.slug) || null;
    const storeSku = String(candidate.storeSku || supplier?.storeSku || candidate.slug);
    const storeMapped = mappedSkus.has(storeSku);
    const checkoutInfrastructureVerified = checkoutSkus.has(storeSku);
    const score = researchScore(candidate);
    const freshCount = freshEvidenceCount(candidate, sourceMap, now);
    const supplierQueued = Boolean(supplier);

    // This score allocates research/worker attention only. It never means profit-ready or checkout-ready.
    const accelerationScore = score
      + Math.min(8, freshCount * 2)
      + (supplierQueued ? 5 : 0)
      + (storeMapped ? 12 : 0)
      + (checkoutInfrastructureVerified ? 12 : 0);

    let nextAction;
    if (checkoutInfrastructureVerified) {
      nextAction = 'verify exact supplier variant and stock, obtain exact buyer-destination freight, validate full unit economics, then issue checkout only for the qualifying buyer/session';
    } else if (storeMapped) {
      nextAction = 'verify exact supplier variant, stock and destination freight, then validate checkout infrastructure for this existing store SKU';
    } else if (supplierQueued) {
      nextAction = 'verify supplier identity, variant stock and destination freight before building any new storefront or checkout surface';
    } else {
      nextAction = 'keep in research until sourcing capacity is allocated; do not build commercial surfaces yet';
    }

    return {
      slug: candidate.slug,
      name: candidate.name,
      storeSku,
      researchScore: score,
      evidenceCount: Array.isArray(candidate.evidence) ? candidate.evidence.length : 0,
      freshEvidenceCount: freshCount,
      supplierQueued,
      storeMapped,
      checkoutInfrastructureVerified,
      accelerationScore,
      commercialState: 'evidence_only',
      nextAction,
    };
  }).sort((a, b) => b.accelerationScore - a.accelerationScore || b.researchScore - a.researchScore || a.slug.localeCompare(b.slug));

  return {
    schemaVersion: 1,
    generatedAt: new Date(now).toISOString(),
    objective: 'Minimize legitimate time-to-sale by combining fresh demand evidence with existing PrismBay store infrastructure while preserving every supplier, freight, rights, checkout and unit-economics gate.',
    profitReadyCount: 0,
    checkoutReleasedCount: 0,
    shortestPathQueue: candidates.slice(0, 8),
    existingStoreDemandCandidates: candidates.filter(row => row.storeMapped),
    candidates,
    safeguards: {
      marketplaceDemandIsCategoryEvidenceOnly: true,
      storeMappingDoesNotProveSupplierIdentity: true,
      exactBuyerFreightStillRequired: true,
      sessionScopedCheckoutOnlyAfterEconomicsPass: true,
      paidSpendAuthorized: false,
      automaticSupplierOrdering: false,
    },
  };
}

export async function main() {
  const [seed, supplierCatalog, physicalCatalog, authorization] = await Promise.all([
    fs.readFile('paperclip/prismbay-global-commerce/research/current-market-signals.json', 'utf8').then(JSON.parse),
    fs.readFile('paperclip/prismbay-global-commerce/research/supplier-candidates.json', 'utf8').then(JSON.parse),
    fs.readFile('services/physical-orders/catalog.prismbay-live.json', 'utf8').then(JSON.parse),
    fs.readFile('config/retail-commercial-authorization.json', 'utf8').then(JSON.parse),
  ]);
  const board = buildCatalogOpportunityBridge({ seed, supplierCatalog, physicalCatalog, authorization });
  await fs.mkdir('growth-reports', { recursive: true });
  await fs.writeFile('growth-reports/catalog-opportunity-bridge.json', JSON.stringify(board, null, 2) + '\n');
  console.log(JSON.stringify({ shortestPathQueue: board.shortestPathQueue, existingStoreDemandCandidates: board.existingStoreDemandCandidates.map(x => x.slug), profitReadyCount: board.profitReadyCount }, null, 2));
  return board;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
