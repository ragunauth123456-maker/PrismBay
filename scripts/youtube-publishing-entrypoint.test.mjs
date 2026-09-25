import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {patchSource} from './install-youtube-studio-gate.mjs';
import {preflight} from './youtube-publishing-preflight.mjs';
const channel='UCw2hs85TzIpdKwJtG-BSxzQ';
test('native publisher patch is idempotent and rejects tampering',()=>{
  const original="import pychrome, time, json, os\n"+
    "b=pychrome.Browser(url='http://127.0.0.1:9222')\n"+
    "tabs=[x for x in b.list_tab() if 'studio.youtube.com/channel/"+channel+"' in x._kwargs.get('url','')]\n"+
    "t=tabs[0]\nt.start(); t.Runtime.enable()\n"+
    "print('publish',click_text('Publish'),flush=True)\n";
  const patched=patchSource(original,'youtube_publish_current.py');
  assert.match(patched,/receipt=require_gate\("publish"\)/);
  assert.match(patched,/assert_current_metadata\(t, receipt\)/);
  assert.equal(patchSource(patched,'youtube_publish_current.py'),patched);
  assert.throws(()=>patchSource(patched.replace('receipt=require_gate("publish")','receipt={}'),'youtube_publish_current.py'));
});
test('CLI refuses stale snapshots and verifies current authenticated schema',async()=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'pb-cli-'));
  const name=path.join(dir,'snapshot.json');
  const snap={brandSettings:{id:6945443,networksData:{youtubeData:channel}},
    fetchedAt:new Date().toISOString(),queue:[],published:[]};
  await fs.writeFile(name,JSON.stringify(snap));
  assert.equal((await preflight({mode:'audit',snapshotPath:name})).status,'verified');
  snap.fetchedAt='2026-09-01T00:00:00Z';
  await fs.writeFile(name,JSON.stringify(snap));
  assert.equal((await preflight({mode:'audit',snapshotPath:name})).status,'blocked');
  await fs.rm(dir,{recursive:true,force:true});
});
