import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCatalogOpportunityBridge, catalogSkus, freshEvidenceCount } from './catalog-opportunity-bridge.mjs';

test('catalogSkus extracts unique mapped store SKUs', () => {
  const set = catalogSkus({ mappings: [
    { items: [{ sku: 'crevice', quantity: 1 }, { sku: 'pethair', quantity: 1 }] },
    { items: [{ sku: 'crevice', quantity: 1 }] },
  ] });
  assert.deepEqual([...set].sort(), ['crevice', 'pethair']);
});

test('freshEvidenceCount counts only evidence inside freshness window', () => {
  const now = Date.parse('2026-10-03T12:00:00Z');
  const sources = new Map([
    ['fresh', { retrieved: '2026-10-03' }],
    ['old', { published: '2026-01-01' }],
  ]);
  assert.equal(freshEvidenceCount({ evidence: ['fresh', 'old'] }, sources, now, 14), 1);
});

test('existing mapped and checkout-verified SKU receives shortest-path priority without being marked ready', () => {
  const now = Date.parse('2026-10-03T12:00:00Z');
  const seed = {
    sources: [{ id: 'fresh', retrieved: '2026-10-03' }],
    candidates: [
      { slug: 'crevice', storeSku: 'crevice', name: 'Crevice', evidence: ['fresh'], scores: { demand: 20, shipping: 15, demo: 15, safety: 15, returnRisk: 10, competitionOpportunity: 8, supplierDiscoverability: 10 } },
      { slug: 'new-product', name: 'New', evidence: ['fresh'], scores: { demand: 25, shipping: 15, demo: 15, safety: 15, returnRisk: 10, competitionOpportunity: 8, supplierDiscoverability: 10 } },
    ],
  };
  const supplierCatalog = { candidates: [{ slug: 'crevice', storeSku: 'crevice' }, { slug: 'new-product' }] };
  const physicalCatalog = { mappings: [{ stripeId: 'plink_x', items: [{ sku: 'crevice', quantity: 1 }] }] };
  const authorization = { checkoutInfrastructure: { verifiedCheckoutSkus: ['crevice'] } };
  const board = buildCatalogOpportunityBridge({ seed, supplierCatalog, physicalCatalog, authorization, now });
  assert.equal(board.shortestPathQueue[0].slug, 'crevice');
  assert.equal(board.shortestPathQueue[0].storeMapped, true);
  assert.equal(board.shortestPathQueue[0].checkoutInfrastructureVerified, true);
  assert.equal(board.shortestPathQueue[0].commercialState, 'evidence_only');
  assert.equal(board.profitReadyCount, 0);
  assert.equal(board.checkoutReleasedCount, 0);
  assert.match(board.shortestPathQueue[0].nextAction, /exact buyer-destination freight/);
});

test('store mapping alone never releases checkout', () => {
  const seed = { sources: [], candidates: [{ slug: 'drain-catcher', storeSku: 'drain-catcher', name: 'Drain', evidence: [], scores: {} }] };
  const board = buildCatalogOpportunityBridge({
    seed,
    supplierCatalog: { candidates: [{ slug: 'drain-catcher' }] },
    physicalCatalog: { mappings: [{ stripeId: 'p', items: [{ sku: 'drain-catcher', quantity: 1 }] }] },
    authorization: { checkoutInfrastructure: { verifiedCheckoutSkus: [] } },
    now: Date.parse('2026-10-03T12:00:00Z'),
  });
  assert.equal(board.candidates[0].storeMapped, true);
  assert.equal(board.candidates[0].checkoutInfrastructureVerified, false);
  assert.equal(board.checkoutReleasedCount, 0);
  assert.match(board.candidates[0].nextAction, /validate checkout infrastructure/);
});
