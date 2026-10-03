import test from 'node:test';
import assert from 'node:assert/strict';
import { CJReadOnlyQuoteClient } from './cj-readonly-quote.mjs';

const NOW = Date.parse('2026-10-03T16:30:00Z');

function response(payload, status = 200) {
  return { ok: status >= 200 && status < 300, status, async json() { return payload; } };
}

function makeFetch({ productSku = 'CJJT1731477', variantSku = 'CJJT173147702BY', inventory = 4, freight = 6.31, variantRows, freightRows } = {}) {
  const calls = [];
  const fetchImpl = async (url, init = {}) => {
    const href = String(url);
    calls.push({ href, method: init.method || 'GET', body: init.body || null });
    if (href.endsWith('/authentication/getAccessToken')) return response({ result: true, data: { accessToken: 'token-secret-never-returned' } });
    if (href.includes('/product/query')) return response({ result: true, data: { pid: 'p1', productSku, productNameEn: '4 In 1 Bottle Gap Cleaner Brush', saleStatus: '3' } });
    if (href.includes('/product/variant/query')) return response({ result: true, data: variantRows || [
      { vid: 'wrong', variantSku: 'OTHER-VARIANT', variantSellPrice: 1.2 },
      { vid: 'v1', variantSku, variantSellPrice: 1.89, variantKey: 'Grey' },
    ] });
    if (href.includes('/product/stock/queryByVid')) return response({ result: true, data: [
      { vid: 'v1', countryCode: 'US', cjInventoryNum: inventory, totalInventoryNum: inventory },
      { vid: 'v1', countryCode: 'CN', cjInventoryNum: 100, totalInventoryNum: 100 },
    ] });
    if (href.endsWith('/logistic/freightCalculate')) return response({ result: true, data: freightRows || [
      { logisticName: 'Zero Method', logisticPrice: 0, logisticAging: '1-3' },
      { logisticName: 'LuWei Ordinary US', logisticPrice: freight, logisticAging: '5-11' },
      { logisticName: 'Higher', logisticPrice: 9.8, logisticAging: '3-7' },
    ] });
    throw new Error(`Unexpected URL ${href}`);
  };
  return { fetchImpl, calls };
}

function client(fetchImpl) {
  return new CJReadOnlyQuoteClient({ apiKey: 'api-key-value', fetchImpl, now: () => NOW });
}

test('quotes the exact approved variant for the actual buyer ZIP and never returns credentials', async () => {
  const mock = makeFetch();
  const quote = await client(mock.fetchImpl).quoteExactVariant({ expectedProductSku: 'CJJT1731477', expectedVariantSku: 'CJJT173147702BY', zip: '10001', quantity: 1 });
  assert.equal(quote.variantSku, 'CJJT173147702BY');
  assert.equal(quote.variantId, 'v1');
  assert.equal(quote.productCostUsd, 1.89);
  assert.equal(quote.inventory, 4);
  assert.equal(quote.originCountryCode, 'US');
  assert.equal(quote.freightUsd, 6.31);
  assert.equal(quote.freightScope, 'buyer_destination_zip');
  assert.equal(quote.finalDestinationFreight, true);
  assert.equal(quote.zip, '10001');
  assert.equal(quote.automaticSupplierOrdering, false);
  assert.equal(JSON.stringify(quote).includes('token-secret'), false);
  const freightCall = mock.calls.find(call => call.href.endsWith('/logistic/freightCalculate'));
  assert.deepEqual(JSON.parse(freightCall.body), { startCountryCode: 'US', endCountryCode: 'US', zip: '10001', products: [{ quantity: 1, vid: 'v1' }] });
  assert.equal(mock.calls.some(call => /\/order|payment|purchase/i.test(new URL(call.href).pathname)), false);
});

test('fails closed on product SKU mismatch', async () => {
  const mock = makeFetch({ productSku: 'DIFFERENT' });
  await assert.rejects(() => client(mock.fetchImpl).quoteExactVariant({ expectedProductSku: 'CJJT1731477', expectedVariantSku: 'CJJT173147702BY', zip: '10001' }), /product SKU does not match/);
  assert.equal(mock.calls.some(call => call.href.includes('/logistic/freightCalculate')), false);
});

test('never substitutes another variant when exact mapped variant is unavailable', async () => {
  const mock = makeFetch({ variantRows: [{ vid: 'other', variantSku: 'OTHER', variantSellPrice: 0.9 }] });
  await assert.rejects(() => client(mock.fetchImpl).quoteExactVariant({ expectedProductSku: 'CJJT1731477', expectedVariantSku: 'CJJT173147702BY', zip: '10001' }), /substitution is prohibited/);
  assert.equal(mock.calls.some(call => call.href.includes('/product/stock/queryByVid')), false);
});

test('falls back to another verified origin only when the same exact variant has sufficient stock', async () => {
  const mock = makeFetch({ inventory: 0 });
  const quote = await client(mock.fetchImpl).quoteExactVariant({ expectedProductSku: 'CJJT1731477', expectedVariantSku: 'CJJT173147702BY', zip: '90210', quantity: 1 });
  assert.equal(quote.originCountryCode, 'CN');
  const freightCall = mock.calls.find(call => call.href.endsWith('/logistic/freightCalculate'));
  assert.equal(JSON.parse(freightCall.body).startCountryCode, 'CN');
});

test('insufficient inventory blocks quote before freight', async () => {
  const mock = makeFetch();
  const original = mock.fetchImpl;
  const fetchImpl = async (url, init) => {
    if (String(url).includes('/product/stock/queryByVid')) return response({ result: true, data: [{ vid: 'v1', countryCode: 'US', cjInventoryNum: 0, totalInventoryNum: 0 }] });
    return original(url, init);
  };
  await assert.rejects(() => client(fetchImpl).quoteExactVariant({ expectedProductSku: 'CJJT1731477', expectedVariantSku: 'CJJT173147702BY', zip: '10001' }), /insufficient verified inventory/);
});

test('zero-priced or missing freight is not treated as free shipping', async () => {
  const mock = makeFetch({ freightRows: [{ logisticName: 'Suspicious Free', logisticPrice: 0, logisticAging: '3-5' }] });
  await assert.rejects(() => client(mock.fetchImpl).quoteExactVariant({ expectedProductSku: 'CJJT1731477', expectedVariantSku: 'CJJT173147702BY', zip: '10001' }), /no positive-price freight method/);
});

test('invalid destination and quantity never touch CJ', async () => {
  const mock = makeFetch();
  await assert.rejects(() => client(mock.fetchImpl).quoteExactVariant({ expectedProductSku: 'CJJT1731477', expectedVariantSku: 'CJJT173147702BY', zip: 'ABC' }), /five-digit/);
  await assert.rejects(() => client(mock.fetchImpl).quoteExactVariant({ expectedProductSku: 'CJJT1731477', expectedVariantSku: 'CJJT173147702BY', zip: '10001', quantity: 9 }), /1 to 5/);
  assert.equal(mock.calls.length, 0);
});
