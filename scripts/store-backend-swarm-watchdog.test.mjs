import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSwarmStatus } from './store-backend-swarm-watchdog.mjs';

function healthyStatus(overrides = {}) {
  const now = new Date('2026-10-03T13:00:00Z').toISOString();
  return {
    status: 'ok',
    mode: 'backend-swarm-24x7',
    workerCount: 6,
    activeWorkerCount: 2,
    totalRuns: 3,
    verifiedSales: 0,
    controllerFocus: 'Close the next material commercial gate.',
    lastUpdatedAt: now,
    workers: Array.from({ length: 6 }, (_, index) => ({
      id: `worker-${index + 1}`,
      role: `Worker ${index + 1}`,
      status: 'ok',
      runs: 1,
      lastRunAt: now,
      cooldownUntil: null,
    })),
    boundaries: {
      fakeTraffic: false,
      paidSpend: false,
      automaticSupplierOrdering: false,
      bulkUnsolicitedOutreach: false,
      automaticExternalPublishing: false,
    },
    ...overrides,
  };
}

test('accepts healthy six-worker backend swarm', () => {
  const now = Date.parse('2026-10-03T13:30:00Z');
  const report = validateSwarmStatus(healthyStatus(), now);
  assert.equal(report.healthy, true);
  assert.equal(report.workerCount, 6);
  assert.equal(report.totalRuns, 3);
});

test('fails if a prohibited commercial boundary opens', () => {
  const status = healthyStatus({ boundaries: { ...healthyStatus().boundaries, paidSpend: true } });
  assert.throws(() => validateSwarmStatus(status, Date.parse('2026-10-03T13:30:00Z')), /boundary_open:paidSpend/);
});

test('fails closed if executed swarm state becomes stale', () => {
  const status = healthyStatus({ lastUpdatedAt: '2026-10-03T10:00:00Z' });
  assert.throws(() => validateSwarmStatus(status, Date.parse('2026-10-03T13:30:00Z')), /state_stale/);
});

test('permits an initialized zero-run swarm before its first scheduled worker executes', () => {
  const status = healthyStatus({ totalRuns: 0, activeWorkerCount: 0, lastUpdatedAt: '2026-10-03T10:00:00Z' });
  const report = validateSwarmStatus(status, Date.parse('2026-10-03T13:30:00Z'));
  assert.equal(report.healthy, true);
  assert.equal(report.totalRuns, 0);
});
