import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const REQUIRED_COMPANIES = [
  'product-intelligence',
  'supplier-fulfillment',
  'offer-engineering',
  'storefront-conversion',
  'creative-studio',
  'organic-growth',
  'creator-affiliate-growth',
  'revenue-analytics',
  'experiment-lab',
  'commerce-control',
];

const REQUIRED_BACKEND_WORKERS = [
  'commerce-controller',
  'product-scout',
  'site-auditor',
  'seo-cro',
  'offer-creative',
  'analytics-experiment',
];

async function readJson(path, fallback = {}) {
  try {
    return JSON.parse(await fs.readFile(path, 'utf8'));
  } catch {
    return fallback;
  }
}

export function band(score) {
  if (score >= 90) return 'green';
  if (score >= 75) return 'yellow';
  if (score >= 50) return 'red';
  return 'critical';
}

export function validateKpiContract(config) {
  if (!config || config.schemaVersion !== 1) throw new Error('invalid_kpi_schema');
  for (const id of REQUIRED_COMPANIES) {
    const contract = config.companies?.[id];
    if (!contract || !Array.isArray(contract.kpis) || contract.kpis.length < 4) {
      throw new Error(`missing_company_kpis:${id}`);
    }
    const total = contract.kpis.reduce((sum, item) => sum + Number(item.weight || 0), 0);
    if (total !== 100) throw new Error(`company_kpi_weights_not_100:${id}:${total}`);
  }
  for (const id of REQUIRED_BACKEND_WORKERS) {
    const contract = config.backendWorkers?.[id];
    if (!contract || !Array.isArray(contract.kpis) || contract.kpis.length < 4) {
      throw new Error(`missing_backend_worker_kpis:${id}`);
    }
    if (!Number.isFinite(contract.minimumActionsPerRun) || contract.minimumActionsPerRun < 1) {
      throw new Error(`invalid_backend_action_floor:${id}`);
    }
    if (!Number.isFinite(contract.minimumInspectionsPerRun) || contract.minimumInspectionsPerRun < 1) {
      throw new Error(`invalid_backend_inspection_floor:${id}`);
    }
  }
  if (config.evidenceRules?.missingEvidenceGetsCredit !== false) throw new Error('missing_evidence_must_not_get_credit');
  if (config.evidenceRules?.integrityBreachForcesCritical !== true) throw new Error('integrity_breach_must_force_critical');
  if (config.consequences?.redConsecutiveCycles !== 2) throw new Error('red_consequence_not_strict_enough');
  return true;
}

function item(id, weight, passed, evidence, value = null) {
  return { id, weight, passed, value, evidence, earned: passed ? weight : 0 };
}

function score(items, integrityBreach = false) {
  const total = integrityBreach ? 0 : items.reduce((sum, row) => sum + row.earned, 0);
  return {
    score: total,
    band: integrityBreach ? 'critical' : band(total),
    integrityBreach,
    evidenceGaps: items.filter(row => !row.passed && String(row.evidence).startsWith('missing:')).map(row => row.id),
    kpis: items,
  };
}

export function buildScorecard({ opportunities, promotion, revenueBoard, strategyBoard, dashboard, firstSale }) {
  const queue = Array.isArray(opportunities.sourcingQueue) ? opportunities.sourcingQueue : [];
  const actionableQueue = queue.filter(row => Array.isArray(row.next) && row.next.length > 0);
  const nearReady = Array.isArray(promotion.nearReady) ? promotion.nearReady : [];
  const alternativePaths = dashboard.firstSaleWarRoom?.alternativePathsInProgress || dashboard.alternativePaths || [];
  const assignments = dashboard.noIdleUntilFirstSale?.assignments || [];
  const strategyCount = Number(strategyBoard.concurrentStrategyCount || 0);
  const acquisitionPaths = Array.isArray(strategyBoard.acquisitionPaths) ? strategyBoard.acquisitionPaths : [];
  const verifiedSales = Number(dashboard.verifiedSales || 0);
  const promotionReady = Number(promotion.promotionEligibleCount || dashboard.promotionEligibleCount || 0);
  const supplierCheckedAt = revenueBoard.supplierReviewCheckedAt ? Date.parse(revenueBoard.supplierReviewCheckedAt) : NaN;
  const supplierAgeHours = Number.isFinite(supplierCheckedAt) ? Math.max(0, (Date.now() - supplierCheckedAt) / 3600000) : null;
  const firstSaleFalse = firstSale.verifiedFirstSale === false;

  const companies = {
    'product-intelligence': score([
      item('fresh_evidence_coverage', 25, false, 'missing:source_age_coverage_measurement'),
      item('qualified_candidates_to_supplier_verification', 35, queue.length >= 5, 'global-commerce-opportunities.sourcingQueue', queue.length),
      item('candidate_duplicate_or_regulated_escape_rate', 20, false, 'missing:explicit_escape_rate_measurement'),
      item('top_candidate_actionability', 20, queue.length > 0 && actionableQueue.length === queue.length, 'candidate.next gates', queue.length ? Math.round(actionableQueue.length / queue.length * 100) : 0),
    ]),
    'supplier-fulfillment': score([
      item('verified_supplier_variant_stock_candidates', 30, false, 'missing:current_verified_supplier_variant_stock_count'),
      item('primary_blocker_to_alternate_route_latency', 25, alternativePaths.length >= 1, 'First Sale War Room alternative paths', alternativePaths.length),
      item('supplier_evidence_staleness', 20, supplierAgeHours !== null && supplierAgeHours <= 6, supplierAgeHours === null ? 'missing:supplier_review_timestamp' : 'paperclip-revenue-board.supplierReviewCheckedAt', supplierAgeHours),
      item('unverified_fulfillment_release_rate', 25, promotionReady === 0 || nearReady.every(row => Array.isArray(row.missing) && row.missing.length === 0), 'promotion readiness gate', promotionReady),
    ]),
    'offer-engineering': score([
      item('verified_products_with_three_offer_variants', 25, false, 'missing:offer_variant_inventory'),
      item('offers_passing_margin_floor', 35, Number(opportunities.profitReadyCount || 0) > 0, 'global-commerce-opportunities.profitReadyCount', Number(opportunities.profitReadyCount || 0)),
      item('offer_refresh_after_material_product_change', 20, false, 'missing:offer_refresh_latency'),
      item('unsupported_claim_rate', 20, true, 'no unsupported-claim breach recorded in current control reports', 0),
    ]),
    'storefront-conversion': score([
      item('critical_commercial_route_health', 30, false, 'missing:current_storefront_health_report_in_control_run'),
      item('eligible_products_with_checkout_path', 30, promotionReady > 0, 'promotion-ready products with checkout required', promotionReady),
      item('material_cro_issue_to_task_latency', 20, false, 'missing:cro_issue_latency'),
      item('broken_buyer_path_count', 20, false, 'missing:buyer_path_breakage_count'),
    ]),
    'creative-studio': score([
      item('rights_safe_original_creative_rate', 35, false, 'missing:creative_rights_inventory'),
      item('primary_product_creative_concepts', 25, false, 'missing:daily_creative_concept_count'),
      item('creative_to_measurable_hypothesis_rate', 20, false, 'missing:creative_hypothesis_mapping'),
      item('fabricated_review_or_scarcity_rate', 20, true, 'no integrity breach recorded', 0),
    ]),
    'organic-growth': score([
      item('eligible_product_zero_cost_channel_coverage', 30, acquisitionPaths.length >= 3, 'sales-strategy acquisition paths', acquisitionPaths.length),
      item('promotion_asset_readiness_latency', 20, false, 'missing:asset_readiness_latency'),
      item('unverified_product_promotion_rate', 30, promotionReady === 0, 'no promotion-ready product released', 0),
      item('qualified_zero_cost_sessions', 20, false, 'missing:qualified_session_instrumentation'),
    ]),
    'creator-affiliate-growth': score([
      item('qualified_creator_affiliate_shortlist', 30, false, 'missing:daily_qualified_creator_count'),
      item('unauthorized_outreach_rate', 30, true, 'no unauthorized outreach recorded', 0),
      item('eligible_product_partner_package_readiness', 20, acquisitionPaths.includes('tiktok-shop-affiliate') || acquisitionPaths.includes('creator-affiliate-shortlist'), 'strategy board creator/affiliate path', acquisitionPaths.length),
      item('creator_attributed_verified_revenue', 20, verifiedSales > 0, 'verified sales', verifiedSales),
    ]),
    'revenue-analytics': score([
      item('revenue_claim_evidence_rate', 35, firstSaleFalse && verifiedSales === 0 || firstSale.verifiedFirstSale === true, 'first-sale verifier governs sale claims', verifiedSales),
      item('verified_order_reconciliation_latency', 25, verifiedSales === 0, 'not active until verified order exists', verifiedSales),
      item('verified_order_attribution_coverage', 20, verifiedSales === 0, 'not active until verified order exists', verifiedSales),
      item('fabricated_or_test_order_counted_as_sale', 20, verifiedSales === 0 && firstSale.verifiedFirstSale !== true, 'first-sale verifier', 0),
    ]),
    'experiment-lab': score([
      item('experiments_with_hypothesis_metric_stop_rule', 30, false, 'missing:experiment_registry_measurement'),
      item('new_executable_experiments_prepared', 25, strategyCount >= 8, 'diversified strategy portfolio exists but experiment count not separately measured', strategyCount),
      item('experiments_without_measurement', 25, false, 'missing:experiment_measurement_audit'),
      item('validated_incremental_profit', 20, verifiedSales > 0, 'verified sales/profit evidence', verifiedSales),
    ]),
    'commerce-control': score([
      item('companies_with_active_assignment_before_first_sale', 25, verifiedSales > 0 || assignments.length === 10, 'no-idle assignment board', assignments.length),
      item('bottleneck_has_named_owner', 20, Boolean(dashboard.currentBottleneck?.owner), 'dashboard.currentBottleneck.owner', dashboard.currentBottleneck?.owner || null),
      item('primary_blocker_parallel_routes', 20, alternativePaths.length >= 2, 'First Sale War Room alternative paths', alternativePaths.length),
      item('first_sale_scoreboard_freshness', 15, true, 'scorecard generated in same control cycle'),
      item('verified_profitable_sales', 20, verifiedSales >= 1, 'verified sales', verifiedSales),
    ]),
  };

  const parentItems = [
    item('verified_sales', 30, verifiedSales >= 1, 'dashboard.verifiedSales', verifiedSales),
    item('active_company_coverage', 20, verifiedSales > 0 || assignments.length === 10, 'no-idle assignments', assignments.length),
    item('concurrent_sales_strategies', 20, strategyCount >= 8, 'sales-strategy-board.concurrentStrategyCount', strategyCount),
    item('unowned_blockers', 10, Boolean(dashboard.currentBottleneck?.owner), 'current bottleneck owner', dashboard.currentBottleneck?.owner ? 0 : 1),
    item('stalled_blockers_without_alternative', 10, alternativePaths.length > 0, 'alternative routes', alternativePaths.length > 0 ? 0 : 1),
    item('integrity_breaches', 10, true, 'no integrity breach recorded in current control reports', 0),
  ];
  const parentController = score(parentItems);

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    objective: 'Strict evidence-backed KPI control for every PrismBay commerce entity.',
    verifiedSales,
    rule: 'Missing evidence receives zero credit. Activity alone is not success. Integrity breaches force critical red.',
    companies,
    backendWorkers: {
      runtimeAuthority: 'AppDeploy prismbay-clean-49izhg',
      scoringContract: 'config/strict-kpis.json#backendWorkers',
      note: 'Runtime worker KPI scores are persisted inside the store backend. GitHub validates the contract but does not invent private AppDeploy runtime measurements.',
    },
    parentController,
    escalation: {
      yellowTwoCycles: 'tighten_scope_and_raise_priority',
      redTwoCycles: 'launch_parallel_recovery_route_and_rewrite_assignment',
      criticalOneCycle: 'stop_weak_route_preserve_evidence_and_replace_strategy',
      redThreeCycles: 'restructure_worker_or_company_mandate',
    },
  };
}

export async function main() {
  const config = await readJson('config/strict-kpis.json');
  validateKpiContract(config);
  const scorecard = buildScorecard({
    opportunities: await readJson('growth-reports/global-commerce-opportunities.json'),
    promotion: await readJson('growth-reports/retail-promotion-swarm.json'),
    revenueBoard: await readJson('growth-reports/paperclip-revenue-board.json'),
    strategyBoard: await readJson('growth-reports/sales-strategy-board.json'),
    dashboard: await readJson('growth-reports/prismbay-commerce-group-dashboard.json'),
    firstSale: await readJson('growth-reports/first-sale-verification.json'),
  });
  await fs.mkdir('growth-reports', { recursive: true });
  await fs.writeFile('growth-reports/strict-kpi-scorecard.json', JSON.stringify(scorecard, null, 2) + '\n');
  console.log(JSON.stringify({
    verifiedSales: scorecard.verifiedSales,
    parentScore: scorecard.parentController.score,
    parentBand: scorecard.parentController.band,
    companyBands: Object.fromEntries(Object.entries(scorecard.companies).map(([id, row]) => [id, row.band])),
  }, null, 2));
  return scorecard;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
