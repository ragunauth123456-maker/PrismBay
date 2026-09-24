import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {videos, metadata, channelId} from './revenue-ai-content.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'growth-reports/videos/revenue-ai');
function run(bin,args,cwd=out) { const r=spawnSync(bin,args,{cwd,encoding:'utf8',windowsHide:true,maxBuffer:8e6}); if(r.error||r.status!==0) throw new Error(r.error?.message||r.stderr); return r.stdout; }
export function verifyProbe(p) { const s=p.streams?.find(s=>s.codec_type==='video'); const d=Number(p.format?.duration); if(!s||s.width!==1080||s.height!==1920||s.codec_name!=='h264'||s.pix_fmt!=='yuv420p'||!Number.isFinite(d)||d<15||d>35||Number(p.format.size)>10_000_000) throw Error('Invalid media'); return d; }
const hash=b=>createHash('sha256').update(b).digest('hex');
const stamp=n=>`${String(Math.floor(n/3600)).padStart(2,'0')}:${String(Math.floor(n/60)%60).padStart(2,'0')}:${String(n%60).padStart(2,'0')},000`;
export async function render() {
 await fs.mkdir(out,{recursive:true});
 const ffmpeg=process.env.FFMPEG_PATH||'ffmpeg'; const ffprobe=process.env.FFPROBE_PATH||'ffprobe';
 const version=run(ffmpeg,['-version']).split('\n')[0]; run(ffprobe,['-version']);
 await fs.copyFile(path.join(process.env.WINDIR||'C:/Windows','Fonts/arial.ttf'),path.join(out,'font.ttf'));
 await fs.copyFile(path.join(process.env.WINDIR||'C:/Windows','Fonts/arialbd.ttf'),path.join(out,'bold.ttf'));
 const outputs=[];
 for(const video of videos) {
  let elapsed=0; const cues=[]; const filters=[];
  filters.push('drawbox=x=0:y=0:w=1080:h=1920:color=0x0b1325:t=fill','drawbox=x=72:y=210:w=8:h=1320:color=0x67e8ce:t=fill');
  let id=0;
  async function text(txt,x,y,size,color='0xffffff',enable='',bold=false) {
   const f=`${video.id}-${id++}.txt`; await fs.writeFile(path.join(out,f),txt);
   filters.push(`drawtext=fontfile=${bold?'bold':'font'}.ttf:textfile=${f}:expansion=none:fontsize=${size}:fontcolor=${color}:x=${x}:y=${y}:line_spacing=20${enable?`:enable='${enable}'`:''}`);
  }
  await text('PRISMBAY AI   /   FIELD NOTES',112,155,30,'0x67e8ce');
  await text('DOCUMENT BLUEPRINT / NOT SOFTWARE',112,1535,29,'0x67e8ce');
  await text('DRAFT / DELIVERY UNVERIFIED',112,1590,26,'0xa9b7d0');
  for(const [i,s] of video.scenes.entries()) {
   const end=elapsed+s.seconds; const enable=`gte(t,${elapsed})*lt(t,${end})`;
   await text(`${String(i+1).padStart(2,'0')}  /  ${s.label}`,112,280,25,'0x67e8ce',enable);
   await text(s.title,112,385,64,'0xffffff',enable,true);
   filters.push(`drawbox=x=108:y=650:w=842:h=560:color=0x18263d:t=fill:enable='${enable}'`);
   for(const [j,row] of s.rows.entries()) await text(row,142,710+j*108,37,'0xe8edf8',enable);
   // Short captions split at word boundaries for a mobile-safe width.
   const words=s.caption.split(' ');const lines=[''];for(const w of words){const n=lines.length-1;if((lines[n]+' '+w).trim().length>43)lines.push(w);else lines[n]=(lines[n]+' '+w).trim();}
   await text(lines.join('\n'),112,1290,33,'0xa9b7d0',enable);
   filters.push(`drawbox=x=112:y=1480:w=${Math.round(838*(i+1)/video.scenes.length)}:h=7:color=0x67e8ce:t=fill:enable='${enable}'`);
   cues.push(`${i+1}\n${stamp(elapsed)} --> ${stamp(end)}\n${s.label}\n${s.title.replaceAll('\n',' ')}\n${s.rows.join('\n')}\n${s.caption}\nDocument blueprint, not software.\n`);elapsed=end;
  }
  await fs.writeFile(path.join(out,`${video.id}.filter`),filters.join(','));
  run(ffmpeg,['-hide_banner','-loglevel','error','-y','-f','lavfi','-i',`color=c=0x0b1325:s=1080x1920:r=30:d=${elapsed}`,'-/filter:v',`${video.id}.filter`,'-an','-c:v','libx264','-preset','fast','-crf','23','-maxrate','1800k','-bufsize','3600k','-pix_fmt','yuv420p','-movflags','+faststart',`${video.id}.mp4`]);
  const probe=JSON.parse(run(ffprobe,['-v','error','-show_streams','-show_format','-of','json',`${video.id}.mp4`]));
  const duration=verifyProbe(probe); await fs.writeFile(path.join(out,`${video.id}.probe.json`),JSON.stringify(probe,null,2));
  await fs.writeFile(path.join(out,`${video.id}.srt`),cues.join('\n'));
  run(ffmpeg,['-hide_banner','-loglevel','error','-y','-ss','5','-i',`${video.id}.mp4`,'-frames:v','1',`${video.id}-review.png`]);
  const bytes=await fs.readFile(path.join(out,`${video.id}.mp4`));
  outputs.push({...metadata(video),path:path.join(out,`${video.id}.mp4`),durationSeconds:duration,bytes:bytes.length,sha256:hash(bytes)});
 }
 // Original typographic cover extracted from the composed opening frame; no third-party imagery.
 run(ffmpeg,['-hide_banner','-loglevel','error','-y','-i','vendor-risk.mp4','-frames:v','1','thumbnail.png']);
 const manifest={createdAt:new Date().toISOString(),host:os.hostname(),channelId,channelIdentity:'PrismBay AI (user verified)',publishingAllowed:false,deliveryStatus:'UNVERIFIED',blockers:['No original downloadable product ZIP/PDF available in worktree','Storage points to /home/team/shared/product-repos; deployed contents unverified','Hosted Stripe link fulfillment not proven; webhook expects pre-existing order','Public page shows $249 but also expired launch-pricing language; recheck checkout'],rights:{visuals:'Original text, geometric composition and illustrative examples authored for this task; no external imagery',fonts:'Locally installed Windows Arial rasterized by FFmpeg; font files stay ignored locally',audio:'Silent; no music, voice, or third-party audio',existingAssets:'Catalog images and demo webm files not reused; provenance not established'},facts:{price:'249 USD in products.ts, payment-links.ts and public page on 2026-09-24; not checkout-verified',scope:'Document blueprint; no working software or implementation',example:'Original educational interpretation of supplier comparison, vendor-risk assessment and duplicate-charge detection; not a verified package excerpt',story:'First person refers only to the worked example performed on screen, not a biography, purchase, or customer result'},sources:['src/data/products.ts','src/data/payment-links.ts','src/data/previews.ts','src/lib/storage.ts','src/routes/api/webhooks/stripe.ts','https://www.prismbayai.com/products/spendshield-ai'],ffmpeg:version,outputs};
 const artifacts=[];for(const name of await fs.readdir(out)){if(/\.(mp4|png|srt)$/.test(name)){const b=await fs.readFile(path.join(out,name));artifacts.push({name,bytes:b.length,sha256:hash(b)});}}
 manifest.artifacts=artifacts;
 await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2));
 await fs.writeFile(path.join(out,'post-metadata.json'),JSON.stringify(outputs.map(({path,sha256,bytes,durationSeconds,...m})=>m),null,2));
 console.log(JSON.stringify(outputs,null,2));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) await render();
