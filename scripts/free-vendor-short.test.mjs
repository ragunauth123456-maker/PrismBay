import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { validateProbe } from './render-free-vendor-short.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('free worksheet is complete and does not direct readers to an unverified checkout', () => {
  const s = fs.readFileSync(path.join(root, 'public/free/ai-vendor-risk-matrix.md'), 'utf8');
  assert.equal([...s.matchAll(/^\| (?:[1-9]|10) \|/gm)].length, 10);
  assert.match(s, /human review/i);
  assert.match(s, /fictional worked example/i);
  assert.ok(!s.includes('buy.stripe.com'));
});
test('public original promo is silent, vertical and free of paid offer', () => {
  const file = path.join(root, 'public/videos/prismbay-ai-free-vendor-risk-matrix-20260924.mp4');
  const p = spawnSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file], { encoding: 'utf8' });
  assert.equal(p.status, 0);
  const data = JSON.parse(p.stdout);
  assert.deepEqual(data.streams.filter(s => s.codec_type === 'audio'), []);
  const { durationSeconds, bytes } = validateProbe(data);
  assert.ok(durationSeconds >= 29 && durationSeconds <= 31);
  assert.ok(bytes < 10000000);
});
test('media gate rejects wrong video dimensions and format', () => {
  assert.throws(() => validateProbe({ streams: [{ codec_type: 'video', width: 720, height: 1280, codec_name: 'h264', pix_fmt: 'yuv420p' }], format: { duration: '30', size: '100000' } }));
});
