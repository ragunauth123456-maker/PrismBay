import test from 'node:test';
import assert from 'node:assert/strict';
import { validateManifest } from './store-backend-swarm-watchdog.mjs';

function healthyManifest(overrides = {}) {
  return {
    mode: 'backend-swarm-24x7',
    appId: 'prismbay-clean-49izhg',
    storeOrigin: 'https://prismbay-clean-49izhg.v2.appdeploy.ai',
    workers: [0,10,20,30,40,50].map((minute, index) => ({ id: `worker-${index + 1}`, minute, cadence: 'hourly' })),
    publicHealthPaths: ['/', '/products.json', '/merchant-feed.xml'],
    boundaries: {
      fakeTraffic: false,
      paidSpend: false,
      automaticSupplierOrdering: false,
      bulkUnsolicitedOutreach: false,
      automaticExternalPublishing: false,
      autonomousPriceChanges: false,
    },
    runtimeAuthority: 'AppDeploy cron status for prismbay-clean-49izhg',
    ...overrides,
  };
}

test('accepts six staggered hourly backend workers', () => {
  const manifest = validateManifest(healthyManifest());
  assert.equal(manifest.workers.length, 6);
  assert.deepEqual(manifest.workers.map(worker => worker.minute), [0,10,20,30,40,50]);
});

test('fails if a prohibited commercial boundary opens', () => {
  const manifest = healthyManifest({ boundaries: { ...healthyManifest().boundaries, paidSpend: true } });
  assert.throws(() => validateManifest(manifest), /boundary_open:paidSpend/);
});

test('fails if worker cadence loses ten-minute coverage', () => {
  const manifest = healthyManifest({ workers: [0,10,20,30,40,40].map((minute, index) => ({ id: `worker-${index + 1}`, minute, cadence: 'hourly' })) });
  assert.throws(() => validateManifest(manifest), /schedule_mismatch/);
});

test('fails if configured worker count drops below six', () => {
  const manifest = healthyManifest({ workers: healthyManifest().workers.slice(0, 5) });
  assert.throws(() => validateManifest(manifest), /worker_count_mismatch/);
});
