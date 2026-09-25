import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {CHANNEL,reviewCandidate,classify,titleSimilarity} from './youtube-publishing-guard.mjs';
import {guardedPublish,prepareStudio} from './youtube-publishing-gateway.mjs';
const NOW=Date.parse('2026-09-25T08:00:00-04:00');
const brand={id:6945443,networksData:{youtubeData:CHANNEL}};
const make=(title,date='2026-09-25T12:00:00',extra={})=>({
  id:title,uuid:title,channelId:CHANNEL,text:'Practical AI business system: '+title,
  providers:[{network:'youtube',status:'PENDING'}],media:['https://example.com/'+title.replace(/\W/g,'')+'.mp4'],
  youtubeData:{title,tags:['AI business'],type:'short',madeForKids:false},publicationDate:{dateTime:date,timezone:'America/Guyana'},
  autoPublish:true,draft:false,...extra});
const queue=[make('AI workflow governance','2026-09-25T07:00:00',{providers:[{network:'youtube',status:'PUBLISHED'}]})];
const input=candidate=>({candidate,brandSettings:brand,queue,published:[],fetchedAt:new Date(NOW).toISOString(),now:NOW});
test('fail closed when channel or snapshot identity is wrong',()=>{
  let a=reviewCandidate(input(make('AI agents for operators',{toString(){return 'bad';}})));
  assert.equal(a.ok,false);
  assert.ok(reviewCandidate({...input(make('AI agents for operators')) ,brandSettings:{...brand,networksData:{youtubeData:'other'}}}).issues.includes('metricool-brand-or-channel-mismatch'));
  assert.ok(reviewCandidate({...input(make('AI agents for operators')),fetchedAt:'2026-09-23T00:00:00Z'}).issues.includes('stale-or-missing-queue-snapshot'));
});
test('blocks close spacing and near-duplicate titles',()=>{
  assert.ok(reviewCandidate(input(make('AI vendor risk checklist','2026-09-25T09:00:00'))).issues.includes('spacing-under-four-hours'));
  const a=make('Before You Buy Another AI Tool: The 3-Number ROI Test');
  const b=make('Before Buying AI: The 3-Number ROI Test #Shorts');
  assert.ok(titleSimilarity(a,b)>=0.8);
  assert.ok(reviewCandidate({...input(b),queue:[a]}).issues.includes('duplicate-creative'));
});
test('retail promotions cannot use the AI channel',()=>{
  assert.equal(classify(make('PrismBay Clean spin scrubber')).ok,false);
  assert.equal(classify(make('AI tool ROI test')).ok,true);
});
test('guarded publisher fetches new queue, publishes once and checks readback',async()=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'pb-gate-'));
  let sends=0;
  const candidate=make('AI procurement decision framework');
  const adapter={readBrand:async()=>brand,readQueue:async()=>({posts:queue,fetchedAt:new Date(NOW).toISOString()}),
    readPublished:async()=>({posts:[],fetchedAt:new Date(NOW).toISOString()}),
    send:async()=>{sends++;return {id:123,uuid:'platform-uuid'};},
    readBack:async()=>({...candidate,id:123,uuid:'platform-uuid',providers:[{network:'youtube',status:'PENDING'}]})};
  const one=await guardedPublish({candidate,adapter,stateDir:dir,now:()=>NOW});
  assert.equal(one.status,'verified');
  assert.equal((await guardedPublish({candidate,adapter,stateDir:dir,now:()=>NOW})).status,'duplicate-or-uncertain-blocked');
  assert.equal(sends,1);
  await fs.rm(dir,{recursive:true,force:true});
});
test('uncertain external response never triggers automatic retry',async()=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'pb-uncertain-'));let sends=0;
  const candidate=make('AI governance for small teams');
  const adapter={readBrand:async()=>brand,readQueue:async()=>({posts:queue,fetchedAt:new Date(NOW).toISOString()}),
    readPublished:async()=>({posts:[],fetchedAt:new Date(NOW).toISOString()}),
    send:async()=>{sends++;throw Error('timed out');},readBack:async()=>null};
  assert.equal((await guardedPublish({candidate,adapter,stateDir:dir,now:()=>NOW})).status,'uncertain-no-retry');
  assert.equal((await guardedPublish({candidate,adapter,stateDir:dir,now:()=>NOW})).status,'duplicate-or-uncertain-blocked');
  assert.equal(sends,1);await fs.rm(dir,{recursive:true,force:true});
});
test('studio receipt requires fresh queue and exact local media hash',async()=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'pb-studio-'));
  const file=path.join(dir,'original.mp4');await fs.writeFile(file,'placeholder test bytes');
  const hash=createHash('sha256').update('placeholder test bytes').digest('hex');
  const candidate=make('AI systems for procurement');
  candidate.localMediaPath=file;candidate.mediaSha256=hash;
  const snap={brandSettings:brand,queue,published:[],fetchedAt:new Date(NOW).toISOString()};
  const result=await prepareStudio({candidate,snapshot:snap,receiptPath:path.join(dir,'approval.json'),now:()=>NOW});
  assert.equal(result.status,'approved');
  const receipt=JSON.parse(await fs.readFile(result.receiptPath,'utf8'));
  assert.equal(receipt.mediaSha256,hash);assert.equal(receipt.channelId,CHANNEL);
  const denied=await prepareStudio({candidate:{...candidate,mediaSha256:'wrong'},snapshot:snap,receiptPath:path.join(dir,'wrong.json'),now:()=>NOW});
  assert.equal(denied.status,'blocked');
  await fs.rm(dir,{recursive:true,force:true});
});
