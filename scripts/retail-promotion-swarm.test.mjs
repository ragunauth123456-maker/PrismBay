import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRetailPromotionSwarm, candidateReadiness } from './retail-promotion-swarm.mjs';

test('current-style blocked product never becomes promotion eligible', () => {
  const item = candidateReadiness({
    slug: 'crevice',
    candidate: '3-in-1 Crevice Cleaning Brush',
    independentIdentityMatch: true,
    variantStockVerified: true,
    freightEstimateVerified: true,
    finalZipFreightVerified: false,
    mediaRightsVerified: false,
    checkoutAllowed: false,
    automaticPromotionAllowed: false,
  });
  assert.equal(item.promotionEligible, false);
  assert.deepEqual(item.missing.map(x => x.field), [
    'finalZipFreightVerified',
    'mediaRightsVerified',
    'checkoutAllowed',
    'automaticPromotionAllowed',
  ]);
});

test('all promotion gates are required before outbound lanes are released', () => {
  const now = Date.parse('2026-10-02T23:30:00.000Z');
  const candidate = {
    slug: 'crevice',
    candidate: '3-in-1 Crevice Cleaning Brush',
    liveStoreProduct: true,
    observedVariantSku: 'CJJT173147702BY',
    independentIdentityMatch: true,
    variantStockVerified: true,
    freightEstimateVerified: true,
    finalZipFreightVerified: true,
    mediaRightsVerified: true,
    checkoutAllowed: true,
    automaticPromotionAllowed: true,
  };
  const swarm = buildRetailPromotionSwarm({
    now,
    review: {
      checkedAt: '2026-10-02T23:00:00.000Z',
      saleReadyCount: 1,
      candidates: [candidate],
    },
    workerBoard: { tasks: new Array(8).fill({}) },
    reports: {
      publisher: { result: { tiktokVerificationReady: true } },
      'storefront-cro-auditor': { result: { activeStorefront: { status: 200, finalUrl: 'https://example.test/tiktok/' } } },
      'analytics-reviewer': { result: { live: true } },
    },
  });
  assert.equal(swarm.promotionEligibleCount, 1);
  assert.equal(swarm.trackedOffers.length, 1);
  assert.equal(swarm.execution.tiktok.state, 'approval_gated_publication_path_ready');
  assert.equal(swarm.execution.creatorPartners.state, 'qualified_shortlist_ready_for_owner_approved_contact');
});

test('stale supplier evidence blocks every product', () => {
  const now = Date.parse('2026-10-04T12:00:00.000Z');
  const swarm = buildRetailPromotionSwarm({
    now,
    review: {
      checkedAt: '2026-10-02T00:00:00.000Z',
      saleReadyCount: 1,
      candidates: [{
        slug: 'unsafe-stale',
        independentIdentityMatch: true,
        variantStockVerified: true,
        freightEstimateVerified: true,
        finalZipFreightVerified: true,
        mediaRightsVerified: true,
        checkoutAllowed: true,
        automaticPromotionAllowed: true,
      }],
    },
  });
  assert.equal(swarm.reviewFresh, false);
  assert.equal(swarm.promotionEligibleCount, 0);
  assert.equal(swarm.execution.supplierVerification.state, 'stale_or_missing');
});
