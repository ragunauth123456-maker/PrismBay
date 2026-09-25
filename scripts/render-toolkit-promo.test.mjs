import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scenes, offer, verifyMedia } from './render-toolkit-promo.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
test('verified product facts and existing checkout URLs are exact',()=>{
 assert.equal(offer.name,'Executive White Paper & Board Briefing System');
 assert.equal(offer.amountUsd,79);
 assert.equal(offer.checkout,'https://buy.stripe.com/bJe7sMgq25hNcCe6SAgnK0s');
 assert.ok(offer.link.includes('/PrismBay/toolkits.html#whitepaper'));
 assert.deepEqual(offer.included,['PDF implementation guide','Excel claims and source workbook','Two editable Word templates','Instructions and internal-use license']);
});
test('short has six honest five-second scenes and disclosed own-brand commercial CTA',()=>{
 assert.equal(scenes.length,6);
 const copy=JSON.stringify(scenes);
 for(const word of ['Strong opinions','source','Facts','Assumptions','Word','PDF','Excel','$79','Stripe','not AI software'])
   assert.ok(copy.toLowerCase().includes(word.toLowerCase()),word+' missing');
 assert.ok(!/customer testimonial|guaranteed revenue|guaranteed board|limited time/i.test(copy));
});
test('media QA rejects wrong codec, aspect ratio, audio and oversized assets',()=>{
 const good={streams:[{codec_type:'video',width:1080,height:1920,codec_name:'h264',pix_fmt:'yuv420p'}],format:{duration:30,size:300000}};
 assert.equal(verifyMedia(good).durationSeconds,30);
 assert.throws(()=>verifyMedia({...good,streams:[{...good.streams[0],width:720}]}));
 assert.throws(()=>verifyMedia({...good,streams:[{...good.streams[0],codec_name:'mpeg4'}]}));
 assert.throws(()=>verifyMedia({...good,streams:[...good.streams,{codec_type:'audio'}]}));
 assert.throws(()=>verifyMedia({...good,format:{duration:45,size:300000}}));
 assert.throws(()=>verifyMedia({...good,format:{duration:30,size:20000000}}));
});
test('rendered original video and review frames exist after running renderer on K1',()=>{
 const output=path.join(root,'growth-reports/videos/toolkit-paid');
 const video=path.join(output,'executive-whitepaper-board-brief-promo.mp4');
 if(!fs.existsSync(video))return; // GitHub CI can validate source without local ignored binary
 assert.ok(fs.statSync(video).size<10000000);
 const m=JSON.parse(fs.readFileSync(path.join(output,'manifest.json'),'utf8'));
 assert.equal(m.videoId,'executive-whitepaper-board-brief-promo');
 assert.equal(m.offer.amountUsd,79);
 assert.ok(m.rights.audio.includes('None'));
 assert.equal(m.media.durationSeconds,30);
 assert.ok(m.media.sha256.length===64);
 assert.ok(fs.existsSync(path.join(output,'preview-first.png')));
 assert.ok(fs.existsSync(path.join(output,'preview-last.png')));
});
