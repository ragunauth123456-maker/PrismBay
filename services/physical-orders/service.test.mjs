import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import Stripe from 'stripe';
import { openLedger } from './ledger.mjs';
import { ingest } from './orders.mjs';
import { createServer, safeLog, validateStorage } from './server.mjs';
import { loadCatalog } from './catalog.mjs';
import { createCJConnector } from './cj.mjs';

const secret = 'whsec_synthetic_test_only';
const catalog = { store: 'PrismBay Clean', accountId: 'acct_test', mappings: [{ stripeId: 'plink_test', items: [{ sku: 'scrubber', quantity: 1 }] }] };
const shipping = { name: 'Synthetic Person', address: { line1: '123 Synthetic Street', city: 'Test', state: 'CA', postal_code: '90210', country: 'US' } };
const checkout = (id = 'evt_checkout', patch = {}) => ({ id, livemode: false, type: 'checkout.session.completed', data: { object: { id: 'cs_test', payment_intent: 'pi_test', payment_link: 'plink_test', mode: 'payment', payment_status: 'paid', amount_total: 2500, currency: 'usd', shipping_details: shipping, customer_email: 'synthetic@example.invalid', ...patch } } });
const intent = () => ({ id: 'evt_intent', livemode: false, type: 'payment_intent.succeeded', data: { object: { id: 'pi_test', status: 'succeeded', amount_received: 2500 } } });
async function fixture(t) {
  const dir = await mkdtemp(join(tmpdir(), 'physical-orders-test-'));
  const ledger = await openLedger(dir);
  t.after(async () => { await ledger.close(); await rm(dir, { recursive: true, force: true }); });
  return { dir, ledger };
}

test('raw HTTP signatures: valid, missing, tampered, stale; health and redacted logs', async t => {
  const { ledger } = await fixture(t); const logs = [];
  const server = createServer({ secret, ledger, catalog, live: false, logger: x => logs.push(x) });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const body = JSON.stringify(checkout());
  const signature = Stripe.webhooks.generateTestHeaderString({ payload: body, secret });
  const post = (payload, sig) => fetch(base + '/webhooks/stripe', { method: 'POST', body: payload, headers: sig ? { 'stripe-signature': sig } : {} });
  assert.equal((await fetch(base + '/health')).status, 200);
  assert.equal((await post(body, signature)).status, 200);
  assert.equal((await post(body, signature)).status, 200);
  assert.equal((await post(body)).status, 400);
  assert.equal((await post(body + ' ', signature)).status, 400);
  assert.equal((await post(body, Stripe.webhooks.generateTestHeaderString({ payload: body, secret, timestamp: 1 }))).status, 400);
  assert.equal(Object.keys(ledger.snapshot().orders).length, 1);
  assert.ok(!logs.join('').includes('Synthetic'));
  assert.ok(!logs.join('').includes('example.invalid'));
});

for (const reverse of [false, true]) test(`replay and purchase deduplication; PI first=${!reverse}`, async t => {
  const { ledger } = await fixture(t);
  for (const event of reverse ? [checkout(), intent()] : [intent(), checkout()]) await ingest(event, ledger, catalog, false);
  await Promise.all(Array.from({ length: 8 }, () => ingest(checkout(), ledger, catalog, false)));
  assert.equal(Object.keys(ledger.snapshot().orders).length, 1);
  assert.equal(ledger.snapshot().orders.pi_test.status, 'manual_fulfillment');
  assert.equal(Object.keys(ledger.snapshot().events).length, 2);
});

for (const [name, patch, reason] of [
  ['unknown description cannot map', { payment_link: 'plink_unknown', metadata: { sku: 'scrubber' }, description: 'scrubber' }, 'unknown_mapping'],
  ['non-US', { shipping_details: { ...shipping, address: { ...shipping.address, country: 'CA' } } }, 'invalid_us_shipping'],
  ['missing shipping', { shipping_details: null }, 'invalid_us_shipping'],
  ['currency', { currency: 'eur' }, 'unsupported_currency'],
  ['missing PI', { payment_intent: null }, 'missing_payment_intent'],
]) test(name, async t => {
  const { ledger } = await fixture(t);
  await ingest(checkout('evt_test', patch), ledger, catalog, false);
  assert.equal(Object.values(ledger.snapshot().orders)[0].reason, reason);
});

test('unpaid and zero amount do not queue; async success upgrades', async t => {
  const { ledger } = await fixture(t);
  await ingest(checkout('evt_unpaid', { payment_status: 'unpaid' }), ledger, catalog, false);
  await ingest(checkout('evt_free', { amount_total: 0 }), ledger, catalog, false);
  assert.deepEqual(ledger.snapshot().orders, {});
  const paid = checkout('evt_async'); paid.type = 'checkout.session.async_payment_succeeded';
  await ingest(paid, ledger, catalog, false);
  assert.equal(ledger.snapshot().orders.pi_test.status, 'manual_fulfillment');
});

test('persistent replay ledger, exclusive writer, no stored PII', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'physical-orders-test-'));
  let ledger = await openLedger(dir);
  try {
    await assert.rejects(openLedger(dir), { code: 'EEXIST' });
    await ingest(checkout(), ledger, catalog, false);
    await ledger.close(); ledger = await openLedger(dir);
    assert.equal(await ingest(checkout(), ledger, catalog, false), 'replay');
    const disk = await readFile(join(dir, 'ledger.json'), 'utf8');
    for (const pii of ['Synthetic', '90210', 'example.invalid', 'line1', 'email']) assert.ok(!disk.includes(pii));
  } finally { await ledger.close(); await rm(dir, { recursive: true, force: true }); }
});

test('storage failure is not acknowledged and poisons writer', async t => {
  const { dir, ledger } = await fixture(t);
  await writeFile(join(dir, 'ledger.json'), '{}');
  // Force rename to fail without relying on platform permissions.
  await rm(join(dir, 'ledger.json'));
  const { mkdir } = await import('node:fs/promises');
  await mkdir(join(dir, 'ledger.json'));
  await assert.rejects(ingest(checkout(), ledger, catalog, false));
  assert.deepEqual(ledger.snapshot().events, {});
  await assert.rejects(ingest(checkout(), ledger, catalog, false), /restart/);
});

test('catalog import rejects digital SKU; price mapping and bundle only expand approved items', async t => {
  const { dir, ledger } = await fixture(t); const path = join(dir, 'catalog.json');
  await writeFile(path, JSON.stringify(catalog)); assert.equal(loadCatalog(path).mappings.length, 1);
  await writeFile(path, JSON.stringify({ ...catalog, mappings: [{ stripeId: 'price_test', items: [{ sku: 'nexusos', quantity: 1 }] }] }));
  assert.throws(() => loadCatalog(path));
  const prices = { ...catalog, mappings: [{ stripeId: 'price_test', items: [{ sku: 'mini-mop', quantity: 1 }, { sku: 'scrubber', quantity: 2 }] }] };
  await ingest(checkout('evt_price', { payment_link: null, line_items: { has_more: false, data: [{ price: { id: 'price_test' }, quantity: 2 }] } }), ledger, prices, false);
  assert.deepEqual(ledger.snapshot().orders.pi_test.items, [{ sku: 'mini-mop', quantity: 2 }, { sku: 'scrubber', quantity: 4 }]);
});

test('scope rejection and production storage fail closed', async t => {
  const { ledger } = await fixture(t);
  assert.throws(() => ingest({ ...checkout(), account: 'acct_wrong' }, ledger, catalog, false));
  assert.throws(() => ingest(checkout(), ledger, catalog, true));
  assert.throws(() => validateStorage({ PROD: 'true' }));
  {
    const env = { PROD: 'true', DATA_DIR: '/volume/orders', PERSISTENT_VOLUME_PATH: '/volume', PERSISTENT_STORAGE_CONFIRMED: 'true' };
    assert.throws(() => validateStorage(env, '1 2 3 / /volume rw - tmpfs tmpfs rw'));
    assert.doesNotThrow(() => validateStorage(env, '1 2 3 / /volume rw - ext4 /dev/test rw'));
  }
});

test('CJ simulation: missing session and every failed check block; ordering always disabled', async () => {
  const order = { paid: true, status: 'manual_fulfillment' };
  const checks = { country: 'US', inventoryVerified: true, freightVerified: true, priceVerified: true };
  assert.equal(createCJConnector().assess(order, checks).readyForManualReview, false);
  const cj = createCJConnector({ CJ_INTEGRATION_AUTHORIZED: 'true', CJ_ACCESS_TOKEN: 'synthetic', CJ_SESSION_ID: 'synthetic' });
  assert.equal(cj.assess(order, checks).readyForManualReview, true);
  for (const key of ['inventoryVerified', 'freightVerified', 'priceVerified']) assert.equal(cj.assess(order, { ...checks, [key]: false }).readyForManualReview, false);
  assert.equal(cj.assess(order, { ...checks, country: 'CA' }).readyForManualReview, false);
  await assert.rejects(cj.createOrder(), /disabled/);
  const logs = []; safeLog(x => logs.push(x), 'secret synthetic@example.invalid');
  assert.ok(!logs[0].includes('example.invalid'));
});
