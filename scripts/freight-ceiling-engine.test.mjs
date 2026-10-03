import test from 'node:test';
import assert from 'node:assert/strict';
import { commercialFreightCeiling, compareFreightToCeiling } from './freight-ceiling-engine.mjs';

test('computes the maximum affordable freight under all three commercial gates', () => {
  const result = commercialFreightCeiling({ retailUsd: 12.95, supplierCostUsd: 1.75 });
  assert.equal(result.viable, true);
  assert.ok(result.maxFreightUsd > 0);
  assert.ok(result.maxFreightUsd < 12.95);
  assert.ok(['contribution', 'landed_share'].includes(result.governingConstraint));
});

test('rejects a product whose merchandise cost already consumes the economics', () => {
  const result = commercialFreightCeiling({ retailUsd: 10, supplierCostUsd: 8 });
  assert.equal(result.viable, false);
  assert.equal(result.maxFreightUsd, 0);
});

test('bundle quantity can be evaluated independently', () => {
  const single = commercialFreightCeiling({ retailUsd: 12.95, supplierCostUsd: 1.75, quantity: 1 });
  const bundle = commercialFreightCeiling({ retailUsd: 12.95, supplierCostUsd: 1.75, quantity: 3 });
  assert.ok(bundle.maxFreightUsd > single.maxFreightUsd);
  assert.ok(bundle.maxFreightPerUnitUsd > 0);
});

test('quote comparison exposes freight headroom and utilization', () => {
  const result = compareFreightToCeiling({ retailUsd: 20, supplierCostUsd: 3, quotedFreightUsd: 5 });
  assert.equal(result.passes, true);
  assert.ok(result.headroomUsd >= 0);
  assert.ok(result.utilizationPct > 0);
});

test('quote above ceiling fails even when it is a valid positive quote', () => {
  const result = compareFreightToCeiling({ retailUsd: 10, supplierCostUsd: 2, quotedFreightUsd: 9 });
  assert.equal(result.passes, false);
});
