import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export const MANIFEST_PATH = 'config/store-backend-swarm.json';

export function validateManifest(manifest) {
  if (!manifest || manifest.mode !== 'backend-swarm-24x7') throw new Error('store_backend_swarm_mode_mismatch');
  if (!Array.isArray(manifest.workers) || manifest.workers.length !== 6) throw new Error('store_backend_swarm_worker_count_mismatch');
  const ids = manifest.workers.map(worker => worker.id);
  if (new Set(ids).size !== 6) throw new Error('store_backend_swarm_duplicate_workers');
  const minutes = manifest.workers.map(worker => Number(worker.minute));
  if (minutes.some(minute => ![0,10,20,30,40,50].includes(minute)) || new Set(minutes).size !== 6) {
    throw new Error('store_backend_swarm_schedule_mismatch');
  }
  if (manifest.workers.some(worker => worker.cadence !== 'hourly')) throw new Error('store_backend_swarm_cadence_mismatch');
  const boundaryKeys = ['fakeTraffic','paidSpend','automaticSupplierOrdering','bulkUnsolicitedOutreach','automaticExternalPublishing','autonomousPriceChanges'];
  for (const key of boundaryKeys) {
    if (manifest.boundaries?.[key] !== false) throw new Error(`store_backend_swarm_boundary_open:${key}`);
  }
  if (typeof manifest.storeOrigin !== 'string' || !manifest.storeOrigin.startsWith('https://')) throw new Error('store_backend_swarm_origin_invalid');
  if (!Array.isArray(manifest.publicHealthPaths) || manifest.publicHealthPaths.length < 3) throw new Error('store_backend_swarm_health_paths_missing');
  return manifest;
}

async function probe(origin, path) {
  const response = await fetch(origin + path, {
    redirect: 'follow',
    signal: AbortSignal.timeout(15000),
    headers: { 'user-agent': 'PrismBay-Paperclip-Backend-Swarm-Watchdog/2.0' },
  });
  return {
    path,
    ok: response.ok,
    status: response.status,
    contentType: response.headers.get('content-type'),
  };
}

export async function main() {
  const manifest = validateManifest(JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf8')));
  const checks = await Promise.all(manifest.publicHealthPaths.map(path => probe(manifest.storeOrigin, path)));
  const failures = checks.filter(check => !check.ok);
  if (failures.length) throw new Error(`storefront_health_failed:${failures.map(check => `${check.path}:${check.status}`).join(',')}`);

  const report = {
    schemaVersion: 2,
    checkedAt: new Date().toISOString(),
    mode: manifest.mode,
    appId: manifest.appId,
    storeOrigin: manifest.storeOrigin,
    configuredWorkerCount: manifest.workers.length,
    cadence: 'one backend worker cycle every ten minutes via six staggered hourly AppDeploy cron jobs',
    workers: manifest.workers,
    boundaries: manifest.boundaries,
    publicHealth: checks,
    runtimeAuthority: manifest.runtimeAuthority,
    githubVisibility: 'GitHub verifies the committed swarm contract and public storefront health. Private AppDeploy cron execution status remains authoritative in AppDeploy and is not inferred by this report.',
    commercialTruth: 'Backend swarm configuration and health checks are operational evidence only. They are not traffic, a customer, a sale, revenue or profit.',
  };
  await fs.mkdir('growth-reports', { recursive: true });
  await fs.writeFile('growth-reports/store-backend-swarm.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({
    healthy: true,
    workers: report.configuredWorkerCount,
    storefrontChecks: report.publicHealth.length,
    runtimeAuthority: report.runtimeAuthority,
  }, null, 2));
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
