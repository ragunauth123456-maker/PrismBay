import test from 'node:test';
import assert from 'node:assert/strict';
import { createCJReadOnlyClient } from './cj-api-limiter.mjs';

const okay = (data = {}) => ({ok:true,status:200,json:async()=>({code:200,result:true,data})});
const blocked = (code = 1600200,status = 429) => ({
  ok:false,status,json:async()=>({code,result:false})
});
const clock = () => {
  let ms = 0;
  return {now:()=>ms,pause:async time=>{ms += time;},time:()=>ms};
};

test('CJ client spaces consecutive API calls by at least 1.4 seconds', async () => {
  const c=clock(), times=[];
  const request=createCJReadOnlyClient({now:c.now,pause:c.pause,transport:async()=>{times.push(c.time());return okay();}});
  await request('first'); await request('second'); await request('third');
  assert.deepEqual(times,[0,1400,2800]);
});

test('CJ 1600200 retries twice with bounded backoff, then returns safely', async()=>{
  const c=clock(),calls=[];let n=0;
  const request=createCJReadOnlyClient({now:c.now,pause:c.pause,
    transport:async()=>{calls.push(c.time());return ++n===3?okay():blocked();}});
  assert.deepEqual((await request('supplier')).data,{});
  assert.equal(calls.length,3);
  assert.ok(calls[1]-calls[0]>=2600);
  assert.ok(calls[2]-calls[1]>=6000);
});

test('persistent rate limit stops after three requests without infinite retry', async()=>{
  const c=clock();let calls=0;
  const request=createCJReadOnlyClient({now:c.now,pause:c.pause,
    transport:async()=>{calls++;return blocked();}});
  await assert.rejects(request('supplier'),/1600200/);
  assert.equal(calls,3);
});

test('quota exhausted, invalid token and network exceptions are not blindly retried',async()=>{
  for(const fail of [blocked(1600201,429),blocked(1600001,401)]){
    const c=clock();let calls=0;
    const request=createCJReadOnlyClient({now:c.now,pause:c.pause,
      transport:async()=>{calls++;return fail;}});
    // 1600201 can also arrive with HTTP 429. Never retry exhausted quota.
    await assert.rejects(request('supplier'));
    assert.equal(calls,1);
  }
  const c=clock();
  const request=createCJReadOnlyClient({now:c.now,pause:c.pause,
    transport:async()=>{throw new Error('private api route');}});
  await assert.rejects(request('supplier'),/CJ network request failed/);
});

test('CJ reports API errors with sanitized numeric codes only',async()=>{
  const c=clock();
  const request=createCJReadOnlyClient({now:c.now,pause:c.pause,
    transport:async()=>blocked(1600300,400)});
  await assert.rejects(request('supplier'),/1600300/);
});
