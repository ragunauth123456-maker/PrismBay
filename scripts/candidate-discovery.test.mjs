import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { discoverySources, expandSeeds, readDiscoveryState, writeDiscoveryState } from './candidate-discovery.mjs';
import { scoreSeed } from './viral-candidate-engine.mjs';

const now = new Date('2026-09-24T12:00:00Z');
const base = [{ slug: 'pan-scraper', name: 'Pan Scraper', query: 'pan scraper', videoFit: 0.8 }];
const feed = (index, title, date = now.toISOString(), suffix = 'article') => ({
  source: discoverySources[index].source, ok: true,
  items: [{ title, publishedAt: date, link: `https://${discoverySources[index].host}/${suffix}` }],
});
const headlines = () => [feed(0, 'Drawer dividers make organizing easy'), feed(1, 'Our guide to drawer dividers')];

test('novel dictionary category requires independent fresh evidence', () => {
  assert.equal(expandSeeds(base, headlines().slice(0, 1), {}, now).seeds.length, 1);
  const result = expandSeeds(base, headlines(), {}, now);
  assert.deepEqual(result.seeds.map(seed => seed.slug), ['pan-scraper', 'drawer-dividers']);
  assert.equal(result.state.records[0].status, 'research');
});
test('exact phrases exclude partial words, scattered tokens and unknown products', () => {
  for (const title of ['Drawer dividerscope is great', 'Drawer ideas and dividers', 'Amazing magic cleaning gadget']) {
    assert.equal(expandSeeds(base, [feed(0, title), feed(1, title + ' review')], {}, now).seeds.length, 1);
  }
});
test('syndicated titles, URL variants, repeated feeds and existing seeds do not duplicate', () => {
  assert.equal(expandSeeds(base, [feed(0, 'Best drawer dividers'), feed(1, 'Best drawer dividers')], {}, now).seeds.length, 1);
  assert.equal(expandSeeds(base, [feed(0, 'Best drawer dividers'), feed(0, 'New drawer dividers', undefined, 'article?tracking=1')], {}, now).seeds.length, 1);
  const first = expandSeeds(base, headlines(), {}, now);
  const second = expandSeeds(base, [...headlines(), ...headlines()], first.state, now);
  assert.equal(second.seeds.length, 2);
  assert.equal(second.state.records[0].evidence.length, 2);
  assert.equal(expandSeeds(first.seeds, headlines(), {}, now).seeds.length, 2);
});
test('stale, future, undated and untrusted evidence is excluded', () => {
  for (const date of ['2026-08-01', '2026-09-25', '', 'invalid']) {
    assert.equal(expandSeeds(base, [feed(0, 'Best drawer dividers', date), headlines()[1]], {}, now).seeds.length, 1);
  }
  const bad = feed(0, 'Best drawer dividers');
  bad.items[0].link = 'https://untrusted.example/article';
  assert.equal(expandSeeds(base, [bad, headlines()[1]], {}, now).seeds.length, 1);
});
test('state persists pending evidence, survives feed failure and ages out', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'prismbay-discovery-'));
  const file = path.join(directory, 'pool.json');
  assert.deepEqual(await readDiscoveryState(file), {});
  const pending = expandSeeds(base, [headlines()[0]], {}, now);
  await writeDiscoveryState(file, pending.state);
  const promoted = expandSeeds(base, [headlines()[1]], await readDiscoveryState(file), now);
  await writeDiscoveryState(file, promoted.state);
  const failed = [{ source: discoverySources[0].source, ok: false, items: [] }];
  assert.equal(expandSeeds(base, failed, await readDiscoveryState(file), now).seeds.length, 2);
  assert.deepEqual(expandSeeds(base, failed, promoted.state, new Date('2026-11-01')).seeds, base);
  assert.deepEqual(expandSeeds(base, failed, {}, now).seeds, base);
});
test('high attention cannot promote or list unverified products', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async url => ({ ok: true,
    json: async () => ({ data: { content: [{ productList: [{ id: 'mock', saleStatus: '3', totalVerifiedInventory: 100, sellPrice: 10, addMarkStatus: 1 }] }] } }),
    text: async () => '<rss>' + Array.from({ length: 30 }, (_, index) => `<item><title>Drawer dividers ${index}</title><pubDate>${now.toUTCString()}</pubDate></item>`).join('') + '</rss>',
  });
  try {
    const candidate = await scoreSeed(expandSeeds(base, headlines(), {}, now).seeds[1], now);
    assert.ok(candidate.attentionScore >= 55);
    for (const gate of ['freightReady', 'mediaRightsReady', 'liveStripePricingReady', 'promotionReady', 'listed']) assert.equal(candidate[gate], false);
  } finally { globalThis.fetch = originalFetch; }
});
