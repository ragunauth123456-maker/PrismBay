import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'growth-reports/videos/toolkit-paid');
const id = 'executive-whitepaper-board-brief-promo';
export const offer = Object.freeze({
  name: 'Executive White Paper & Board Briefing System',
  amountUsd: 79,
  link: 'https://ragunauth123456-maker.github.io/PrismBay/toolkits.html#whitepaper',
  checkout: 'https://buy.stripe.com/bJe7sMgq25hNcCe6SAgnK0s',
  productType: 'Editable PDF, Excel and Word document system, not hosted AI software',
  included: ['PDF implementation guide', 'Excel claims and source workbook', 'Two editable Word templates', 'Instructions and internal-use license'],
});
export const scenes = [
  { label: 'THE RESEARCH PROBLEM', title: 'Strong opinions.\nWeak evidence?', rows: ['Build a clearer evidence trail.', 'Before the board meeting.'], caption: 'Better research starts with traceable sources.' },
  { label: 'STEP 01 / SOURCE REGISTER', title: 'Start with\nreliable sources.', rows: ['Record when and where.', 'Track who reviewed the claim.'], caption: 'A reusable Excel register helps structure your work.' },
  { label: 'STEP 02 / CLAIMS CONTROL', title: 'Facts. Estimates.\nAssumptions.', rows: ['Keep them distinguishable.', 'Track every material claim.'], caption: 'Editable Excel evidence and claims ledger.' },
  { label: 'STEP 03 / WRITING', title: 'Draft the paper.\nBrief the board.', rows: ['Editable white paper template', 'Editable board brief template'], caption: 'You provide the analysis. Our Word templates add structure.' },
  { label: 'WHAT IS INCLUDED', title: 'Real editable\nworking files.', rows: ['1 PDF implementation guide', '1 Excel evidence workbook', '2 Word document templates'], caption: 'Verified existing ZIP with instructions and a license.' },
  { label: 'PRISMBAY / OWN-BRAND PROMO', title: 'One-time $79.\nNot a subscription.', rows: ['Secure existing Stripe checkout', 'ZIP download after payment'], caption: 'See the product in the description. Documents, not AI software.' },
];
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
function command(bin, args) {
  const p = spawnSync(bin, args, { cwd: output, windowsHide: true, encoding: 'utf8', maxBuffer: 9e6 });
  if (p.error || p.status !== 0) throw new Error((p.error?.message || p.stderr || 'FFmpeg command failed').slice(-4000));
  return p.stdout;
}
const time = secs => String(Math.floor(secs/3600)).padStart(2,'0')+':'+String(Math.floor(secs/60)%60).padStart(2,'0')+':'+String(secs%60).padStart(2,'0')+',000';
export function verifyMedia(probe) {
  const video = probe.streams?.find(s=>s.codec_type === 'video');
  const duration = Number(probe.format?.duration), bytes = Number(probe.format?.size);
  if (!video || video.width!==1080 || video.height!==1920 || video.codec_name!=='h264' || video.pix_fmt!=='yuv420p' || !Number.isFinite(duration) || duration<29 || duration>31 || bytes<50000 || bytes>10000000 || probe.streams.some(s=>s.codec_type==='audio'))
    throw Error('Vertical media QA failed');
  return { durationSeconds:duration, bytes };
}
function wrap(sentence,max=42) {
  const lines=[''];
  for(const word of sentence.split(' ')){
    const i=lines.length-1;
    if((lines[i]+' '+word).trim().length>max) lines.push(word);
    else lines[i]=(lines[i]+' '+word).trim();
  }
  return lines.join('\n');
}
export async function render(){
  await fs.mkdir(output, {recursive:true});
  const ffmpegVersion = command('ffmpeg',['-version']).split('\n')[0];
  command('ffprobe',['-version']);
  const windir=process.env.WINDIR || 'C:/Windows';
  await fs.copyFile(path.join(windir,'Fonts/arial.ttf'),path.join(output,'font.ttf'));
  await fs.copyFile(path.join(windir,'Fonts/arialbd.ttf'),path.join(output,'bold.ttf'));
  const filters=['drawbox=x=0:y=0:w=1080:h=1920:color=0x0b1325:t=fill',
    'drawbox=x=72:y=210:w=8:h=1330:color=0x67e8ce:t=fill'];
  let number=0;
  async function writeText(message,x,y,size,color,enabled,bold=false){
    const file='scene-'+String(number++).padStart(3,'0')+'.txt';
    await fs.writeFile(path.join(output,file),message,'utf8');
    filters.push('drawtext=fontfile='+(bold?'bold.ttf':'font.ttf')+':textfile='+file+':expansion=none:fontsize='+size+':fontcolor='+color+':x='+x+':y='+y+':line_spacing=20'+(enabled?":enable='"+enabled+"'":''));
  }
  await writeText('PRISMBAY AI    /    EXECUTIVE RESEARCH',112,154,27,'0x67e8ce','');
  await writeText('OWN BRAND / PAID DOCUMENT RESOURCE',112,1556,26,'0x67e8ce','');
  await writeText('REAL TEMPLATES    /    LINK IN DESCRIPTION',112,1608,25,'0xc9dbe9','');
  let elapsed=0;
  const captions=[];
  for(let index=0;index<scenes.length;index++){
    const scene=scenes[index],end=elapsed+5;
    const enabled='gte(t,'+elapsed+')*lt(t,'+end+')';
    await writeText(String(index+1).padStart(2,'0')+' / '+scene.label,112,276,24,'0x67e8ce',enabled);
    await writeText(scene.title,112,389,61,'0xffffff',enabled,true);
    filters.push("drawbox=x=111:y=665:w=843:h=555:color=0x183047:t=fill:enable='"+enabled+"'");
    for(let j=0;j<scene.rows.length;j++)await writeText(scene.rows[j],145,731+j*102,34,'0xe9f4fa',enabled);
    await writeText(wrap(scene.caption),112,1293,30,'0xc0d6e3',enabled);
    filters.push("drawbox=x=112:y=1492:w="+Math.round(843*(index+1)/scenes.length)+":h=9:color=0x67e8ce:t=fill:enable='"+enabled+"'");
    captions.push(String(index+1)+'\n'+time(elapsed)+' --> '+time(end)+'\n'+scene.title.replaceAll('\n',' ')+'\n'+scene.rows.join('\n')+'\n'+scene.caption+'\n');
    elapsed=end;
  }
  await fs.writeFile(path.join(output,id+'.filter'),filters.join(','));
  command('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','lavfi','-i','color=c=0x0b1325:s=1080x1920:r=30:d='+elapsed,'-/filter:v',id+'.filter','-an','-c:v','libx264','-preset','fast','-crf','23','-maxrate','1800k','-bufsize','3600k','-pix_fmt','yuv420p','-movflags','+faststart',id+'.mp4']);
  const probe=JSON.parse(command('ffprobe',['-v','error','-show_streams','-show_format','-of','json',id+'.mp4']));
  const verified=verifyMedia(probe);
  await fs.writeFile(path.join(output,id+'.srt'),captions.join('\n'));
  command('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss','1','-i',id+'.mp4','-frames:v','1','preview-first.png']);
  command('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss','27','-i',id+'.mp4','-frames:v','1','preview-last.png']);
  const bytes=await fs.readFile(path.join(output,id+'.mp4'));
  const manifest={
    createdAt:new Date().toISOString(),ownerChannel:'PrismBay AI',videoId:id,offer,
    status:'Rights and factual review pending social scheduler verification',
    publishingPermission:'Own-brand promotional content, not third-party sponsorship',
    media:{...verified,sha256:sha256(bytes)},
    verifiedFacts:'Connected PrismBay Stripe active offer at $79, Floot live digital delivery GET 125317-byte valid six-file ZIP, existing payment-link post-purchase redirect; a live paid test transaction has not been performed.',
    rights:{visuals:'Original branded typography and geometric shapes only',fonts:'Windows Arial rasterized; font binaries remain local and ignored',audio:'None; no third-party music or voice'},
    caveats:['Editable professional document system, not hosted AI software','No claimed customer results','The reusable download URL is not order-bound yet'],
    ffmpegVersion
  };
  await fs.writeFile(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2));
  console.log(JSON.stringify({output:path.join(output,id+'.mp4'),videoId:id,...verified,sha256:manifest.media.sha256,manifest:path.join(output,'manifest.json')}));
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) await render();
