import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { band, buildScorecard, validateKpiContract } from './strict-kpi-scorecard.mjs';

const config = JSON.parse(fs.readFileSync('config/strict-kpis.json', 'utf8'));

test('strict KPI contract covers all companies and backend workers', () => {
  assert.equal(validateKpiContract(config), true);
  assert.equal(Object.keys(config.companies).length, 10);
  assert.equal(Object.keys(config.backendWorkers).length, 6);
});

test('band thresholds are strict', () => {
  assert.equal(band(95), 'green');
  assert.equal(band(89), 'yellow');
  assert.equal(band(74), 'red');
  assert.equal(band(49), 'critical');
});

test('missing evidence prevents activity-only green scores', () => {
  const result = buildScorecard({
    opportunities: {
      sourcingQueue: Array.from({ length: 5 }, (_, i) => ({ slug: `p${i}`, next: ['verify'] })),
      profitReadyCount: 0,
    },
    promotion: { promotionEligibleCount: 0, nearReady: [] },
    revenueBoard: {},
    strategyBoard: {
      concurrentStrategyCount: 12,
      acquisitionPaths: ['owned-search-seo', 'google-free-listings', 'pinterest-product-pins', 'tiktok-shop-affiliate'],
    },
    dashboard: {
      verifiedSales: 0,
      currentBottleneck: { owner: 'supplier-fulfillment' },
      firstSaleWarRoom: { alternativePathsInProgress: ['a', 'b', 'c'] },
      noIdleUntilFirstSale: { assignments: Array.from({ length: 10 }, (_, i) => ({ id: i })) },
    },
    firstSale: { verifiedFirstSale: false },
  });
  assert.notEqual(result.companies['product-intelligence'].band, 'green');
  assert.equal(result.companies['commerce-control'].band, 'yellow');
  assert.equal(result.parentController.band, 'red');
  assert.ok(result.companies['product-intelligence'].evidenceGaps.length > 0);
});

test('parent cannot score green before verified sale merely because activity is high', () => {
  const result = buildScorecard({
    opportunities: { sourcingQueue: [], profitReadyCount: 0 },
    promotion: { promotionEligibleCount: 0, nearReady: [] },
    revenueBoard: {},
    strategyBoard: { concurrentStrategyCount: 20, acquisitionPaths: [] },
    dashboard: {
      verifiedSales: 0,
      currentBottleneck: { owner: 'supplier-fulfillment' },
      firstSaleWarRoom: { alternativePathsInProgress: ['a', 'b'] },
      noIdleUntilFirstSale: { assignments: Array.from({ length: 10 }, (_, i) => ({ id: i })) },
    },
    firstSale: { verifiedFirstSale: false },
  });
  assert.notEqual(result.parentController.band, 'green');
  assert.equal(result.parentController.kpis.find(kpi => kpi.id === 'verified_sales').passed, false);
});
