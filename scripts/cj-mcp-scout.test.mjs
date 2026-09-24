import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { preflight, decode, validate, discover, caller, scout, loadSdk, projectEvidence } from './cj-mcp-scout.mjs';

const timestamp = '2026-09-24T12:00:00.000Z';
const policy = { zip: '10001', retailUsd: 30, handlingDays: [2, 4], paymentFees: { percent: 3, fixedUsd: 0.3, source: 'owner fee schedule', checkedAt: timestamp } };
const string = { type: 'string' };
const number = { type: 'number' };
const object = properties => ({ type: 'object', properties, required: Object.keys(properties) });
const schemas = {
  search_products: object({ keyword: string, countryCode: string, isWarehouse: { type: 'boolean' }, pageNum: number, pageSize: number }),
  get_product_detail: object({ pid: string, countryCode: string }),
  get_product_variants: object({ pid: string, countryCode: string }),
  query_cj_inventory: object({ vid: string }),
  calculate_freight: object({ startCountryCode: string, endCountryCode: string, zip: string, products: { type: 'array', items: object({ vid: string, quantity: number }) } }),
  get_logistics_timeliness: object({ startCountryCode: string, endCountryCode: string }),
};
function fixture(overrides = {}) {
  const calls = [];
  const responses = {
    search_products: { content: [{ productList: [{ id: 'p1' }] }] },
    get_product_detail: { pid: 'p1' },
    get_product_variants: [{ pid: 'p1', vid: 'v1', variantSellPrice: '5.50' }],
    query_cj_inventory: [{ vid: 'v1', countryCode: 'US', totalVerifiedInventory: 4 }],
    calculate_freight: [{ logisticName: 'Carrier', logisticPrice: 3, logisticAging: '3-7' }],
    get_logistics_timeliness: [{ logisticName: 'Carrier', logisticAging: '3-7' }],
    ...overrides,
  };
  return {
    calls,
    async listTools() { return { tools: Object.entries(schemas).map(([name, inputSchema]) => ({ name, inputSchema })) }; },
    async callTool(request) {
      calls.push(request);
      const response = responses[request.name];
      if (response instanceof Error) throw response;
      return { content: [{ type: 'text', text: 'Official result:\n\n' + JSON.stringify(response) }] };
    },
  };
}
async function run(overrides, extra = {}) {
  const client = fixture(overrides);
  const result = await scout({ client, candidates: [{ slug: 'cleaner', query: 'cleaner', listed: false, attentionScore: 90 }], policy, clock: () => timestamp, ...extra });
  return { client, result, product: result.categories[0]?.products[0] };
}

test('no session exits before SDK, key or network use', async () => {
  assert.equal((await preflight({ CJ_MCP_ENABLE: '1', USERPROFILE: '/owner' }, async () => false)).status, 'awaiting-cj-auth');
  assert.equal((await preflight({ USERPROFILE: '/owner' }, async () => true)).status, 'disabled');
  assert.equal((await preflight({ USERPROFILE: '/owner', CJ_MCP_ENABLE: '1' }, async () => true)).status, 'awaiting-encryption-key-environment');
  assert.equal((await preflight({ USERPROFILE: '/owner', CJ_MCP_ENABLE: '1', TOKEN_ENCRYPT_KEY: 'mock' }, async () => true)).status, 'ready');
});
test('decoder supports official text prefixes and rejects errors', () => {
  assert.deepEqual(decode({ content: [{ type: 'text', text: 'Found products.\n{"content":[]}' }] }), { content: [] });
  assert.throws(() => decode({ isError: true, content: [] }));
  assert.throws(() => decode({ content: [{ type: 'text', text: 'login required' }] }));
});
test('nested runtime schemas reject drift before calling transport', async () => {
  assert.throws(() => validate(schemas.calculate_freight, { startCountryCode: 'US', endCountryCode: 'US', zip: '10001', products: [{ vid: 'v1' }] }));
  const client = fixture();
  const call = caller(client, new Map(), () => timestamp, []);
  await assert.rejects(call('search_products', {}));
  await assert.rejects(call('create_order', {}));
  assert.equal(client.calls.length, 0);
});
test('tools/list follows pagination and detects cursor loops', async () => {
  let count = 0;
  const map = await discover({ async listTools() { return ++count === 1 ? { tools: [], nextCursor: 'next' } : { tools: [{ name: 'search_products', inputSchema: schemas.search_products }] }; } });
  assert.equal(map.size, 1);
  await assert.rejects(discover({ async listTools() { return { tools: [], nextCursor: 'repeat' }; } }));
});
test('all checks produce variant-level supplier readiness, never sale readiness', async () => {
  const { product, result, client } = await run();
  assert.equal(product.supplierReady, true);
  assert.equal(product.saleReady, false);
  assert.deepEqual(product.variants[0].deliveryDays, [[5, 11]]);
  assert.equal(product.variants[0].paymentFees.estimateUsd, 1.2);
  assert.equal(client.calls.length, 6);
  for (const e of result.categories[0].evidence) {
    assert.equal(e.startedAt, timestamp);
    assert.equal(e.completedAt, timestamp);
    assert.ok(e.observations);
  }
});
for (const [label, override] of Object.entries({
  'CN stock': { query_cj_inventory: [{ vid: 'v1', countryCode: 'CN', totalVerifiedInventory: 100 }] },
  'wrong variant': { query_cj_inventory: [{ vid: 'other', countryCode: 'US', totalVerifiedInventory: 100 }] },
  'aggregate stock': { query_cj_inventory: [{ countryCode: 'US', totalVerifiedInventory: 100 }] },
  'zero stock': { query_cj_inventory: [{ vid: 'v1', countryCode: 'US', totalVerifiedInventory: 0 }] },
  'unknown wrapper': { query_cj_inventory: { data: [{ vid: 'v1', countryCode: 'US', totalVerifiedInventory: 100 }] } },
  'zero cost': { get_product_variants: [{ pid: 'p1', vid: 'v1', variantSellPrice: 0 }] },
  'price range': { get_product_variants: [{ pid: 'p1', vid: 'v1', variantSellPrice: '2-5' }] },
  'wrong detail': { get_product_detail: { pid: 'other' } },
  'missing freight cost': { calculate_freight: [{ logisticName: 'Carrier', logisticAging: '3-7' }] },
  'negative freight': { calculate_freight: [{ logisticName: 'Carrier', logisticAging: '3-7', logisticPrice: -1 }] },
  'unrealistic delivery': { calculate_freight: [{ logisticName: 'Carrier', logisticAging: '0-0', logisticPrice: 3 }] },
  'mismatched carrier': { get_logistics_timeliness: [{ logisticName: 'Other', logisticAging: '3-7' }] },
  'expired auth': { get_product_detail: new Error('secret must not appear') },
})) test(`${label} cannot promote supplier`, async () => {
  const { product, result } = await run(override);
  assert.equal(product.supplierReady, false);
  assert.ok(!JSON.stringify(result).includes('secret must not appear'));
});
test('missing payment/handling/ZIP assumptions block readiness', async () => {
  for (const changed of [{}, { ...policy, paymentFees: null }, { ...policy, handlingDays: [0, 0] }, { ...policy, zip: '' }]) {
    assert.equal((await run({}, { policy: changed })).product.supplierReady, false);
  }
});
test('only top unique explicitly unlisted categories are searched', async () => {
  const candidates = Array.from({ length: 9 }, (_, i) => ({ slug: `c${i}`, query: 'cleaner', attentionScore: i, listed: i === 8 }));
  candidates.push({ ...candidates[7] }, { slug: 'unknown', query: 'unknown', attentionScore: 100 });
  const { result } = await run({}, { candidates });
  assert.deepEqual(result.categories.map(c => c.slug), ['c7', 'c6', 'c5', 'c4', 'c3']);
});
test('evidence projects only relevant fields; no raw credential or error persistence', () => {
  assert.deepEqual(projectEvidence({ pid: 'p', accessToken: 'secret', nested: { password: 'secret' } }), { pid: 'p' });
});
test('official verification errors retain timestamped failure evidence', async () => {
  const { result } = await run({ calculate_freight: new Error('sensitive failure') });
  const evidence = result.categories[0].evidence.at(-1);
  assert.equal(evidence.status, 'failed');
  assert.equal(evidence.completedAt, timestamp);
});
test('local official SDK accepts an injected offline MCP transport', async t => {
  const server = process.env.CJ_MCP_SERVER || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../CJ-MCP/dist/mcp-server/index.cjs');
  let Client;
  try { ({ Client } = await loadSdk(server)); }
  catch { t.skip('Official SDK not installed locally; pure mock tests still run'); return; }
  const mock = fixture();
  const transport = {
    async start() {},
    async close() { this.onclose?.(); },
    async send(message) {
      if (message.id === undefined) return;
      let result;
      if (message.method === 'initialize') result = { protocolVersion: message.params.protocolVersion, capabilities: { tools: {} }, serverInfo: { name: 'offline-official-contract', version: '1' } };
      else if (message.method === 'tools/list') result = await mock.listTools();
      else if (message.method === 'tools/call') result = await mock.callTool(message.params);
      else throw new Error('Unexpected MCP method');
      queueMicrotask(() => this.onmessage({ jsonrpc: '2.0', id: message.id, result }));
    },
  };
  const client = new Client({ name: 'offline-test', version: '1' });
  try {
    await client.connect(transport);
    const result = await scout({ client, candidates: [{ slug: 'cleaner', query: 'cleaner', listed: false }], policy, clock: () => timestamp });
    assert.equal(result.categories[0].products[0].supplierReady, true);
    assert.equal(mock.calls.length, 6);
  } finally { await client.close(); }
});
