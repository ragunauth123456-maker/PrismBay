// PrismBay public status and narrowly scoped, token-protected job receipts.
import { PAGE, SCRIPT } from './page.mjs';
const PUBLIC_ORIGIN = 'https://ragunauth123456-maker.github.io';
const RUN_STATES = new Set(['success', 'failure', 'cancelled']);
const TASK_KINDS = new Set(['research_refresh', 'health_check']);
const HEADERS = { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' };
function json(value, status = 200, origin = '') {
  const headers = { ...HEADERS };
  if (origin === PUBLIC_ORIGIN) headers['access-control-allow-origin'] = PUBLIC_ORIGIN;
  return new Response(JSON.stringify(value), { status, headers });
}
function permit(request, env, kind) {
  const secret = kind === 'admin' ? env.ADMIN_TOKEN : env.REPORT_TOKEN;
  if (typeof secret !== 'string' || secret.length < 32) return false;
  const supplied = request.headers.get('authorization') || '';
  const expected = 'Bearer ' + secret;
  if (supplied.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) mismatch |= supplied.charCodeAt(i) ^ expected.charCodeAt(i);
  return mismatch === 0;
}
function iso(value) {
  return typeof value === 'string' && value.length <= 32 && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
}
async function body(request) {
  if (!(request.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) return null;
  if (Number(request.headers.get('content-length') || 0) > 2048) return null;
  const raw = await request.text();
  if (raw.length > 2048) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch { return null; }
}
export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    const origin = request.headers.get('origin') || '';
    if (request.method === 'OPTIONS' && (path === '/v1/status' || path === '/healthz')) {
      return new Response(null, { status: 204, headers: origin === PUBLIC_ORIGIN ?
        { 'access-control-allow-origin': PUBLIC_ORIGIN, 'access-control-allow-methods': 'GET' } : {} });
    }
    if (request.method === 'GET' && path === '/') return new Response(PAGE, { headers: {
      'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store',
      'content-security-policy': "default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'",
      'x-content-type-options': 'nosniff', 'x-frame-options': 'DENY' } });
    if (request.method === 'GET' && path === '/status.js') return new Response(SCRIPT, {
      headers: { 'content-type': 'text/javascript; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } });
    if (!env || !env.DB) return json({ error: 'Database not provisioned' }, 503, origin);
    try {
      if (request.method === 'GET' && path === '/healthz') {
        const row = await env.DB.prepare('SELECT 1 AS healthy').first();
        return json({ status: row?.healthy === 1 ? 'healthy' : 'unavailable' }, row?.healthy === 1 ? 200 : 503, origin);
      }
      if (request.method === 'GET' && path === '/v1/status') {
        const runs = await env.DB.prepare('SELECT run_id,status,finished_at,products,catalog_updated_at FROM run_events ORDER BY finished_at DESC LIMIT 5').all();
        const queued = await env.DB.prepare("SELECT COUNT(*) AS total FROM task_requests WHERE status = 'pending'").first();
        const history = (runs.results || []).map(x => ({ runId: x.run_id, status: x.status,
          finishedAt: x.finished_at, products: x.products, catalogUpdatedAt: x.catalog_updated_at }));
        return json({ service: 'PrismBay free cloud control', lastRun: history[0] || null,
          history, pendingTasks: queued?.total || 0, taskCadence: 'Next successful six-hour GitHub run' }, 200, origin);
      }
      if (request.method === 'POST' && path === '/v1/runs') {
        if (!permit(request, env, 'report')) return json({ error: 'Unauthorized' }, 401);
        const item = await body(request);
        if (!item || !/^[1-9][0-9]{0,16}$/.test(String(item.runId)) || !RUN_STATES.has(item.status) ||
          !iso(item.finishedAt) || item.source !== 'github-actions' || !Number.isInteger(item.products) ||
          item.products < 0 || item.products > 10000 ||
          (item.catalogUpdatedAt !== null && !iso(item.catalogUpdatedAt))) return json({ error: 'Invalid run report' }, 400);
        await env.DB.prepare('INSERT INTO run_events (run_id,status,finished_at,products,catalog_updated_at) VALUES (?,?,?,?,?) ON CONFLICT(run_id) DO UPDATE SET status=excluded.status, finished_at=excluded.finished_at, products=excluded.products, catalog_updated_at=excluded.catalog_updated_at WHERE excluded.finished_at >= run_events.finished_at')
          .bind(String(item.runId), item.status, item.finishedAt, item.products, item.catalogUpdatedAt).run();
        return json({ accepted: true, runId: String(item.runId) }, 202);
      }
      if (request.method === 'POST' && path === '/v1/tasks') {
        if (!permit(request, env, 'admin')) return json({ error: 'Unauthorized' }, 401);
        const item = await body(request);
        if (!item || !TASK_KINDS.has(item.kind) || Object.keys(item).some(k => k !== 'kind'))
          return json({ error: 'Allowed kinds: research_refresh, health_check' }, 400);
        const count = await env.DB.prepare("SELECT COUNT(*) AS total FROM task_requests WHERE status = 'pending'").first();
        if ((count?.total || 0) >= 32) return json({ error: 'Free-tier task queue is full' }, 429);
        const id = crypto.randomUUID();
        await env.DB.prepare('INSERT INTO task_requests (task_id,kind,status,created_at) VALUES (?,?,?,?)')
          .bind(id, item.kind, 'pending', new Date().toISOString()).run();
        return json({ taskId: id, kind: item.kind, status: 'pending' }, 201);
      }
      if (request.method === 'GET' && path === '/v1/tasks/pending') {
        if (!permit(request, env, 'report')) return json({ error: 'Unauthorized' }, 401);
        const queue = await env.DB.prepare("SELECT task_id,kind,created_at FROM task_requests WHERE status = 'pending' ORDER BY created_at LIMIT 8").all();
        return json({ tasks: queue.results || [] });
      }
      const match = /^\/v1\/tasks\/([a-f0-9-]{36})\/complete$/.exec(path);
      if (request.method === 'POST' && match) {
        if (!permit(request, env, 'report')) return json({ error: 'Unauthorized' }, 401);
        const item = await body(request);
        if (!item || !/^[1-9][0-9]{0,16}$/.test(String(item.runId))) return json({ error: 'Invalid run ID' }, 400);
        const result = await env.DB.prepare("UPDATE task_requests SET status='completed', completed_at=?, completed_by_run=? WHERE task_id=? AND status='pending'")
          .bind(new Date().toISOString(), String(item.runId), match[1]).run();
        return json({ completed: result.meta?.changes === 1 }, result.meta?.changes === 1 ? 200 : 404);
      }
      return json({ error: 'Not found' }, 404);
    } catch (error) {
      console.error('PrismBay control-plane request failure', error?.name || 'Error');
      return json({ error: 'Service temporarily unavailable' }, 503, origin);
    }
  }
};
