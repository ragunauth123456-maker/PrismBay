import test from 'node:test';
import assert from 'node:assert/strict';
import { validateManifest } from './store-backend-swarm-watchdog.mjs';

function healthyManifest(overrides = {}) {
  return {
    mode: 'backend-swarm-24x7',
    appId: 'prismbay-clean-49izhg',
    storeOrigin: 'https://prismbay-clean-49izhg.v2.appdeploy.ai',
    strictKpiContract: 'config/strict-kpis.json',
    kpiPolicy: {
      greenAtOrAbove: 90,
      redBelow: 75,
      consecutiveRedBeforeIntervention: 2,
      consecutiveRedBeforeRoleRewrite: 3,
      missingEvidenceGetsCredit: false,
      activityAloneCountsAsSuccess: false,
      integrityBreachForcesCritical: true,
    },
    workers: [0,10,20,30,40,50].map((minute, index) => ({
      id: `worker-${index + 1}`,
      minute,
      cadence: 'hourly',
      minimumInspectionsPerRun: index === 2 ? 3 : 1,
      minimumActionsPerRun: index === 1 || index === 3 || index === 4 ? 3 : 2,
    })),
    publicHealthPaths: ['/', '/products.json', '/merchant-feed.xml'],
    boundaries: {
      fakeTraffic: false,
      paidSpend: false,
      automaticSupplierOrdering: false,
      bulkUnsolicitedOutreach: false,
      automaticExternalPublishing: false,
      autonomousPriceChanges: false,
    },
    runtimeAuthority: 'AppDeploy cron status and persisted swarm KPI state for prismbay-clean-49izhg',
    ...overrides,
  };
}

test('accepts six staggered hourly backend workers with strict KPI floors', () => {
  const manifest = validateManifest(healthyManifest());
  assert.equal(manifest.workers.length, 6);
  assert.deepEqual(manifest.workers.map(worker => worker.minute), [0,10,20,30,40,50]);
  assert.equal(manifest.kpiPolicy.redBelow, 75);
  assert.equal(manifest.kpiPolicy.consecutiveRedBeforeIntervention, 2);
});

test('fails if a prohibited commercial boundary opens', () => {
  const manifest = healthyManifest({ boundaries: { ...healthyManifest().boundaries, paidSpend: true } });
  assert.throws(() => validateManifest(manifest), /boundary_open:paidSpend/);
});

test('fails if worker cadence loses ten-minute coverage', () => {
  const manifest = healthyManifest({ workers: [0,10,20,30,40,40].map((minute, index) => ({ id: `worker-${index + 1}`, minute, cadence: 'hourly', minimumInspectionsPerRun: 1, minimumActionsPerRun: 2 })) });
  assert.throws(() => validateManifest(manifest), /schedule_mismatch/);
});

test('fails if configured worker count drops below six', () => {
  const manifest = healthyManifest({ workers: healthyManifest().workers.slice(0, 5) });
  assert.throws(() => validateManifest(manifest), /worker_count_mismatch/);
});

test('fails if a worker loses its evidence or action floor', () => {
  const workers = healthyManifest().workers.map((worker, index) => index === 0 ? { ...worker, minimumInspectionsPerRun: 0 } : worker);
  assert.throws(() => validateManifest(healthyManifest({ workers })), /kpi_inspection_floor_missing/);
});

test('fails if KPI intervention policy is weakened', () => {
  const kpiPolicy = { ...healthyManifest().kpiPolicy, consecutiveRedBeforeIntervention: 4 };
  assert.throws(() => validateManifest(healthyManifest({ kpiPolicy })), /kpi_consequence_policy_mismatch/);
});
