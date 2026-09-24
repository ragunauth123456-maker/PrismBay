import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const STOREFRONT = 'https://prismbay-clean-49izhg.v2.appdeploy.ai/tiktok/';
// Explicit approval boundary, matching viral-product-engine.mjs. New products require review here.
export const APPROVED = Object.freeze({
  scrubber: '5-in-1 Electric Spin Scrubber', 'garment-steamer': 'Portable Garment Steamer',
  'mattress-vacuum': 'Mattress Vacuum', 'pressure-washer': 'Cordless Pressure Washer',
  pethair: 'Reusable Pet Hair Remover', crevice: '3-in-1 Crevice Cleaning Brush',
  'mini-mop': 'Self-Squeeze Mini Mop', 'drain-catcher': 'Sink Drain Catcher 2-Pack',
  'home-caddy': 'Portable Home Caddy',
});

export function readQueue(data, count = 3) {
  if (!Number.isInteger(count) || count < 1 || count > 3) throw new Error('count must be 1–3');
  if (!data || !Array.isArray(data.items)) throw new Error('Queue must contain items array');
  const seen = new Set();
  const items = data.items.filter(item => {
    if (!item || item.approved === false || ['rejected', 'pending', 'revoked'].includes(item.status)) return false;
    if (!Object.hasOwn(APPROVED, item.slug) || APPROVED[item.slug] !== item.product) return false;
    if (item.channel !== 'tiktok' || item.format !== 'short-video') return false;
    if (!Number.isSafeInteger(item.rank) || item.rank < 1) throw new Error('Invalid queue rank');
    if (seen.has(item.slug)) throw new Error('Duplicate approved product');
    seen.add(item.slug);
    return true;
  }).sort((a, b) => a.rank - b.rank || a.slug.localeCompare(b.slug));
  if (items.length < count) throw new Error(`Need ${count} approved products; found ${items.length}`);
  return items.slice(0, count).map(({ slug, product, rank }) => ({ slug, product, rank }));
}

export function captionFor(item) {
  if (!Object.hasOwn(APPROVED, item.slug) || APPROVED[item.slug] !== item.product) throw new Error('Unapproved product');
  return `Ad | PrismBay Clean promotion. Meet the ${item.product}. See product details at the PrismBay Clean TikTok storefront: ${STOREFRONT} #PrismBayClean #HomeProducts #Ad`;
}

// Text never enters filter syntax: UTF-8 textfiles + expansion=none preserve %, quotes and backslashes.
export function wrapText(text, width = 21) {
  const words = text.split(/\s+/); const lines = [''];
  for (const word of words) {
    if (word.length > width) throw new Error('Text has an oversized word');
    const last = lines.length - 1;
    if ((lines[last] + ' ' + word).trim().length > width) lines.push(word);
    else lines[last] = (lines[last] + ' ' + word).trim();
  }
  return lines.join('\n');
}

function run(binary, args, cwd) {
  const result = spawnSync(binary, args, { cwd, shell: false, windowsHide: true, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  if (result.error || result.status !== 0) throw new Error(`${path.basename(binary)} failed: ${result.error?.message || result.stderr}`);
  return result.stdout;
}

export function verifyProbe(probe) {
  const video = probe.streams?.find(s => s.codec_type === 'video');
  const duration = Number(probe.format?.duration);
  if (!video || video.width !== 1080 || video.height !== 1920 || video.codec_name !== 'h264' || video.pix_fmt !== 'yuv420p' || !Number.isFinite(duration) || duration < 12 || duration > 20) throw new Error('Rendered video failed verification');
  return { width: video.width, height: video.height, codec: video.codec_name, pixelFormat: video.pix_fmt, durationSeconds: duration };
}

async function localFile(value) {
  const absolute = await fs.realpath(path.resolve(ROOT, value));
  const relative = path.relative(ROOT, absolute);
  if (relative.startsWith('..') || path.isAbsolute(relative) || !(await fs.stat(absolute)).isFile()) throw new Error('Input must be a local file inside this worktree');
  return absolute;
}

export async function render(options = {}) {
  const count = Number(options.count ?? 3);
  const queuePath = await localFile(options.queue ?? 'growth-reports/viral-content-queue.json');
  const items = readQueue(JSON.parse((await fs.readFile(queuePath, 'utf8')).replace(/^\uFEFF/, '')), count);
  const ffmpeg = options.ffmpeg || process.env.FFMPEG_PATH || 'ffmpeg';
  const ffprobe = options.ffprobe || process.env.FFPROBE_PATH || 'ffprobe';
  // Resolve executable paths before changing child cwd. Bare executable names use PATH.
  const executable = value => /[\\/]/.test(value) ? path.resolve(value) : value;
  const encoder = executable(ffmpeg); const probeBin = executable(ffprobe);
  run(encoder, ['-version'], ROOT); run(probeBin, ['-version'], ROOT);
  const font = options.font || (process.platform === 'win32' ? path.join(process.env.WINDIR || 'C:/Windows', 'Fonts', 'arialbd.ttf') : '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf');
  const photoMap = options.photos ? JSON.parse(await fs.readFile(await localFile(options.photos), 'utf8')) : {};
  const photos = {};
  for (const item of items) {
    const photo = photoMap[item.slug];
    if (!photo) continue;
    if (photo.authorized !== true || typeof photo.rightsEvidence !== 'string' || !photo.rightsEvidence.trim()) throw new Error(`Photo for ${item.slug} requires authorization and rightsEvidence`);
    if (!/\.(png|jpe?g)$/i.test(photo.path || '')) throw new Error('Photos must be local PNG/JPEG files');
    photos[item.slug] = { ...photo, absolute: await localFile(photo.path) };
  }
  const output = path.join(ROOT, 'growth-reports/videos');
  await fs.mkdir(output, { recursive: true });
  const work = await fs.mkdtemp(path.join(output, 'render-'));
  // Only generated ASCII basenames enter ffmpeg filters. Windows drive colons, apostrophes,
  // commas and spaces in user paths stay in spawn argv or fs calls, never filter expressions.
  await fs.copyFile(path.resolve(font), path.join(work, 'font.ttf'));
  const posts = [];
  const palettes = [['0x101e30', '0x70ead5'], ['0x241c39', '0xffc899'], ['0x132d2c', '0xc6e88b']];
  for (const [index, item] of items.entries()) {
    const [background, accent] = palettes[index];
    const photo = photos[item.slug];
    const filters = [];
    let textIndex = 0;
    async function text(value, size, y, color = 'white', enable = '1') {
      const name = `text-${index}-${textIndex++}.txt`;
      await fs.writeFile(path.join(work, name), value, 'utf8');
      filters.push(`drawtext=fontfile=font.ttf:textfile=${name}:expansion=none:fontsize=${size}:fontcolor=${color}:x=90:y=${y}:line_spacing=22:enable='${enable}'`);
    }
    filters.push(`drawgrid=w=120:h=120:t=1:c=white@0.035`, `drawbox=x=70:y=330:w=830:h=1050:color=white@0.035:t=fill`);
    // Original abstract graphic: a drifting prism, not a product illustration or demonstration.
    await text(' / ', 400, '980+35*sin(t*0.7)', `${accent}@0.18`);
    await text('PRISMBAY / CLEAN', 34, 195, accent);
    await text('AD • PRISMBAY PROMOTION', 27, 265);
    await text('THE PRODUCT EDIT', 30, 385, accent);
    await text('Meet the', 44, 475, 'white', 'lt(t,5)');
    await text(wrapText(item.product, 18), 68, 555, 'white', 'lt(t,5)');
    await text('A closer look\nstarts with\nthe details.', 70, 490, 'white', 'between(t,5,10)');
    await text('Explore the listing.\nCheck the specifications.', 34, 835, accent, 'between(t,5,10)');
    await text('Find your next\nhome essential.', 65, 490, 'white', 'gte(t,10)');
    await text('Visit PrismBay Clean\nTikTok storefront', 42, 725, accent, 'gte(t,10)');
    await text('Storefront URL in caption', 32, 865, 'white', 'gte(t,10)');
    await text(photo ? 'Authorized photo • See listing details' : 'Product spotlight • Typography edition', 28, 1430);
    await text('Explore. Compare. Choose.', 32, 1500, accent);
    filters.push(`drawbox=x=90:y=1580:w=780:h=5:color=white@0.2:t=fill`, `drawbox=x=90:y=1580:w=780:h=5:color=${accent}:t=fill:enable='gte(t,10)'`, 'fade=t=in:d=0.3');
    const args = ['-hide_banner', '-loglevel', 'error', '-nostdin', '-y', '-f', 'lavfi', '-i', `color=c=${background}:s=1080x1920:r=30:d=15`];
    if (photo) {
      const photoName = `photo-${index}${path.extname(photo.path).toLowerCase()}`;
      await fs.copyFile(photo.absolute, path.join(work, photoName));
      args.push('-loop', '1', '-i', photoName);
    }
    const graph = photo
      ? `[0:v]${filters.join(',')}[bg];[1:v]scale=680:340:force_original_aspect_ratio=decrease,setsar=1[p];[bg][p]overlay=x=(W-w)/2:y=1020:shortest=1[v]`
      : `[0:v]${filters.join(',')}[v]`;
    const graphName = `filter-${index}.txt`;
    await fs.writeFile(path.join(work, graphName), graph);
    const filename = `${index + 1}-${item.slug}.mp4`;
    console.log(`Rendering ${filename} (15s, 1080x1920)`);
    run(encoder, [...args, '-filter_complex', graph, '-map', '[v]', '-t', '15', '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', filename], work);
    const probe = JSON.parse(run(probeBin, ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', filename], work));
    const verification = verifyProbe(probe);
    await fs.writeFile(path.join(work, `${item.slug}.ffprobe.json`), JSON.stringify(probe, null, 2));
    posts.push({ id: `prismbay-${item.slug}`, product: item.product, slug: item.slug, channel: 'tiktok', status: 'awaiting_tiktok_authorization', publishable: false,
      mediaPath: path.relative(ROOT, path.join(work, filename)).replaceAll('\\', '/'), caption: captionFor(item), storefrontUrl: STOREFRONT,
      disclosure: 'Ad | PrismBay Clean promotion', mediaRightsCheck: { required: true, status: 'pending', source: photo ? 'authorized_local_photo_and_original_graphics' : 'original_typography_and_motion', rightsEvidence: photo?.rightsEvidence ?? null },
      requiredBeforePublishing: ['TikTok account authorization', 'Media and font rights review', 'Product facts and destination review', 'Enable platform promotional disclosure'],
      factSource: path.relative(ROOT, queuePath).replaceAll('\\', '/'), verification });
  }
  const manifest = { schemaVersion: 1, createdAt: new Date().toISOString(), localOnly: true, publicationEnabled: false, posts };
  const manifestPath = path.join(work, 'post-queue.json');
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Verified ${posts.length} videos. Queue: ${manifestPath}`);
  return manifest;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { values } = parseArgs({ options: Object.fromEntries(['count', 'queue', 'ffmpeg', 'ffprobe', 'font', 'photos'].map(key => [key, { type: 'string' }])) });
    await render(values);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
