import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const LOGIN = 'In Codex/VSCode enable the official CJMCP server, invoke show_login_form with {}, and complete the owner login in its official form (including any verification). Never paste credentials into chat. Keep the existing TOKEN_ENCRYPT_KEY; run the scout under the same OS user with that key supplied securely in its environment. See scripts/cj-mcp-scout.md.';
export const allowed = ['search_products', 'get_product_detail', 'get_product_variants', 'query_cj_inventory', 'calculate_freight', 'get_logistics_timeliness'];
const numeric = v => (typeof v === 'number' || (typeof v === 'string' && v.trim())) && Number.isFinite(Number(v)) ? Number(v) : null;
const positive = v => numeric(v) !== null && numeric(v) > 0;
const rows = v => Array.isArray(v) ? v : [];
const evidenceFields = new Set(['content', 'productList', 'id', 'pid', 'vid', 'countryCode', 'totalVerifiedInventory', 'variantSellPrice', 'logisticName', 'logisticPrice', 'logisticAging']);
export function projectEvidence(value) {
  if (Array.isArray(value)) return value.map(projectEvidence);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).filter(([key]) => evidenceFields.has(key)).map(([key, item]) => [key, projectEvidence(item)]));
  return value;
}

export async function preflight(env = process.env, exists = async p => { try { return (await fs.stat(p)).isFile(); } catch { return false; } }) {
  const home = env.HOME || env.USERPROFILE;
  const server = path.resolve(env.CJ_MCP_SERVER || path.join(root, '..', 'CJ-MCP', 'dist', 'mcp-server', 'index.cjs'));
  if (!home || !await exists(path.join(home, '.cj-mcp-token'))) return { status: 'awaiting-cj-auth', instructions: LOGIN };
  if (env.CJ_MCP_ENABLE !== '1') return { status: 'disabled' };
  if (!await exists(server)) return { status: 'cj-mcp-not-configured' };
  if (!env.TOKEN_ENCRYPT_KEY) return { status: 'awaiting-encryption-key-environment', instructions: LOGIN };
  return { status: 'ready', server };
}

export async function loadSdk(server) {
  const require = createRequire(server);
  const [{ Client }, { StdioClientTransport }] = await Promise.all([
    import(pathToFileURL(require.resolve('@modelcontextprotocol/sdk/client/index.js'))),
    import(pathToFileURL(require.resolve('@modelcontextprotocol/sdk/client/stdio.js'))),
  ]);
  return { Client, StdioClientTransport };
}

export async function connect(server, env = process.env) {
  const { Client, StdioClientTransport } = await loadSdk(server);
  // Only the official process reads/decrypts its session. Never forward raw access tokens.
  const childEnv = {};
  for (const key of ['PATH', 'Path', 'SystemRoot', 'COMSPEC', 'TEMP', 'TMP', 'HOME', 'USERPROFILE', 'TOKEN_ENCRYPT_KEY']) {
    if (env[key]) childEnv[key] = env[key];
  }
  Object.assign(childEnv, { CJ_ENV: 'production', CJ_CURRENCY: 'USD' });
  const transport = new StdioClientTransport({ command: process.execPath, args: [server], cwd: path.dirname(server), env: childEnv, stderr: 'pipe' });
  const client = new Client({ name: 'prismbay-cj-scout', version: '1.0.0' });
  try { await client.connect(transport); } catch { await transport.close(); throw new Error('connection-failed'); }
  transport.stderr?.resume(); // Do not persist server diagnostics that might contain credentials.
  return client;
}

export function decode(result) {
  if (result.isError) throw new Error('official-tool-error');
  if (result.structuredContent) return result.structuredContent;
  for (const part of result.content || []) {
    if (part.type !== 'text') continue;
    const text = part.text.trim();
    for (const start of [0, text.indexOf('{'), text.indexOf('[')]) {
      if (start < 0) continue;
      try { return JSON.parse(text.slice(start)); } catch { /* official tools prepend a human label */ }
    }
  }
  throw new Error('unrecognized-response');
}

// Validate against tools/list, including nested freight product requirements.
export function validate(schema, value) {
  if (!schema || schema.$ref || schema.oneOf || schema.anyOf || schema.allOf) throw new Error('unsupported-schema');
  if (schema.type === 'object') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('schema-mismatch');
    for (const key of schema.required || []) if (!(key in value)) throw new Error('schema-mismatch');
    for (const [key, item] of Object.entries(value)) {
      if (!schema.properties?.[key]) throw new Error('schema-mismatch');
      validate(schema.properties[key], item);
    }
  } else if (schema.type === 'array') {
    if (!Array.isArray(value)) throw new Error('schema-mismatch');
    value.forEach(item => validate(schema.items, item));
  } else if (typeof value !== schema.type) throw new Error('schema-mismatch');
  if (schema.enum && !schema.enum.includes(value)) throw new Error('schema-mismatch');
  if (schema.minimum !== undefined && value < schema.minimum) throw new Error('schema-mismatch');
  if (schema.maximum !== undefined && value > schema.maximum) throw new Error('schema-mismatch');
}

export async function discover(client) {
  const tools = new Map();
  let cursor;
  const seen = new Set();
  do {
    const page = await client.listTools(cursor ? { cursor } : {}, { timeout: 30000 });
    for (const tool of page.tools) if (allowed.includes(tool.name)) tools.set(tool.name, tool.inputSchema);
    cursor = page.nextCursor;
    if (cursor && seen.has(cursor)) throw new Error('invalid-pagination');
    seen.add(cursor);
  } while (cursor);
  return tools;
}

export function caller(client, schemas, clock, evidence) {
  return async (tool, args) => {
    const entry = { tool, arguments: args, startedAt: clock(), status: 'failed' };
    evidence.push(entry);
    try {
      if (!allowed.includes(tool)) throw new Error('tool-not-allowed');
      validate(schemas.get(tool), args);
      const result = decode(await client.callTool({ name: tool, arguments: args }, undefined, { timeout: 30000 }));
      entry.status = 'ok';
      entry.observations = projectEvidence(result);
      return result;
    } finally { entry.completedAt = clock(); }
  };
}

export async function verifyProduct(pid, call, policy = {}) {
  const output = { pid, supplierReady: false, saleReady: false, variants: [] };
  const detail = await call('get_product_detail', { pid, countryCode: 'US' });
  if (detail?.pid !== pid) return { ...output, reason: 'detail-product-mismatch' };
  const variants = await call('get_product_variants', { pid, countryCode: 'US' });
  for (const variant of rows(variants).slice(0, 3)) {
    if (typeof variant.vid !== 'string' || variant.pid !== pid) continue;
    const item = { vid: variant.vid, supplierReady: false, supplierCostUsd: numeric(variant.variantSellPrice) };
    output.variants.push(item);
    const inventory = await call('query_cj_inventory', { vid: variant.vid });
    // Explicit same-variant, US, verified available stock only. Unknown shapes remain blocked.
    item.stock = rows(inventory).filter(s => s.vid === variant.vid && s.countryCode === 'US' && positive(s.totalVerifiedInventory))
      .map(s => ({ vid: s.vid, countryCode: 'US', verifiedInventory: numeric(s.totalVerifiedInventory) }));
    if (!item.stock.length || !positive(item.supplierCostUsd)) { item.reason = 'unverified-us-stock-or-cost'; continue; }
    if (!/^\d{5}$/.test(policy.zip || '')) { item.reason = 'destination-zip-required'; continue; }
    const freight = await call('calculate_freight', { startCountryCode: 'US', endCountryCode: 'US', zip: policy.zip, products: [{ vid: variant.vid, quantity: 1 }] });
    const timing = await call('get_logistics_timeliness', { startCountryCode: 'US', endCountryCode: 'US' });
    item.quotes = rows(freight).flatMap(q => {
      const match = /^(\d+)\s*-\s*(\d+)$/.exec(String(q.logisticAging || ''));
      const linked = rows(timing).some(t => t.logisticName === q.logisticName && t.logisticAging === q.logisticAging);
      if (!match || !linked || !q.logisticName || numeric(q.logisticPrice) === null || numeric(q.logisticPrice) < 0) return [];
      const [min, max] = match.slice(1).map(Number);
      if (min < 1 || max < min || max > 30) return [];
      return [{ logisticName: q.logisticName, freightUsd: numeric(q.logisticPrice), transitDays: [min, max], destinationZip: policy.zip, origin: 'US', destination: 'US' }];
    });
    // Payment fees are an owner-supplied planning assumption, never live Stripe authorization.
    const fees = policy.paymentFees;
    const handling = policy.handlingDays;
    if (!item.quotes.length || !fees || !positive(policy.retailUsd) || !positive(fees.percent) || fees.percent > 100 || numeric(fees.fixedUsd) === null || fees.fixedUsd < 0 || !fees.source || !Number.isFinite(Date.parse(fees.checkedAt)) || !Array.isArray(handling) || handling.length !== 2 || !handling.every(Number.isInteger) || handling[0] < 1 || handling[1] < handling[0] || handling[1] > 14) {
      item.reason = 'freight-delivery-or-payment-assumptions-missing'; continue;
    }
    item.paymentFees = { ...fees, estimateUsd: Math.round((policy.retailUsd * fees.percent / 100 + fees.fixedUsd) * 100) / 100, basis: 'owner-planning-assumption' };
    item.deliveryDays = item.quotes.map(q => [q.transitDays[0] + handling[0], q.transitDays[1] + handling[1]]);
    item.supplierReady = true;
  }
  output.supplierReady = output.variants.some(v => v.supplierReady);
  return output;
}

export async function scout({ client, candidates, policy = {}, clock = () => new Date().toISOString() }) {
  const schemas = await discover(client);
  const queue = { schemaVersion: 1, generatedAt: clock(), status: 'researched', saleReady: false, schemas: Object.fromEntries(schemas), categories: [] };
  const selected = [...candidates].filter(c => c.listed === false && c.query).sort((a, b) => (b.attentionScore || 0) - (a.attentionScore || 0) || a.slug.localeCompare(b.slug));
  const seen = new Set();
  for (const candidate of selected) {
    if (seen.has(candidate.slug)) continue;
    seen.add(candidate.slug);
    if (queue.categories.length === 5) break;
    const category = { slug: candidate.slug, query: candidate.query, attentionScore: candidate.attentionScore, evidence: [], products: [] };
    queue.categories.push(category);
    const call = caller(client, schemas, clock, category.evidence);
    try {
      const result = await call('search_products', { keyword: candidate.query, countryCode: 'US', isWarehouse: true, pageNum: 1, pageSize: 3 });
      const products = rows(result.content).flatMap(g => rows(g.productList));
      category.discoveredProductIds = products.map(p => p.id).filter(p => typeof p === 'string');
      for (const pid of [...new Set(category.discoveredProductIds)].slice(0, 3)) {
        try { category.products.push(await verifyProduct(pid, call, policy)); }
        catch { category.products.push({ pid, supplierReady: false, saleReady: false, reason: 'official-verification-failed' }); }
      }
      category.status = products.length ? 'review-required' : 'no-recognized-results';
    } catch { category.status = 'official-search-failed'; }
  }
  return queue;
}

export async function main(env = process.env) {
  const gate = await preflight(env);
  if (process.argv.includes('--check-session')) { process.exitCode = gate.status === 'ready' ? 0 : 1; return; }
  let queue = { schemaVersion: 1, generatedAt: new Date().toISOString(), ...gate, saleReady: false, categories: [] };
  delete queue.server;
  if (gate.status === 'ready') {
    let client;
    try {
      const input = JSON.parse(await fs.readFile(path.join(root, 'public/viral-candidates.json'), 'utf8'));
      const policy = env.CJ_MCP_POLICY ? JSON.parse(await fs.readFile(env.CJ_MCP_POLICY, 'utf8')) : {};
      client = await connect(gate.server, env);
      queue = await scout({ client, candidates: input.candidates, policy });
    } catch { queue.status = 'scout-failed'; }
    finally { await client?.close().catch(() => {}); }
  }
  const directory = path.join(root, '.run');
  await fs.mkdir(directory, { recursive: true });
  const destination = path.join(directory, 'cj-supplier-research.json');
  await fs.writeFile(destination + '.tmp', JSON.stringify(queue, null, 2) + '\n');
  await fs.rename(destination + '.tmp', destination);
  console.log(`CJ scout: ${queue.status}. ${queue.instructions || 'Queue: .run/cj-supplier-research.json'}`);
  if (queue.status === 'scout-failed' || queue.categories.some(c => c.status.endsWith('failed') || c.products.some(p => p.reason === 'official-verification-failed'))) process.exitCode = 1;
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) main().catch(() => { console.error('CJ scout: local output failed'); process.exitCode = 1; });
