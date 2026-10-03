import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export const SWARM_STATUS_URL = 'https://prismbay-clean-49izhg.v2.appdeploy.ai/api/swarm-status';

export function validateSwarmStatus(status, now = Date.now()) {
  if (!status || status.status !== 'ok') throw new Error('store_backend_swarm_unhealthy');
  if (status.mode !== 'backend-swarm-24x7') throw new Error('store_backend_swarm_mode_mismatch');
  if (status.workerCount !== 6 || !Array.isArray(status.workers) || status.workers.length !== 6) {
    throw new Error('store_backend_swarm_worker_count_mismatch');
  }
  const boundaryKeys = ['fakeTraffic','paidSpend','automaticSupplierOrdering','bulkUnsolicitedOutreach','automaticExternalPublishing'];
  for (const key of boundaryKeys) {
    if (status.boundaries?.[key] !== false) throw new Error(`store_backend_swarm_boundary_open:${key}`);
  }
  if (typeof status.controllerFocus !== 'string' || status.controllerFocus.trim().length === 0) {
    throw new Error('store_backend_swarm_missing_controller_focus');
  }
  if (!Number.isFinite(Date.parse(status.lastUpdatedAt))) throw new Error('store_backend_swarm_invalid_timestamp');
  const totalRuns = Number(status.totalRuns || 0);
  const ageMs = now - Date.parse(status.lastUpdatedAt);
  if (totalRuns > 0 && ageMs > 90 * 60 * 1000) throw new Error('store_backend_swarm_state_stale');
  return {
    healthy: true,
    workerCount: status.workerCount,
    activeWorkerCount: Number(status.activeWorkerCount || 0),
    totalRuns,
    verifiedSales: Number(status.verifiedSales || 0),
    controllerFocus: status.controllerFocus,
    lastUpdatedAt: status.lastUpdatedAt,
    workers: status.workers.map(worker => ({
      id: worker.id,
      role: worker.role,
      status: worker.status,
      runs: Number(worker.runs || 0),
      lastRunAt: worker.lastRunAt || null,
      cooldownUntil: worker.cooldownUntil || null,
    })),
    boundaries: status.boundaries,
  };
}

export async function main() {
  const response = await fetch(SWARM_STATUS_URL, {
    redirect: 'follow',
    signal: AbortSignal.timeout(15000),
    headers: { 'user-agent': 'PrismBay-Paperclip-Backend-Swarm-Watchdog/1.0' },
  });
  if (!response.ok) throw new Error(`store_backend_swarm_http_${response.status}`);
  const status = await response.json();
  const report = {
    schemaVersion: 1,
    checkedAt: new Date().toISOString(),
    endpoint: SWARM_STATUS_URL,
    ...validateSwarmStatus(status),
    commercialTruth: 'Backend swarm activity is operational work only. It is not traffic, a customer, a sale, revenue or profit.',
  };
  await fs.mkdir('growth-reports', { recursive: true });
  await fs.writeFile('growth-reports/store-backend-swarm.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({
    healthy: report.healthy,
    workers: report.workerCount,
    activeWorkers: report.activeWorkerCount,
    totalRuns: report.totalRuns,
    controllerFocus: report.controllerFocus,
  }, null, 2));
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
