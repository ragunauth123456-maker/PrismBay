import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGrowthBoard, validateGrowthContract } from './ceo-autonomous-growth-engine.mjs';

const config = {
  schemaVersion: 1,
  objective: 'first verified profitable sale',
  operatingRules: {
    verifiedSalesRemainUltimateKpi: true,
    missingEvidenceCreatesEvidenceDebtTask: true,
  },
  portfolioRules: {
    minimumProductsInRaceBeforeFirstSale: 5,
    minimumIndependentAcquisitionPaths: 6,
    minimumParallelRoutesForPrimaryBlocker: 3,
    primaryBlockerWarningMinutes: 120,
    primaryBlockerReplaceRouteMinutes: 360,
    primaryBlockerPortfolioShiftMinutes: 720,
  },
  preSaleFactories: {
    offerHypothesesPerPrimaryProduct: 3,
    creativeConceptsPerPrimaryProduct: 5,
    croHypothesesPerPrimaryProduct: 3,
    seoIntentAssetsPerPrimaryProduct: 3,
    measurementPlansPerActiveChannel: 1,
  },
  recoveryPolicy: {
    critical: { priority: 1, action: 'critical_recovery' },
    red: { priority: 2, action: 'red_recovery' },
    yellow: { priority: 3, action: 'yellow_recovery' },
    green: { priority: 4, action: 'replicate' },
  },
  supportMap: { 'offer-engineering': ['revenue-analytics'] },
  redTeamChecks: ['supplier', 'margin', 'checkout', 'rights'],
};

function fixture(overrides = {}) {
  return {
    config,
    scorecard: {
      verifiedSales: 0,
      companies: {
        'offer-engineering': { score: 20, band: 'critical', evidenceGaps: ['offer_variant_inventory', 'offer_refresh_latency'] },
        'supplier-fulfillment': { score: 60, band: 'red', evidenceGaps: ['verified_supplier_variant_stock_candidates'] },
        'revenue-analytics': { score: 100, band: 'green', evidenceGaps: [] },
      },
    },
    dashboard: {
      verifiedSales: 0,
      promotionEligibleCount: 0,
      currentBottleneck: { stage: 'supplier_verification', owner: 'supplier-fulfillment', product: 'crevice', missing: ['final_zip_freight', 'checkout'] },
      firstSaleWarRoom: {
        closestProduct: 'crevice',
        alternativePathsInProgress: ['backup-a'],
      },
    },
    opportunities: {
      sourcingQueue: [
        { slug: 'toilet-scrubber-kit', researchScore: 95, next: ['supplier'] },
        { slug: 'microfiber-car-detailing-cloths', researchScore: 92, next: ['supplier'] },
        { slug: 'car-seat-headrest-hooks', researchScore: 92, next: ['supplier'] },
        { slug: 'knife-cleaning-brush', researchScore: 90, next: ['supplier'] },
        { slug: 'mini-bag-sealer', researchScore: 90, next: ['supplier'] },
      ],
    },
    promotion: {
      promotionEligibleCount: 0,
      nearReady: [
        { slug: 'crevice', readinessPct: 71, missing: ['finalZipFreightVerified', 'checkoutAllowed'] },
        { slug: 'garment-steamer', readinessPct: 71, missing: ['finalZipFreightVerified', 'checkoutAllowed'] },
      ],
    },
    strategyBoard: {
      acquisitionPaths: ['seo', 'google-free', 'pinterest', 'tiktok-affiliate', 'marketplace', 'creator-affiliate'],
    },
    revenueBoard: {
      supplierReviewCheckedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    },
    ...overrides,
  };
}

test('contract requires evidence debt, product race and parallel routes', () => {
  assert.equal(validateGrowthContract(config), true);
  assert.throws(() => validateGrowthContract({ ...config, portfolioRules: { ...config.portfolioRules, minimumProductsInRaceBeforeFirstSale: 2 } }), /product_race_floor/);
});

test('critical and red companies receive recovery sprints and evidence debt tasks', () => {
  const board = buildGrowthBoard(fixture());
  assert.equal(board.recoverySprints[0].companyId, 'offer-engineering');
  assert.equal(board.recoverySprints[0].band, 'critical');
  assert.ok(board.evidenceDebtCount >= 3);
  assert.ok(board.evidenceDebt.some(row => row.evidenceGap === 'offer_variant_inventory'));
});

test('stale blocker forces route replacement and product race continues in parallel', () => {
  const board = buildGrowthBoard(fixture());
  assert.equal(board.blockerEscalation.stage, 'replace-route');
  assert.equal(board.primaryProduct, 'crevice');
  assert.ok(board.productRaceCount >= 5);
  assert.ok(board.productRace.some(row => row.slug === 'toilet-scrubber-kit'));
  assert.ok(board.portfolioControls.parallelRouteDeficit >= 1);
});

test('pre-sale factories create quantified work rather than idle recommendations', () => {
  const board = buildGrowthBoard(fixture());
  assert.equal(board.factories.offerFactory.requiredOutput, 3);
  assert.equal(board.factories.creativeFactory.requiredOutput, 5);
  assert.equal(board.factories.croFactory.requiredOutput, 3);
  assert.equal(board.factories.seoFactory.requiredOutput, 3);
  assert.equal(board.factories.measurementFactory.requiredPlans, 6);
});

test('channels remain preparation-only until a product is promotion-ready', () => {
  const board = buildGrowthBoard(fixture());
  assert.ok(board.channelMatrix.every(row => row.status === 'prepare-only'));
  const active = buildGrowthBoard(fixture({ promotion: { promotionEligibleCount: 1, nearReady: fixture().promotion.nearReady } }));
  assert.ok(active.channelMatrix.every(row => row.status === 'activation-check'));
});
