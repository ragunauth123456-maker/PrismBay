import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { settings, sync } from './free-cloud-sync.mjs';

test('unconnected Cloudflare is a clean no-op',async()=>{
  assert.equal(settings({}),null);
  assert.deepEqual(await sync('report',{env:{}}),{configured:false,reason:'Cloudflare credentials not connected; GitHub workers remain operational.'});
});
test('reporting credentials require a HTTPS workers.dev endpoint',()=>{
  const token='x'.repeat(64);
  assert.throws(()=>settings({PRISMBAY_CF_ENDPOINT:'http://untrusted.example',PRISMBAY_CF_REPORT_TOKEN:token}));
  assert.throws(()=>settings({PRISMBAY_CF_ENDPOINT:'https://cloud.example.com',PRISMBAY_CF_REPORT_TOKEN:token}));
  assert.throws(()=>settings({PRISMBAY_CF_ENDPOINT:'https://prismbay.user.workers.dev',PRISMBAY_CF_REPORT_TOKEN:'short'}));
});
test('approved tasks are polled before the scheduled job and completed afterward',async()=>{
  const env={PRISMBAY_CF_ENDPOINT:'https://prismbay.user.workers.dev',PRISMBAY_CF_REPORT_TOKEN:'x'.repeat(64),GITHUB_RUN_ID:'36206405788',PRISMBAY_RUN_STATUS:'success'};
  const taskId='12345678-1234-1234-1234-123456789abc';
  const calls=[];
  const fetchFn=async (url,opts)=>{
    calls.push({url,method:opts.method||'GET'});
    return {ok:true,json:async()=>url.endsWith('/pending')?{tasks:[{task_id:taskId,kind:'research_refresh'}]}:{completed:true,accepted:true}};
  };
  try {
    assert.equal((await sync('poll',{env,fetchFn})).queued,1);
    assert.equal((await sync('complete',{env,fetchFn})).completed,1);
    const sent=await sync('report',{env,fetchFn});
    assert.equal(sent.accepted,true);
    assert.deepEqual(calls.map(c=>c.method),['GET','POST','POST']);
    assert.ok(calls[1].url.endsWith(taskId+'/complete'));
  } finally {
    await fs.unlink('growth-reports/cloudflare-pending-tasks.json').catch(()=>{});
  }
});
