import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { loadCatalog, mapItems } from './catalog.mjs';

const catalog = loadCatalog(fileURLToPath(new URL('./catalog.prismbay-live.json', import.meta.url)));
const productCases = [
  ['scrubber', 'plink_1UHk3VKDLFBMHojQiqrPvlda'],
  ['pethair', 'plink_1UHk3hKDLFBMHojQdsdP95vn'],
  ['crevice', 'plink_1UHk3oKDLFBMHojQEAnzuocV'],
  ['pressure-washer', 'plink_1UHk3vKDLFBMHojQLQjWdML5'],
  ['mattress-vacuum', 'plink_1UHk49KDLFBMHojQVKLayIMS'],
  ['garment-steamer', 'plink_1UHk4GKDLFBMHojQ71RMLPTa'],
  ['mini-mop', 'plink_1UHk4NKDLFBMHojQ5ncqgUul'],
  ['drain-catcher', 'plink_1UHk4XKDLFBMHojQDFTRHrbf'],
  ['home-caddy', 'plink_1UHk4gKDLFBMHojQxRQ72nWn'],
];
test('live catalog maps exactly the verified 9 product checkout links', () => {
  assert.equal(catalog.accountId, 'acct_1UHjcPKDLFBMHojQ');
  assert.equal(catalog.mappings.length, 30);
  for (const [sku, id] of productCases) assert.deepEqual(mapItems({payment_link:id},catalog), [{sku,quantity:1}]);
});
test('live bundle has exactly three verified physical components', () => {
  assert.deepEqual(mapItems({payment_link:'plink_1UIpiaKDLFBMHojQdm6Mchul'},catalog), [
    {sku:'scrubber',quantity:1},{sku:'crevice',quantity:1},{sku:'pethair',quantity:1}
  ]);
});
test('unknown and incomplete baskets are never assumed to be valid', () => {
  assert.equal(mapItems({payment_link:'plink_unknown'},catalog),null);
  assert.equal(mapItems({line_items:{has_more:true,data:[]}},catalog),null);
});
