import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'public/videos/prismbay-ai-free-vendor-risk-matrix-20260924.mp4');
function run(bin, args, cwd) {
  const p = spawnSync(bin, args, { cwd, encoding: 'utf8', windowsHide: true, maxBuffer: 2e6 });
  if (p.error || p.status !== 0) throw new Error((p.stderr || p.error?.message || 'FFmpeg failed').slice(-3000));
  return p.stdout;
}
export function validateProbe(p) {
  const v = p.streams?.find(s => s.codec_type === 'video');
  const d = Number(p.format?.duration), n = Number(p.format?.size);
  if (!v || v.width !== 1080 || v.height !== 1920 || v.codec_name !== 'h264' ||
      v.pix_fmt !== 'yuv420p' || d < 29 || d > 31 || n <= 0 || n > 10000000) throw Error('Unexpected output format');
  return { durationSeconds: d, bytes: n };
}
export function render(input) {
  if (!input || !fs.existsSync(input)) throw Error('Owner-created local educational draft required');
  const cwd = path.dirname(input);
  if (!['font.ttf', 'bold.ttf'].every(f => fs.existsSync(path.join(cwd, f)))) throw Error('Existing locally installed fonts required; never distribute font files');
  fs.writeFileSync(path.join(cwd, 'free-title.txt'), 'FREE AI VENDOR\nRISK MATRIX');
  fs.writeFileSync(path.join(cwd, 'free-description.txt'), 'Copy the free 10-question worksheet\nCompare evidence before price\nGet the link in the description');
  const base = ['-hide_banner', '-loglevel', 'error', '-y'];
  const box = 'drawbox=x=95:y=1505:w=925:h=185:color=0x0b1325:t=fill';
  const banner = "drawtext=fontfile=bold.ttf:text='FREE EDUCATIONAL EXAMPLE':fontsize=31:fontcolor=0x67e8ce:x=112:y=1540";
  const disclaimer = "drawtext=fontfile=font.ttf:text='FICTIONAL VENDORS / NO PAID OFFER':fontsize=24:fontcolor=white:x=112:y=1610";
  run('ffmpeg', [...base, '-i', input, '-t', '24', '-vf', [box, banner, disclaimer].join(','), '-an',
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-pix_fmt', 'yuv420p', 'free-body.mp4'], cwd);
  const slide = [
    'drawbox=x=75:y=200:w=10:h=1460:color=0x67e8ce:t=fill',
    'drawtext=fontfile=bold.ttf:text=PRISMBAY\\ AI:fontsize=32:fontcolor=0x67e8ce:x=112:y=200',
    'drawtext=fontfile=bold.ttf:textfile=free-title.txt:fontsize=64:fontcolor=white:x=112:y=440:line_spacing=25',
    'drawtext=fontfile=font.ttf:textfile=free-description.txt:fontsize=37:fontcolor=0x67e8ce:x=112:y=880:line_spacing=25',
    "drawtext=fontfile=font.ttf:text='NO PAYMENT OR SIGN-IN':fontsize=29:fontcolor=white:x=112:y=1440"
  ].join(',');
  run('ffmpeg', [...base, '-f', 'lavfi', '-i', 'color=c=0x0b1325:s=1080x1920:r=30:d=6',
    '-vf', slide, '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-pix_fmt', 'yuv420p', 'free-end.mp4'], cwd);
  run('ffmpeg', [...base, '-i', 'free-body.mp4', '-i', 'free-end.mp4', '-filter_complex',
    '[0:v][1:v]concat=n=2:v=1:a=0[v]', '-map', '[v]', '-an', '-c:v', 'libx264',
    '-preset', 'fast', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', output], cwd);
  const info = validateProbe(JSON.parse(run('ffprobe', ['-v','error','-show_streams','-show_format','-of','json',output],cwd)));
  const sha256 = createHash('sha256').update(fs.readFileSync(output)).digest('hex');
  console.log(JSON.stringify({ output, ...info, sha256, publication: 'free educational video; original example only' }));
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) render(process.argv[2]);
