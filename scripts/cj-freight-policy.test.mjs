import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCJFreight, parseCJFreightTip, freightRequest, freightTipRequest, chooseQuote } from './cj-freight-policy.mjs';

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

test('Tip quote uses total postage and stays an illustrative estimate', () => {
  const tip = parseCJFreightTip({data:[{
    discountFee:4.09, wrapPostage:4.50, totalPostageFee:5.12,
    arrivalTime:'5-9', option:{enName:'CJPacket'},
  }]},'tip_example_zip_estimate','10001');
  assert.equal(tip.offers[0].usd,5.12);
  assert.equal(tip.offers[0].name,'CJPacket');
  assert.equal(tip.offers[0].exampleZip,'10001');
  const country = parseCJFreight({data:[{logisticName:'Carrier',logisticPrice:0}]});
  const chosen = chooseQuote(country,null,tip);
  assert.equal(chosen.scope,'tip_example_zip_estimate');
  assert.equal(chosen.finalDestinationVerified,false);
});

test('positive country quote is preferred to a Tip estimate', () => {
  const country = parseCJFreight({data:[{logisticName:'A',logisticPrice:'8.50',logisticAging:'4-9'}]});
  const tip = parseCJFreightTip({data:[{totalPostageFee:7,option:{enName:'B'}}]},'tip_example_zip_estimate','10001');
  assert.equal(chooseQuote(country,null,tip).scope,'country_estimate');
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

test('freight request uses CJ official fields and a verified origin', () => {
  assert.deepEqual(freightRequest('SKU-V1'), {
    startCountryCode:'US',endCountryCode:'US',products:[{quantity:1,vid:'SKU-V1'}]});
  assert.deepEqual(freightRequest('SKU-V1',null,'CN'), {
    startCountryCode:'CN',endCountryCode:'US',products:[{quantity:1,vid:'SKU-V1'}]});
  assert.equal(freightRequest('SKU-V1','10001','CN').zip,'10001');
  assert.throws(()=>freightRequest('SKU-V1','A100'),/ZIP/);
  assert.throws(()=>freightRequest('SKU-V1',null,'CHINA'),/Origin/);
  assert.throws(()=>freightRequest('',null),/variant ID/);
});

test('Tip request converts variant mm3 to cm3 and uses verified product properties', () => {
  const request = freightTipRequest({
    variant:{variantSku:'CJABC01',variantWeight:480,variantVolume:6000000},
    detail:{packWeight:'530.0',productProEnSet:['COMMON'],productType:'0'},
    zip:'10001',
    origin:'US',
  });
  const row = request.reqDTOS[0];
  assert.equal(row.weight,480);
  assert.equal(row.wrapWeight,530);
  assert.equal(row.volume,6000);
  assert.deepEqual(row.productProp,['COMMON']);
  assert.deepEqual(row.skuList,['CJABC01']);
  assert.equal(row.shippingMode,2);
  assert.equal(row.zip,'10001');
});

test('Tip request fails closed when freight-critical metadata is missing', () => {
  assert.throws(()=>freightTipRequest({
    variant:{variantSku:'CJABC01',variantWeight:480,variantVolume:6000000},
    detail:{productProEnSet:[]},
  }),/requires verified SKU/);
  assert.throws(()=>freightTipRequest({
    variant:{variantSku:'CJABC01',variantWeight:480,variantVolume:6000000},
    detail:{productProEnSet:['COMMON']},
    zip:'bad',
  }),/ZIP/);
});
