import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTIVE_DIGITAL_OFFERS } from './digital-conversion-campaign.mjs';
import { deterministicSalesPlan } from './freellm-sales-worker.mjs';
import { trackedUrl, scenesForOffer, buildQueue, verifyProbe } from './external-traffic-worker.mjs';

test('external traffic queue covers all verified digital offers on YouTube and TikTok',()=>{
  const plans={};
  for(const offer of ACTIVE_DIGITAL_OFFERS) plans[offer.slug]=deterministicSalesPlan(offer,{guideUrl:offer.guide,checkoutUrl:offer.checkout});
  const q=buildQueue({offers:ACTIVE_DIGITAL_OFFERS,plans,generatedAt:'2026-10-01T00:00:00.000Z'});
  assert.equal(q.items.length,6);
  assert.deepEqual([...new Set(q.items.map(x=>x.channel))].sort(),['tiktok','youtube']);
  for(const item of q.items){
    assert.equal(item.status,'ready_for_authorized_scheduler');
    assert.match(item.mediaUrl,/ragunauthramsaroop\.github\.io\/PrismBay\/media\/social\/.+\.mp4$/);
    assert.match(item.destinationUrl,/utm_campaign=prismbay_external_traffic_oct2026/);
    assert.ok(!/guaranteed|best seller|limited stock|verified customer/i.test(item.caption));
  }
});
test('tracking separates YouTube and TikTok traffic',()=>{
  const offer=ACTIVE_DIGITAL_OFFERS[0];
  const y=new URL(trackedUrl(offer,'youtube'));
  const t=new URL(trackedUrl(offer,'tiktok'));
  assert.equal(y.searchParams.get('utm_source'),'youtube');
  assert.equal(y.searchParams.get('utm_medium'),'shorts');
  assert.equal(t.searchParams.get('utm_source'),'tiktok');
  assert.equal(t.searchParams.get('utm_medium'),'organic_video');
});
test('video scenes use exact offer price and safe educational copy',()=>{
  const offer=ACTIVE_DIGITAL_OFFERS[1];
  const plan=deterministicSalesPlan(offer,{guideUrl:offer.guide,checkoutUrl:offer.checkout});
  const scenes=scenesForOffer(offer,plan);
  assert.equal(scenes.length,4);
  assert.match(JSON.stringify(scenes),/\$99 USD one time/);
  assert.doesNotMatch(JSON.stringify(scenes),/guaranteed|customer testimonial|limited time/i);
});
test('media QA enforces vertical silent H264 output',()=>{
  const good={streams:[{codec_type:'video',width:1080,height:1920,codec_name:'h264',pix_fmt:'yuv420p'}],format:{duration:20,size:500000}};
  assert.equal(verifyProbe(good).durationSeconds,20);
  assert.throws(()=>verifyProbe({...good,streams:[{...good.streams[0],width:720}]}));
  assert.throws(()=>verifyProbe({...good,streams:[...good.streams,{codec_type:'audio'}]}));
});
