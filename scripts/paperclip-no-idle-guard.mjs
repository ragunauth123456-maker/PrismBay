import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const PRE_SALE_ASSIGNMENTS = Object.freeze({
  'product-intelligence': 'Continuously research, score, reject and advance stronger product candidates.',
  'supplier-fulfillment': 'Close the primary product supplier/freight/economics gates and verify backup candidates in parallel.',
  'offer-engineering': 'Prepare evidence-backed pricing, bundles, upsells, cross-sells and offer structures for the strongest candidates.',
  'storefront-conversion': 'Continuously audit and preflight storefront, disclosures, mobile, speed, checkout, confirmation and order capture without releasing blocked products.',
  'creative-studio': 'Prepare truthful original or rights-cleared creative drafts for likely-to-clear candidates.',
  'organic-growth': 'Continuously research and prepare zero-cost distribution and search-intent paths that can activate when products become promotion-ready.',
  'creator-affiliate-growth': 'Continuously research and qualify relevant creators and affiliate structures without sending unauthorized outreach.',
  'revenue-analytics': 'Refresh genuine sale evidence, detect stale metrics, maintain attribution readiness and identify the next measurable funnel constraint.',
  'experiment-lab': 'Maintain and rank low-cost commercial experiments with hypotheses, metrics, stop conditions and next actions.',
  'commerce-control': 'Run the First Sale War Room, prevent duplicate work, reallocate workers to the bottleneck and keep the next operating cycle scheduled.'
});

export function buildNoIdleState({ manifest, dashboard }) {
  const verifiedSales = Number(dashboard?.verifiedSales ?? dashboard?.scoreboard?.verifiedSales ?? 0);
  if (verifiedSales >= 1) {
    return {
      mode: 'first_verified_sale_achieved',
      idleAllowed: null,
      nextCycleRequired: false,
      stopConditionMet: true,
      verifiedSales,
      assignments: []
    };
  }

  if (manifest?.rules?.noIdleUntilFirstVerifiedSale !== true) throw new Error('noIdleUntilFirstVerifiedSale rule must remain enabled');
  if (manifest?.rules?.allCompaniesActiveBeforeFirstSale !== true) throw new Error('allCompaniesActiveBeforeFirstSale rule must remain enabled');
  if (manifest?.rules?.anotherCycleRequiredBeforeFirstSale !== true) throw new Error('anotherCycleRequiredBeforeFirstSale rule must remain enabled');

  const companies = Array.isArray(manifest?.companies) ? manifest.companies : [];
  const assignments = companies.map(company => ({
    companyId: company.id,
    company: company.name,
    state: 'active_until_first_verified_sale',
    action: PRE_SALE_ASSIGNMENTS[company.id] || `Advance ${company.funnelStage || 'commercial'} work toward the first verified sale.`,
    stopCondition: 'verifiedSales >= 1',
  }));

  const primaryProduct = dashboard?.firstSaleWarRoom?.closestProduct || dashboard?.currentBottleneck?.product || null;
  const nextBestProduct = dashboard?.firstSaleWarRoom?.nextBestProduct || dashboard?.researchCandidates?.[0] || null;
  const alternativePaths = dashboard?.firstSaleWarRoom?.alternativePathsInProgress?.length
    ? dashboard.firstSaleWarRoom.alternativePathsInProgress
    : [
        nextBestProduct ? `verify_backup_candidate:${nextBestProduct}` : 'continue_global_product_discovery',
        'prepare_storefront_and_checkout_without_releasing_blocked_product',
        'prepare_truthful_rights_safe_creative_drafts',
        'continue_zero_cost_channel_research'
      ];

  return {
    mode: 'no_idle_until_first_verified_sale',
    idleAllowed: false,
    nextCycleRequired: true,
    stopConditionMet: false,
    verifiedSales,
    primaryProduct,
    nextBestProduct,
    currentBottleneck: dashboard?.currentBottleneck || null,
    alternativePaths,
    assignments,
    rule: 'Before the first verified sale, a blocker may change the work but may not stop the commerce organization.'
  };
}

export function enforceNoIdleState({ manifest, dashboard }) {
  const state = buildNoIdleState({ manifest, dashboard });
  if (state.verifiedSales < 1) {
    if (state.assignments.length !== manifest.companies.length) throw new Error('pre-sale no-idle guard requires one active assignment per company');
    if (state.assignments.some(x => !x.action || x.state !== 'active_until_first_verified_sale')) throw new Error('pre-sale company assignment is missing active work');
    if (!state.alternativePaths?.length) throw new Error('pre-sale no-idle guard requires at least one fallback path');
    if (!dashboard?.firstSaleWarRoom) throw new Error('First Sale War Room must remain active until first verified sale');
    if (!Array.isArray(dashboard?.priorityTasks) || dashboard.priorityTasks.length === 0) throw new Error('pre-sale no-idle guard requires active priority tasks');
  }

  const assignmentMap = new Map(state.assignments.map(x => [x.companyId, x]));
  const companyQueue = Array.isArray(dashboard?.companyQueue)
    ? dashboard.companyQueue.map(company => {
        const assignment = assignmentMap.get(company.companyId);
        if (!assignment) return company;
        return { ...company, status: company.companyId === dashboard?.currentBottleneck?.owner ? 'priority_active' : 'active_parallel', currentAction: assignment.action };
      })
    : dashboard?.companyQueue;

  return {
    ...dashboard,
    companyQueue,
    noIdleUntilFirstSale: state,
    generatedAt: new Date().toISOString()
  };
}

export async function main() {
  const manifest = JSON.parse(await fs.readFile('paperclip/prismbay-commerce-group/companies.json', 'utf8'));
  await fs.access(manifest.noIdleContract);
  const dashboard = JSON.parse(await fs.readFile('growth-reports/prismbay-commerce-group-dashboard.json', 'utf8'));
  const guarded = enforceNoIdleState({ manifest, dashboard });
  await fs.writeFile('growth-reports/prismbay-commerce-group-dashboard.json', JSON.stringify(guarded, null, 2) + '\n');
  console.log(JSON.stringify({
    mode: guarded.noIdleUntilFirstSale.mode,
    verifiedSales: guarded.noIdleUntilFirstSale.verifiedSales,
    activeCompanyAssignments: guarded.noIdleUntilFirstSale.assignments.length,
    primaryProduct: guarded.noIdleUntilFirstSale.primaryProduct || null,
    nextBestProduct: guarded.noIdleUntilFirstSale.nextBestProduct || null,
    alternativePaths: guarded.noIdleUntilFirstSale.alternativePaths || [],
    nextCycleRequired: guarded.noIdleUntilFirstSale.nextCycleRequired
  }, null, 2));
  return guarded;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
