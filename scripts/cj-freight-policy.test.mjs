import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCJFreight, freightRequest, chooseQuote } from './cj-freight-policy.mjs';

test('eleven zero-priced CJ methods are NOT free-shipping proof', () => {
  const rows = Array.from({ length: 11 }, (_, i) => ({
    logisticName: 'Method ' + i, logisticPrice: 0, logisticAging: '2-5',
  }));
  const q = parseCJFreight({data:rows});
  assert.equal(q.zeroPriced,11);
  assert.equal(q.offers.length,0);
  assert.equal(q.diagnostic,'zero_priced_methods_require_supplier_confirmation');
  assert.equal(chooseQuote(q).offers.length,0);
});

test('illustrative ZIP quote never authorizes delivery to the buyer', () => {
  const country = parseCJFreight({data:[{logisticName:'Carrier',logisticPrice:0}]});
  const example = parseCJFreight({data:[{logisticName:'Carrier',logisticPrice:'5.65',logisticAging:'3-7'}]},'example_zip_estimate','10001');
  const chosen = chooseQuote(country,example);
  assert.equal(chosen.scope,'example_zip_estimate');
  assert.equal(chosen.offers[0].usd,5.65);
  assert.equal(chosen.offers[0].exampleZip,'10001');
  assert.equal(chosen.finalDestinationVerified,false);
  assert.equal(chosen.zeroPriced,1);
});

test('positive country quote is preferred to an example ZIP quote', () => {
  const country = parseCJFreight({data:[{logisticName:'A',logisticPrice:'8.50',logisticAging:'4-9'}]});
  const example = parseCJFreight({data:[{logisticName:'B',logisticPrice:7}]},'example_zip_estimate','10001');
  assert.equal(chooseQuote(country,example).scope,'country_estimate');
});

test('malformed, negative and missing pricing never becomes a quote', () => {
  const q = parseCJFreight({data:[
    {logisticName:'A',logisticPrice:-4},
    {logisticName:'B',logisticPrice:'n/a'},
    {logisticName:'C'},
    {logisticName:'D',logisticPrice:true},
    {logisticName:'E',logisticPrice:5},
    {logisticPrice:10},
  ]});
  assert.equal(q.offers.length,1);
  assert.equal(q.invalid,5);
});

test('freight request uses CJ official simple-endpoint fields only', () => {
  assert.deepEqual(freightRequest('SKU-V1'), {
    startCountryCode:'US',endCountryCode:'US',products:[{quantity:1,vid:'SKU-V1'}]});
  assert.equal(freightRequest('SKU-V1','10001').zip,'10001');
  assert.throws(()=>freightRequest('SKU-V1','A100'),/ZIP/);
  assert.throws(()=>freightRequest('',null),/variant ID/);
});
