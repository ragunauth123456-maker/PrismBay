import http from 'node:http';
import { readFileSync } from 'node:fs';
import { resolve, posix } from 'node:path';
import { pathToFileURL } from 'node:url';
import Stripe from 'stripe';
import { loadCatalog } from './catalog.mjs';
import { openLedger } from './ledger.mjs';
import { ingest } from './orders.mjs';

// Logging is an allowlist: never serialize event bodies, errors, URLs, or customer data.
export function safeLog(sink, code) {
  sink(JSON.stringify({ service: 'physical-orders', code: ['accepted', 'rejected', 'storage_error', 'started'].includes(code) ? code : 'redacted' }));
}

export function validateStorage(env, mountinfo) {
  if (env.PROD !== 'true') return;
  if (!env.DATA_DIR || !posix.isAbsolute(env.DATA_DIR) || env.PERSISTENT_STORAGE_CONFIRMED !== 'true' || !env.PERSISTENT_VOLUME_PATH || !posix.isAbsolute(env.PERSISTENT_VOLUME_PATH)) throw Error('Production requires explicit persistent Linux volume');
  const directory = posix.resolve(env.DATA_DIR);
  const mount = posix.resolve(env.PERSISTENT_VOLUME_PATH);
  if (mount === '/' || (directory !== mount && !directory.startsWith(mount + '/'))) throw Error('DATA_DIR must be on persistent volume');
  const lines = (mountinfo ?? readFileSync('/proc/self/mountinfo', 'utf8')).split('\n');
  const found = lines.some(line => {
    const [fields, fs] = line.split(' - ');
    const point = fields.split(' ')[4]?.replace(/\\040/g, ' ');
    return point === mount && fs && !['tmpfs', 'ramfs', 'overlay'].includes(fs.split(' ')[0]);
  });
  if (!found) throw Error('Persistent mount not found');
}

export function createServer({ secret, ledger, catalog, live = true, logger = console.log }) {
  if (!secret?.startsWith('whsec_')) throw Error('Signing secret required');
  // Only the SDK webhook helper is used. No Stripe API key or outbound calls.
  const server = http.createServer(async (req, res) => {
    const send = (status, body) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(body)); };
    if (req.method === 'GET' && req.url === '/health') return send(200, { service: 'physical-orders', status: 'ok' });
    if (req.method !== 'POST' || req.url !== '/webhooks/stripe') return send(404, { error: 'not_found' });
    let event;
    try {
      const chunks = []; let size = 0;
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 1024 * 1024) { send(413, { error: 'body_too_large' }); req.resume(); return; }
        chunks.push(chunk);
      }
      event = Stripe.webhooks.constructEvent(Buffer.concat(chunks), req.headers['stripe-signature'], secret, 300);
      if (event.livemode !== live || (event.account && event.account !== catalog.accountId)) throw Error('Scope');
    } catch {
      safeLog(logger, 'rejected'); return send(400, { error: 'invalid_webhook' });
    }
    try {
      const result = await ingest(event, ledger, catalog, live);
      safeLog(logger, 'accepted'); send(200, { received: true, result });
    } catch {
      safeLog(logger, 'storage_error'); send(500, { error: 'processing_failed' });
    }
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  return server;
}

export async function start(env = process.env) {
  validateStorage(env);
  if (env.PROD === 'true' && env.STRIPE_LIVE_MODE !== 'true') throw Error('Production requires live mode');
  if (!['true', 'false'].includes(env.STRIPE_LIVE_MODE)) throw Error('Explicit Stripe mode required');
  if (!env.STRIPE_WEBHOOK_SECRET?.startsWith('whsec_')) throw Error('Signing secret required');
  const catalog = loadCatalog(env.PHYSICAL_CATALOG_PATH);
  if (env.PROD === 'true' && !catalog.mappings.length) throw Error('Physical catalog import required');
  const ledger = await openLedger(resolve(env.DATA_DIR || 'data'));
  const server = createServer({ secret: env.STRIPE_WEBHOOK_SECRET, ledger, catalog, live: env.STRIPE_LIVE_MODE === 'true' });
  server.listen(Number(env.PORT || 3001), '0.0.0.0', () => safeLog(console.log, 'started'));
  const shutdown = () => server.close(async () => { await ledger.close(); process.exit(0); });
  process.once('SIGTERM', shutdown); process.once('SIGINT', shutdown);
  return server;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  start().catch(() => { console.error('physical-orders startup failed; check configuration and storage'); process.exitCode = 1; });
}
