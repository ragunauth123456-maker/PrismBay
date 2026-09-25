import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const target=process.env.PRISMBAY_STUDIO_DIR || 'C:\\Users\\Fano Faizul\\PrismBayAI';
const CHANNEL='UCw2hs85TzIpdKwJtG-BSxzQ';
const files={
  'youtube_open_upload.py':'open',
  'youtube_attach_file.py':'attach',
  'youtube_attach_permissions.py':'attach',
  'youtube_set_metadata.py':'metadata',
  'youtube_set_permissions_metadata.py':'metadata',
  'youtube_publish_current.py':'publish'
};
const marker='# PRISMBAY-AI-STUDIO-GUARD: installed; never bypass preflight';
const fail=message=>{throw Error(message);};
export function patchSource(source,name) {
  if(!Object.hasOwn(files,name))fail('Unexpected script');
  const stage=files[name];
  if(source.includes(marker)) {
    const required={open:['receipt=require_gate("open")'],attach:['receipt=require_gate("attach", FILE)'],
      metadata:['receipt=require_gate("metadata")','TITLE=receipt["title"]','DESC=receipt["description"]'],
      publish:['receipt=require_gate("publish")','assert_current_metadata(t, receipt)']};
    if(!source.includes('assert_studio_tab(t)') || required[stage].some(s=>!source.includes(s)))
      fail(name+' has an incomplete or tampered publishing guard');
    return source;
  }
  if(!source.includes('import pychrome'))fail(name+' lacks expected pychrome import');
  const imports=marker+'\nfrom youtube_studio_gate import require_gate, assert_studio_tab, assert_current_metadata\n';
  source=imports+source;
  if(stage==='open'||stage==='publish')source=source.replace(
    /(^import pychrome[^\n]*\n)/m,'$1receipt=require_gate('+JSON.stringify(stage)+')\n');
  if(stage==='attach') {
    if(!/^FILE=r["'][^\n]*$/m.test(source))fail(name+' media declaration missing');
    source=source.replace(/(^FILE=r["'][^\n]*\n)/m,'$1receipt=require_gate("attach", FILE)\n');
  }
  if(stage==='metadata') {
    if(!/^DESC=[^\n]*$/m.test(source))fail(name+' description declaration missing');
    source=source.replace(/(^DESC=[^\n]*\n)/m,'$1receipt=require_gate("metadata")\nTITLE=receipt["title"]\nDESC=receipt["description"]\n');
  }
  if(stage==='open')source=source.replace('"studio.youtube.com/channel/"','"studio.youtube.com/channel/'+CHANNEL+'"');
  if(!source.includes('studio.youtube.com/channel/'+CHANNEL))fail(name+' channel identity not fixed');
  if(source.includes('t=tabs[0]'))source=source.replace('t=tabs[0]','t=tabs[0]\nassert_studio_tab(t)');
  else if(/^t=\[x for x in b\.list_tab\(\).*?\]\[0\]$/m.test(source))
    source=source.replace(/(^t=\[x for x in b\.list_tab\(\).*?\]\[0\]\n)/m,'$1assert_studio_tab(t)\n');
  else fail(name+' tab selection changed; refusing blind patch');
  if(stage==='publish') {
    if(!source.includes('t.start(); t.Runtime.enable()'))fail('Publish metadata-check insertion point changed');
    source=source.replace('t.start(); t.Runtime.enable()','t.start(); t.Runtime.enable()\nassert_current_metadata(t, receipt)');
    if(!source.includes("print('publish',click_text('Publish')"))fail('Unrecognized publish entry point');
  }
  return source;
}
export async function install({dir=target,check=false}={}) {
  const gate=await fs.readFile(path.join(root,'youtube_studio_gate.py'),'utf8');
  const changes=[];
  const patched=[];
  for(const name of Object.keys(files)){
    const existing=await fs.readFile(path.join(dir,name),'utf8');
    const proposed=patchSource(existing,name);
    if(!proposed.includes('assert_studio_tab(t)')||!proposed.includes('require_gate('))
      fail(name+' missing a required guard');
    patched.push({name,existing,proposed});
    if(existing!==proposed)changes.push(name);
  }
  let targetGate=null;
  try{targetGate=await fs.readFile(path.join(dir,'youtube_studio_gate.py'),'utf8');}catch(e){if(e.code!=='ENOENT')throw e;}
  if(check)return {status:changes.length||gate!==targetGate?'needs-install':'verified',changes,gateMatches:gate===targetGate};
  const backup=path.join(dir,'.publish-gate','backups');
  await fs.mkdir(backup,{recursive:true,mode:0o700});
  for(const f of patched)if(f.existing!==f.proposed){
    await fs.writeFile(path.join(backup,f.name+'.before-publishing-guard'),f.existing,{flag:'wx'}).catch(e=>{if(e.code!=='EEXIST')throw e;});
    await fs.writeFile(path.join(dir,f.name),f.proposed);
  }
  await fs.writeFile(path.join(dir,'youtube_studio_gate.py'),gate);
  return {status:'installed',changes,gateMatches:true};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{const result=await install({check:process.argv.includes('--check')});
    console.log(JSON.stringify(result,null,2));if(result.status==='needs-install')process.exitCode=2;}
  catch(e){console.error('YouTube Studio gate installation failed closed: '+e.message);process.exitCode=2;}
}
