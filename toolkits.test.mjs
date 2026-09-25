import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const html=fs.readFileSync(new URL('./toolkits.html',import.meta.url),'utf8');
const index=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
const guide=fs.readFileSync(new URL('./guide.html',import.meta.url),'utf8');
const scorecard=fs.readFileSync(new URL('./scorecard.html',import.meta.url),'utf8');
const products=JSON.parse(fs.readFileSync(new URL('./product-audit.json',import.meta.url),'utf8'));
test('all four verified purchased ZIP packages have exact listed prices and active hosted links',()=>{
  assert.equal(products.offers.length,4);
  assert.equal(products.offers.reduce((n,p)=>n+(p.id!=='bundle'?p.priceUsd:0),0)-179,48);
  for(const p of products.offers){
    assert.ok(p.active&&p.deliveryGetVerified);
    assert.ok(p.zipFiles>=5&&p.zipBytes>70000&&p.formats.includes('PDF')&&p.formats.includes('XLSX')&&p.formats.includes('DOCX'));
    assert.ok(html.includes(p.checkoutUrl),p.id+' checkout absent');
    assert.match(html,new RegExp('\\$'+p.priceUsd+'\\b'));
  }
});
test('public product structured data prices, URLs and product labels match the Stripe audited manifest',()=>{
  const raw=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(raw,'missing valid structured data');
  const schema=JSON.parse(raw);
  assert.equal(schema['@type'],'ItemList');
  assert.equal(schema.itemListElement.length,4);
  for(const product of schema.itemListElement){
    const match=products.offers.find(x=>x.name===product.item.name);
    assert.ok(match,'unexpected structured product');
    assert.equal(Number(product.item.offers.price),match.priceUsd);
    assert.equal(product.item.offers.url,match.checkoutUrl);
    assert.equal(product.item.offers.priceCurrency,'USD');
  }
});
test('buyer sees terms, refunds, license scope, actual document formats and delivery explanation',()=>{
  for(const s of ['/refunds','/terms','/privacy','/contact','one-time','PDF','Excel','Word','not live hosted software','ZIP'])
    assert.ok(html.toLowerCase().includes(s.toLowerCase()),'missing '+s);
  assert.ok(html.includes('redirect to the existing PrismBay digital delivery page'));
  assert.ok(!/guaranteed earnings|perfect 5 stars|no risk guaranteed/i.test(html));
});
test('free resources remain free, while all educational navigation points to separate professional product store',()=>{
  for(const p of [index,guide,scorecard]) assert.ok(p.includes('./toolkits.html'));
  assert.match(index,/No email address, credit card/);
  assert.match(scorecard,/No login or paywall/);
});

test('original 36-second stakeholder video is embedded and cross-links its verified $49 toolkit',()=>{
  assert.match(html, /src="\.\/stakeholder-video\.mp4"/);
  assert.match(html, /href="#stakeholder">See the \$49 editable toolkit/);
  const media=new URL('./stakeholder-video.mp4',import.meta.url);
  assert.ok(fs.existsSync(media),'local preview missing');
  const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','format=duration:stream=codec_name,width,height','-of','json',fileURLToPath(media)],{encoding:'utf8'}));
  assert.ok(Number(probe.format.duration)>=35&&Number(probe.format.duration)<=37);
  assert.ok(probe.streams.some(x=>x.codec_name==='h264'&&x.width===720&&x.height===1280));
});
