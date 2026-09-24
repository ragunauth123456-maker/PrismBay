import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { APPROVED, ROOT, STOREFRONT, readQueue, captionFor, wrapText, verifyProbe } from './render-viral-videos.mjs';

const item = (slug, rank) => ({ slug, rank, product: APPROVED[slug], channel: 'tiktok', format: 'short-video' });
const sample = () => ({ items: [item('mattress-vacuum', 3), item('scrubber', 1), item('garment-steamer', 2)] });
test('reads current queue and deterministically selects first three approved products', async () => {
  const data = JSON.parse(await fs.readFile(`${ROOT}/growth-reports/viral-content-queue.json`, 'utf8'));
  assert.equal(readQueue(data).length, 3);
  assert.deepEqual(readQueue(sample()).map(x => x.slug), ['scrubber', 'garment-steamer', 'mattress-vacuum']);
});
test('rejects malformed, insufficient, duplicate and invalid-rank queues', () => {
  for (const data of [null, {}, { items: [] }, { items: [item('scrubber', 1), item('scrubber', 2)] }, { items: [item('scrubber', '1')] }]) assert.throws(() => readQueue(data));
  for (const count of [0, 4, NaN, 1.5]) assert.throws(() => readQueue(sample(), count));
});
test('unknown, renamed, revoked and wrong-channel products never render', () => {
  for (const patch of [{ slug: '../escape' }, { slug: 'toString' }, { product: 'Miracle cure' }, { approved: false }, { status: 'revoked' }, { channel: 'instagram' }]) {
    assert.throws(() => readQueue({ items: [{ ...item('scrubber', 1), ...patch }] }, 1));
  }
});
test('captions have explicit disclosure and exact existing storefront without untrusted hooks', () => {
  const caption = captionFor({ ...item('scrubber', 1), hook: 'Guaranteed best seller', cta: 'https://bad.invalid' });
  assert.ok(caption.startsWith('Ad | PrismBay Clean promotion.'));
  assert.ok(caption.includes(APPROVED.scrubber));
  assert.ok(caption.includes(STOREFRONT));
  assert.ok(!caption.includes('Guaranteed') && !caption.includes('bad.invalid'));
  assert.throws(() => captionFor({ slug: 'unknown', product: 'Fake' }));
});
test('literal punctuation survives wrapping and titles fit bounded lines', () => {
  assert.equal(wrapText("100% 'x': C:\\test", 40), "100% 'x': C:\\test");
  for (const title of Object.values(APPROVED)) assert.ok(wrapText(title, 18).split('\n').every(line => line.length <= 18));
});
test('probe validation fails closed', () => {
  const good = { streams: [{ codec_type: 'video', width: 1080, height: 1920, codec_name: 'h264', pix_fmt: 'yuv420p' }], format: { duration: '15' } };
  assert.equal(verifyProbe(good).durationSeconds, 15);
  for (const duration of ['NaN', '11', '21']) assert.throws(() => verifyProbe({ ...good, format: { duration } }));
  assert.throws(() => verifyProbe({ ...good, streams: [] }));
});
