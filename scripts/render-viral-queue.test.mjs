import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { APPROVED, ROOT, readQueue } from './render-viral-videos.mjs';
import { renderQueue } from './render-viral-queue.mjs';

async function fixture(t) {
  const base = path.join(ROOT, 'growth-reports/videos');
  await fs.mkdir(base, { recursive: true });
  const root = await fs.mkdtemp(path.join(base, 'test-queue-'));
  t.after(async () => {
    assert.ok(path.relative(base, root).startsWith('test-queue-'));
    await fs.rm(root, { recursive: true, force: true });
  });
  const output = path.join(root, 'growth-reports/videos');
  await fs.mkdir(output, { recursive: true });
  const data = { updatedAt: 'first', items: Object.entries(APPROVED).slice(0, 4).map(([slug, product], i) => ({ slug, product, rank: i + 1, channel: 'tiktok', format: 'short-video' })) };
  const save = () => fs.writeFile(path.join(root, 'growth-reports/viral-content-queue.json'), JSON.stringify(data));
  await save();
  let calls = 0;
  const warnings = [];
  const options = { root, logger: { log() {}, warn(message) { warnings.push(message); } }, renderVideo: async ({ queue, count }) => {
    calls++;
    assert.equal(count, 3);
    assert.ok(path.isAbsolute(queue));
    const items = readQueue(JSON.parse(await fs.readFile(queue, 'utf8')));
    const posts = await Promise.all(items.map(async (item, i) => {
      const mediaPath = `growth-reports/videos/${calls}-${i}.mp4`;
      await fs.writeFile(path.join(root, mediaPath), 'deterministic test video placeholder');
      return { ...item, mediaPath, status: 'awaiting_tiktok_authorization', publishable: false, mediaRightsCheck: { required: true, status: 'pending' } };
    }));
    return { localOnly: true, publicationEnabled: false, posts };
  } };
  const statePath = path.join(output, 'queue-state.json');
  return { root, data, save, options, warnings, calls: () => calls, statePath, state: async () => JSON.parse(await fs.readFile(statePath, 'utf8')) };
}

test('idempotent across timestamps, metadata, input order and lower ranks', async t => {
  const f = await fixture(t);
  const first = await renderQueue(f.options);
  assert.equal(first.status, 'rendered');
  assert.match(first.fingerprint, /^[a-f0-9]{64}$/);
  f.data.updatedAt = 'second';
  f.data.items[0].updatedAt = 'third';
  f.data.items[0].hook = 'ignored';
  f.data.items[3].rank = 99;
  f.data.items.reverse();
  await f.save();
  assert.deepEqual(await renderQueue(f.options), { status: 'skipped', fingerprint: first.fingerprint });
  assert.equal(f.calls(), 1);
  assert.equal((await f.state()).manifest.posts.length, 3);
});

test('changed top-three order and membership trigger rendering', async t => {
  const f = await fixture(t);
  const first = await renderQueue(f.options);
  [f.data.items[0].rank, f.data.items[1].rank] = [2, 1];
  await f.save();
  const second = await renderQueue(f.options);
  assert.equal(second.status, 'rendered');
  assert.notEqual(second.fingerprint, first.fingerprint);
  f.data.items[3].rank = 1;
  f.data.items[1].rank = 4;
  await f.save();
  assert.equal((await renderQueue(f.options)).status, 'rendered');
  assert.equal(f.calls(), 3);
});

test('absent or empty outputs trigger rendering', async t => {
  const f = await fixture(t);
  await renderQueue(f.options);
  await fs.unlink(path.join(f.root, (await f.state()).manifest.posts[1].mediaPath));
  assert.equal((await renderQueue(f.options)).status, 'rendered');
  await fs.writeFile(path.join(f.root, (await f.state()).manifest.posts[2].mediaPath), '');
  assert.equal((await renderQueue(f.options)).status, 'rendered');
});

test('missing ffmpeg and render errors warn, preserve last success and retry', async t => {
  const f = await fixture(t);
  await renderQueue(f.options);
  const before = await fs.readFile(f.statePath, 'utf8');
  f.data.items[0].rank = 5;
  await f.save();
  for (const message of ['spawn ffmpeg ENOENT', 'Rendered video failed verification']) {
    assert.deepEqual(await renderQueue({ ...f.options, renderVideo: async () => { throw new Error(message); } }), { status: 'warning' });
    assert.ok(f.warnings.at(-1).includes(message));
    assert.equal(await fs.readFile(f.statePath, 'utf8'), before);
  }
  assert.equal((await renderQueue(f.options)).status, 'rendered');
});

test('invalid queue, unsafe manifest and escaped output fail safely', async t => {
  const f = await fixture(t);
  for (const patch of [{ publicationEnabled: true }, { posts: [] }]) {
    assert.equal((await renderQueue({ ...f.options, renderVideo: async opts => ({ ...await f.options.renderVideo(opts), ...patch }) })).status, 'warning');
  }
  assert.equal((await renderQueue({ ...f.options, renderVideo: async opts => {
    const manifest = await f.options.renderVideo(opts);
    manifest.posts[0].mediaPath = '../outside.mp4';
    return manifest;
  } })).status, 'warning');
  await assert.rejects(fs.access(f.statePath));
  f.data.items = [];
  await f.save();
  assert.equal((await renderQueue(f.options)).status, 'warning');
});
