import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {CHANNEL,BRAND,audit} from './youtube-publishing-guard.mjs';
import {prepareStudio} from './youtube-publishing-gateway.mjs';
export async function preflight({mode,candidatePath,snapshotPath,receiptPath}) {
  if(!['audit','studio'].includes(mode) || !snapshotPath)throw Error('Usage: --audit SNAPSHOT or --studio CANDIDATE SNAPSHOT RECEIPT');
  const snapshot=JSON.parse(await fs.readFile(snapshotPath,'utf8'));
  if(String(snapshot?.brandSettings?.id)!==BRAND || snapshot?.brandSettings?.networksData?.youtubeData!==CHANNEL)
    return {status:'blocked',issues:['wrong-connected-brand-or-channel']};
  if(!Array.isArray(snapshot.queue) || !Array.isArray(snapshot.published) ||
    !Number.isFinite(Date.parse(snapshot.fetchedAt)) ||
    Math.abs(Date.now()-Date.parse(snapshot.fetchedAt))>120000)
    return {status:'blocked',issues:['stale-or-incomplete-authenticated-snapshot']};
  if(mode==='audit') {
    const result=audit([...snapshot.queue,...snapshot.published],CHANNEL);
    return {status:result.issues.length?'blocked':'verified',...result};
  }
  if(!candidatePath || !receiptPath)throw Error('Candidate and private receipt paths are required');
  const candidate=JSON.parse(await fs.readFile(candidatePath,'utf8'));
  return prepareStudio({candidate,snapshot,receiptPath});
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const [, ,flag,...paths]=process.argv;
  try {
    const mode=flag==='--studio'?'studio':flag==='--audit'?'audit':null;
    const args=mode==='audit'?{mode,snapshotPath:paths[0]}:
      {mode,candidatePath:paths[0],snapshotPath:paths[1],receiptPath:paths[2]};
    const result=await preflight(args);console.log(JSON.stringify(result,null,2));
    if(result.status==='blocked')process.exitCode=2;
  } catch(e){console.error('YouTube preflight blocked: '+e.message);process.exitCode=2;}
}
