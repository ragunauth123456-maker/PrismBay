import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const read = file => fs.readFileSync(new URL(file,import.meta.url),'utf8');
test('free resource includes all ten questions with no paywall',()=>{
 const home=read('./index.html'), guide=read('./guide.html'), md=read('./risk-matrix.md');
 assert.match(home,/Try the free interactive review/);assert.match(home,/No email address, credit card/);
 assert.match(home,/voluntary commercial support/i);assert.match(home,/not a charitable donation/i);
 assert.match(guide,/Keep the worksheet free/);assert.match(md,/fictional worked example/i);
 assert.equal(Array.from({length:10},(_,i)=>'| '+(i+1)+' |').filter(q=>md.includes(q)).length,10);
 assert.ok(guide.includes('10-question')&&guide.includes('<table>'));
});
test('local media and verified live Stripe support link are wired',()=>{
 const home=read('./index.html'), guide=read('./guide.html');
 const link='https://buy.stripe.com/aFa3cw0jweEMfCn2xs2400H';
 assert.ok(home.includes(link)&&guide.includes(link));assert.ok(home.includes('Studysmartz LLC'));
 assert.ok(home.includes('<source src="./vendor-risk.mp4"'));assert.ok(fs.statSync(new URL('./vendor-risk.mp4',import.meta.url)).size>250000);
 assert.ok(fs.statSync(new URL('./cover.jpg',import.meta.url)).size>30000);
 assert.ok(fs.statSync(new URL('./og-card.png',import.meta.url)).size>100000);
 assert.ok(home.includes('og-card.png') && guide.includes('og-card.png'));
 assert.ok(home.includes('./scorecard.html') && guide.includes('./scorecard.html'));
 assert.ok(!/fake testimonials|guaranteed earnings/i.test(home));
});
test('video is silent mobile portrait H264 with 30-second duration',()=>{
 const file=fileURLToPath(new URL('./vendor-risk.mp4',import.meta.url));
 const p=spawnSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json',file],{encoding:'utf8'});
 assert.equal(p.status,0,p.stderr);
 const x=JSON.parse(p.stdout),v=x.streams.find(s=>s.codec_type==='video');
 assert.equal(v.width,1080);assert.equal(v.height,1920);assert.equal(v.codec_name,'h264');
 assert.equal(x.streams.filter(s=>s.codec_type==='audio').length,0);
 assert.ok(Number(x.format.duration)>29.5&&Number(x.format.duration)<30.5);
});
