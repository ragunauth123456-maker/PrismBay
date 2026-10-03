import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

async function readJson(path, fallback = {}) {
  try {
    return JSON.parse(await fs.readFile(path, 'utf8'));
  } catch {
    return fallback;
  }
}

function minutesSince(value) {
  const ts = Date.parse(value || '');
  return Number.isFinite(ts) ? Math.max(0, Math.round((Date.now() - ts) / 60000)) : null;
}

function severityRank(band) {
  return ({ critical: 0, red: 1, yellow: 2, green: 3 })[band] ?? 4;
}

function uniqueBy(items, keyFn) {
  const seen = new Set();
  return items.filter(item => {
    const key = keyFn(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function validateGrowthContract(config) {
  if (!config || config.schemaVersion !== 1) throw new Error('invalid_autonomous_growth_schema');
  if (config.operatingRules?.verifiedSalesRemainUltimateKpi !== true) throw new Error('verified_sales_must_remain_ultimate_kpi');
  if (config.operatingRules?.missingEvidenceCreatesEvidenceDebtTask !== true) throw new Error('evidence_debt_rule_required');
  if (Number(config.portfolioRules?.minimumProductsInRaceBeforeFirstSale) < 3) throw new Error('product_race_floor_too_low');
  if (Number(config.portfolioRules?.minimumIndependentAcquisitionPaths) < 4) throw new Error('channel_floor_too_low');
  if (Number(config.portfolioRules?.minimumParallelRoutesForPrimaryBlocker) < 2) throw new Error('parallel_route_floor_too_low');
  for (const band of ['critical', 'red', 'yellow', 'green']) {
    if (!config.recoveryPolicy?.[band]?.action) throw new Error(`missing_recovery_policy:${band}`);
  }
  if (!Array.isArray(config.redTeamChecks) || config.redTeamChecks.length < 4) throw new Error('red_team_checks_missing');
  return true;
}

function buildRecoverySprints(scorecard, config) {
  return Object.entries(scorecard.companies || {})
    .map(([companyId, row]) => {
      const band = row.band || 'critical';
      const gaps = Array.isArray(row.evidenceGaps) ? row.evidenceGaps : [];
      const support = config.supportMap?.[companyId] || [];
      return {
        companyId,
        currentScore: Number(row.score || 0),
        band,
        priority: config.recoveryPolicy?.[band]?.priority ?? 9,
        recoveryAction: config.recoveryPolicy?.[band]?.action || 'create_evidence_backed_recovery_work',
        evidenceTargets: gaps,
        evidenceDebtCount: gaps.length,
        supportingCompanies: support,
        completionDefinition: gaps.length
          ? `Close at least one current evidence gap and raise ${companyId} score with verifiable evidence.`
          : `Maintain integrity and create measurable commercial progress for ${companyId}.`,
      };
    })
    .filter(row => row.band !== 'green')
    .sort((a, b) => severityRank(a.band) - severityRank(b.band) || a.currentScore - b.currentScore);
}

function buildEvidenceDebt(scorecard) {
  return Object.entries(scorecard.companies || {}).flatMap(([companyId, row]) =>
    (row.evidenceGaps || []).map(gap => ({
      companyId,
      evidenceGap: gap,
      status: 'open',
      rule: 'No KPI credit until evidence exists in an authoritative report or runtime source.',
      nextAction: `Instrument, collect or derive authoritative evidence for ${gap} without fabricating the result.`,
    }))
  );
}

function buildProductRace({ opportunities, promotion, dashboard, config }) {
  const nearReady = (promotion.nearReady || []).map(row => ({
    slug: row.slug,
    source: 'promotion-readiness',
    readinessPct: Number(row.readinessPct || 0),
    missing: row.missing || [],
    researchScore: null,
  }));
  const research = (opportunities.sourcingQueue || []).map(row => ({
    slug: row.slug,
    source: 'global-opportunity',
    readinessPct: 0,
    missing: row.next || [],
    researchScore: Number(row.researchScore || 0),
  }));
  const combined = uniqueBy([...nearReady, ...research], row => row.slug)
    .sort((a, b) => (b.readinessPct - a.readinessPct) || ((b.researchScore || 0) - (a.researchScore || 0)));
  const primary = dashboard.firstSaleWarRoom?.closestProduct || dashboard.closestProduct || combined[0]?.slug || null;
  const minimum = Number(config.portfolioRules.minimumProductsInRaceBeforeFirstSale || 5);
  const selected = combined.slice(0, Math.max(minimum, 5));
  return selected.map((row, index) => ({
    ...row,
    lane: row.slug === primary ? 'primary' : index < 3 ? 'backup-fast-lane' : 'research-lane',
    commercialRule: row.slug === primary
      ? 'Close the remaining commercial gates while backups progress independently.'
      : 'Advance supplier, stock, freight, economics and checkout evidence without waiting for the primary product.',
  }));
}

function buildBlockerEscalation({ dashboard, revenueBoard, config }) {
  const blocker = dashboard.currentBottleneck || {};
  const ageMinutes = minutesSince(revenueBoard.supplierReviewCheckedAt || dashboard.generatedAt || dashboard.checkedAt);
  const warning = Number(config.portfolioRules.primaryBlockerWarningMinutes || 120);
  const replace = Number(config.portfolioRules.primaryBlockerReplaceRouteMinutes || 360);
  const shift = Number(config.portfolioRules.primaryBlockerPortfolioShiftMinutes || 720);
  let stage = 'normal';
  let requiredAction = 'continue_primary_and_parallel_backup_work';
  if (ageMinutes !== null && ageMinutes >= shift) {
    stage = 'portfolio-shift';
    requiredAction = 'keep_primary_evidence_if_valid_but_shift_ceo_priority_to_best_backup_product_and_new_supplier_routes';
  } else if (ageMinutes !== null && ageMinutes >= replace) {
    stage = 'replace-route';
    requiredAction = 'replace_or_add_supplier_sku_fulfillment_or_checkout_route_now';
  } else if (ageMinutes !== null && ageMinutes >= warning) {
    stage = 'warning';
    requiredAction = 'add_parallel_route_and_raise_blocker_priority';
  }
  return {
    stage,
    ageMinutes,
    bottleneck: blocker.stage || null,
    owner: blocker.owner || null,
    product: blocker.product || null,
    missing: blocker.missing || [],
    requiredAction,
    rule: 'A stale blocker never becomes a waiting state.',
  };
}

function buildFactories({ dashboard, strategyBoard, config }) {
  const primary = dashboard.firstSaleWarRoom?.closestProduct || dashboard.closestProduct || 'current-primary';
  const paths = Array.isArray(strategyBoard.acquisitionPaths) ? strategyBoard.acquisitionPaths.map(row => typeof row === 'string' ? row : row.id).filter(Boolean) : [];
  return {
    offerFactory: {
      owner: 'offer-engineering',
      targetProduct: primary,
      requiredOutput: Number(config.preSaleFactories.offerHypothesesPerPrimaryProduct || 3),
      action: 'Prepare evidence-gated offer hypotheses; do not change live price without approval and verified economics.',
    },
    creativeFactory: {
      owner: 'creative-studio',
      targetProduct: primary,
      requiredOutput: Number(config.preSaleFactories.creativeConceptsPerPrimaryProduct || 5),
      action: 'Prepare original rights-safe problem/solution, demo, FAQ, comparison and objection-handling concepts.',
    },
    croFactory: {
      owner: 'storefront-conversion',
      targetProduct: primary,
      requiredOutput: Number(config.preSaleFactories.croHypothesesPerPrimaryProduct || 3),
      action: 'Prepare measurable buyer-path hypotheses around trust, shipping disclosure, CTA and checkout friction.',
    },
    seoFactory: {
      owner: 'organic-growth',
      targetProduct: primary,
      requiredOutput: Number(config.preSaleFactories.seoIntentAssetsPerPrimaryProduct || 3),
      action: 'Prepare owned-search problem, comparison and use-case assets without inventing rankings or demand.',
    },
    measurementFactory: {
      owner: 'revenue-analytics',
      activeChannels: paths,
      requiredPlans: paths.length * Number(config.preSaleFactories.measurementPlansPerActiveChannel || 1),
      action: 'Ensure every activated channel has attribution and a measurable success/failure definition before scaling.',
    },
  };
}

function buildChannelMatrix(strategyBoard, promotionReady) {
  const paths = Array.isArray(strategyBoard.acquisitionPaths) ? strategyBoard.acquisitionPaths : [];
  return paths.map(path => {
    const id = typeof path === 'string' ? path : path.id;
    return {
      id,
      status: promotionReady > 0 ? 'activation-check' : 'prepare-only',
      activationGate: promotionReady > 0 ? 'confirm account eligibility, product eligibility, rights and measurement' : 'wait for a promotion-ready product while preparation continues',
    };
  });
}

export function buildGrowthBoard({ config, scorecard, dashboard, opportunities, promotion, strategyBoard, revenueBoard }) {
  validateGrowthContract(config);
  const verifiedSales = Number(scorecard.verifiedSales || dashboard.verifiedSales || 0);
  const promotionReady = Number(promotion.promotionEligibleCount || dashboard.promotionEligibleCount || 0);
  const recoverySprints = buildRecoverySprints(scorecard, config);
  const evidenceDebt = buildEvidenceDebt(scorecard);
  const productRace = buildProductRace({ opportunities, promotion, dashboard, config });
  const blockerEscalation = buildBlockerEscalation({ dashboard, revenueBoard, config });
  const factories = buildFactories({ dashboard, strategyBoard, config });
  const channelMatrix = buildChannelMatrix(strategyBoard, promotionReady);
  const criticalCompanies = recoverySprints.filter(row => row.band === 'critical').map(row => row.companyId);
  const redCompanies = recoverySprints.filter(row => row.band === 'red').map(row => row.companyId);
  const primaryProduct = productRace.find(row => row.lane === 'primary')?.slug || productRace[0]?.slug || null;
  const parallelRouteFloor = Number(config.portfolioRules.minimumParallelRoutesForPrimaryBlocker || 3);
  const existingAlternatives = dashboard.firstSaleWarRoom?.alternativePathsInProgress || dashboard.alternativePaths || [];
  const routeDeficit = Math.max(0, parallelRouteFloor - existingAlternatives.length);

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    mode: verifiedSales > 0 ? 'post-sale-scale-with-evidence' : 'pre-sale-autonomous-recovery',
    verifiedSales,
    objective: config.objective,
    ceoPriority: verifiedSales > 0
      ? 'Protect fulfillment and contribution margin, then replicate the verified acquisition path.'
      : criticalCompanies.length
        ? `Recover critical functions now: ${criticalCompanies.join(', ')} while closing the primary commercial blocker.`
        : 'Close the primary blocker while pushing backup products, offers, channels and experiments in parallel.',
    primaryProduct,
    blockerEscalation,
    recoverySprints,
    evidenceDebt,
    evidenceDebtCount: evidenceDebt.length,
    productRace,
    productRaceCount: productRace.length,
    factories,
    channelMatrix,
    redTeam: {
      targetProduct: primaryProduct,
      checks: config.redTeamChecks,
      purpose: 'Attempt to disprove commercial readiness before resources are scaled; failures become evidence-backed tasks.',
    },
    portfolioControls: {
      criticalCompanies,
      redCompanies,
      currentParallelRoutes: existingAlternatives.length,
      requiredParallelRoutes: parallelRouteFloor,
      parallelRouteDeficit: routeDeficit,
      minimumProductsInRace: Number(config.portfolioRules.minimumProductsInRaceBeforeFirstSale || 5),
      minimumAcquisitionPaths: Number(config.portfolioRules.minimumIndependentAcquisitionPaths || 6),
    },
    nextActions: [
      ...recoverySprints.slice(0, 5).map(row => `${row.companyId}: ${row.recoveryAction}`),
      ...(routeDeficit > 0 ? [`commerce-control: create ${routeDeficit} additional independent blocker route(s)`] : []),
      `supplier-fulfillment: execute blocker escalation ${blockerEscalation.requiredAction}`,
      `product-intelligence: maintain at least ${config.portfolioRules.minimumProductsInRaceBeforeFirstSale} products in the commercial race`,
      'revenue-analytics: retire evidence debt only when authoritative evidence exists',
    ],
    hardBoundaries: config.operatingRules,
  };
}

export async function main() {
  const config = await readJson('config/autonomous-growth-system.json');
  const board = buildGrowthBoard({
    config,
    scorecard: await readJson('growth-reports/strict-kpi-scorecard.json'),
    dashboard: await readJson('growth-reports/prismbay-commerce-group-dashboard.json'),
    opportunities: await readJson('growth-reports/global-commerce-opportunities.json'),
    promotion: await readJson('growth-reports/retail-promotion-swarm.json'),
    strategyBoard: await readJson('growth-reports/sales-strategy-board.json'),
    revenueBoard: await readJson('growth-reports/paperclip-revenue-board.json'),
  });
  await fs.mkdir('growth-reports', { recursive: true });
  await fs.writeFile('growth-reports/ceo-autonomous-growth-board.json', JSON.stringify(board, null, 2) + '\n');
  await fs.writeFile('growth-reports/evidence-debt-ledger.json', JSON.stringify({ generatedAt: board.generatedAt, openCount: board.evidenceDebtCount, items: board.evidenceDebt }, null, 2) + '\n');
  console.log(JSON.stringify({
    mode: board.mode,
    verifiedSales: board.verifiedSales,
    primaryProduct: board.primaryProduct,
    criticalCompanies: board.portfolioControls.criticalCompanies,
    redCompanies: board.portfolioControls.redCompanies,
    recoverySprintCount: board.recoverySprints.length,
    evidenceDebtCount: board.evidenceDebtCount,
    productRaceCount: board.productRaceCount,
    blockerEscalation: board.blockerEscalation.stage,
  }, null, 2));
  return board;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
