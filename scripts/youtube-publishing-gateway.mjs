import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {CHANNEL, BRAND, fingerprint, reviewCandidate} from './youtube-publishing-guard.mjs';
const json=x=>JSON.stringify(x);
const sha=x=>createHash('sha256').update(x).digest('hex');
const fail=x=>{throw Error(x);};
export async function guardedPublish({candidate,adapter,stateDir,now=Date.now}) {
  if (!adapter || !['readBrand','readQueue','readPublished','send','readBack'].every(k=>typeof adapter[k]==='function')) fail('Incomplete authenticated publishing adapter');
  if (!stateDir) fail('Private state directory required');
  await fs.mkdir(stateDir,{recursive:true,mode:0o700});
  const lock=path.join(stateDir,'youtube-publisher.lock');
  let handle;
  try { handle=await fs.open(lock,'wx',0o600); } catch(e) { if(e.code==='EEXIST') fail('Publisher busy; never bypass lock'); throw e; }
  let ledgerPath;
  try {
    const brand=await adapter.readBrand();
    const snapshot=await adapter.readQueue();
    const history=await adapter.readPublished();
    const gate=reviewCandidate({candidate,queue:snapshot.posts,brandSettings:brand,published:history.posts,
      fetchedAt:snapshot.fetchedAt,now:now()});
    if(!gate.ok) return {status:'blocked',issues:gate.issues};
    if(!history.fetchedAt || Math.abs(now()-Date.parse(history.fetchedAt))>120000)
      return {status:'blocked',issues:['stale-published-history']};
    if(candidate.autoPublish!==true || candidate.draft!==false)
      return {status:'blocked',issues:['candidate-is-not-approved-for-autopublish']};
    const key=sha(CHANNEL+'|'+fingerprint(candidate));
    ledgerPath=path.join(stateDir,key+'.json');
    let record;
    try {record=await fs.open(ledgerPath,'wx',0o600);}
    catch(e){if(e.code==='EEXIST')return {status:'duplicate-or-uncertain-blocked'};throw e;}
    await record.writeFile(json({status:'reserved-uncertain',channel:CHANNEL,brand:BRAND,
      contentFingerprint:fingerprint(candidate),createdAt:new Date(now()).toISOString()}));
    await record.sync(); await record.close();
    let sent;
    try {sent=await adapter.send(candidate);} catch {
      return {status:'uncertain-no-retry',issues:['downstream-response-not-confirmed']};
    }
    if(!sent?.id && !sent?.uuid) return {status:'uncertain-no-retry',issues:['missing-platform-identifier']};
    let seen;
    try {seen=await adapter.readBack(sent);} catch {
      return {status:'uncertain-no-retry',issues:['post-write-readback-unavailable']};
    }
    if(!seen || (sent.uuid && seen.uuid!==sent.uuid) || !seen.providers?.some(x=>x.network==='youtube') ||
      seen.youtubeData?.title!==candidate.youtubeData?.title || seen.media?.[0]!==candidate.media?.[0] ||
      seen.autoPublish!==candidate.autoPublish || seen.draft!==candidate.draft ||
      JSON.stringify(seen.publicationDate)!==JSON.stringify(candidate.publicationDate))
      return {status:'uncertain-no-retry',issues:['platform-readback-mismatch']};
    await fs.writeFile(ledgerPath,json({status:'verified',channel:CHANNEL,brand:BRAND,
      contentFingerprint:fingerprint(candidate),platformId:seen.id,uuid:seen.uuid,
      verifiedAt:new Date(now()).toISOString()}),{flag:'w',mode:0o600});
    return {status:'verified',channel:CHANNEL,platformId:seen.id,uuid:seen.uuid};
  } finally {
    await handle?.close();
    if(handle) await fs.unlink(lock).catch(()=>{});
  }
}
export async function prepareStudio({candidate,snapshot,receiptPath,now=Date.now}) {
  if(!receiptPath)fail('Receipt path required');
  const dir=path.dirname(receiptPath);
  await fs.mkdir(dir,{recursive:true,mode:0o700});
  const lock=path.join(dir,'.studio-preflight.lock');
  let handle;
  try {handle=await fs.open(lock,'wx',0o600);}
  catch(e){if(e.code==='EEXIST')return {status:'blocked',issues:['another-studio-preflight-in-progress']};throw e;}
  try {
    const gate=reviewCandidate({candidate,queue:snapshot?.queue,brandSettings:snapshot?.brandSettings,
      published:snapshot?.published,fetchedAt:snapshot?.fetchedAt,now:now()});
    if(!gate.ok)return {status:'blocked',issues:gate.issues};
    if(!candidate?.localMediaPath || !candidate?.mediaSha256)
      return {status:'blocked',issues:['local-media-path-and-hash-required']};
    let media;
    try {media=await fs.readFile(candidate.localMediaPath);}
    catch{return {status:'blocked',issues:['local-media-unavailable']};}
    if(sha(media)!==candidate.mediaSha256)return {status:'blocked',issues:['media-checksum-mismatch']};
    const reserved=(await fs.readdir(dir)).filter(n=>n.endsWith('.reserve.json'));
    for(const name of reserved) {
      let other;try {other=JSON.parse(await fs.readFile(path.join(dir,name),'utf8'));}catch{return {status:'blocked',issues:['corrupt-reservation-ledger']};}
      if(other.mediaSha256===candidate.mediaSha256 || other.contentFingerprint===fingerprint(candidate))
        return {status:'blocked',issues:['creative-already-reserved-or-uncertain']};
      if(Number.isFinite(other.publishAt)&&Math.abs(other.publishAt-Date.parse(candidate.publicationDate.dateTime+'-04:00'))<4*3600000)
        return {status:'blocked',issues:['other-studio-worker-reserved-close-slot']};
    }
    const key=sha(CHANNEL+'|'+candidate.mediaSha256);
    const ledger=path.join(dir,key+'.reserve.json');
    let record;
    try {record=await fs.open(ledger,'wx',0o600);}
    catch(e){if(e.code==='EEXIST')return {status:'blocked',issues:['creative-already-reserved-or-uncertain']};throw e;}
    await record.writeFile(json({status:'reserved-uncertain',channelId:CHANNEL,mediaSha256:candidate.mediaSha256,
      contentFingerprint:fingerprint(candidate),publishAt:Date.parse(candidate.publicationDate.dateTime+'-04:00'),
      title:candidate.youtubeData.title,createdAt:new Date(now()).toISOString()}));
    await record.sync();await record.close();
    const receipt={channelId:CHANNEL,title:candidate.youtubeData.title,
      description:candidate.text,mediaPath:path.resolve(candidate.localMediaPath),
      mediaSha256:candidate.mediaSha256,createdAt:new Date(now()).toISOString(),
      expiresAt:new Date(now()+15*60*1000).toISOString(),verified:true};
    await fs.writeFile(receiptPath,json(receipt),{flag:'wx',mode:0o600});
    return {status:'approved',receiptPath,expiresAt:receipt.expiresAt};
  } finally {
    await handle?.close();
    if(handle)await fs.unlink(lock).catch(()=>{});
  }
}
