import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { ROOT, readQueue, render } from './render-viral-videos.mjs';

async function contained(root, target) {
  const resolved = await fs.realpath(target);
  const relative = path.relative(root, resolved);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error('Video queue path escapes local state');
  }
  return resolved;
}

async function validManifest(manifest, items, root, output) {
  if (manifest?.localOnly !== true || manifest.publicationEnabled !== false || manifest.posts?.length !== 3) return false;
  for (const [index, post] of manifest.posts.entries()) {
    if (post.slug !== items[index].slug || post.product !== items[index].product ||
        post.status !== 'awaiting_tiktok_authorization' || post.publishable !== false ||
        post.mediaRightsCheck?.required !== true || post.mediaRightsCheck.status !== 'pending') return false;
    if (typeof post.mediaPath !== 'string' || path.isAbsolute(post.mediaPath) || !post.mediaPath.endsWith('.mp4')) return false;
    const file = await contained(output, path.resolve(root, post.mediaPath));
    const stat = await fs.stat(file);
    if (!stat.isFile() || stat.size === 0) return false;
  }
  return new Set(manifest.posts.map(post => post.mediaPath)).size === 3;
}

// Dependencies are injectable for deterministic tests; the CLI uses only fixed local paths.
export async function renderQueue({ root = ROOT, renderVideo = render, logger = console } = {}) {
  try {
    root = await fs.realpath(root);
    const reports = await contained(root, path.join(root, 'growth-reports'));
    const outputPath = path.join(reports, 'videos');
    await fs.mkdir(outputPath, { recursive: true });
    const output = await contained(root, outputPath);
    const queue = await contained(root, path.join(reports, 'viral-content-queue.json'));
    const items = readQueue(JSON.parse((await fs.readFile(queue, 'utf8')).replace(/^\uFEFF/, '')));
    const fingerprint = createHash('sha256').update(JSON.stringify(items.map(({ slug, product }) => [slug, product]))).digest('hex');
    const statePath = path.join(output, 'queue-state.json');
    try {
      const state = JSON.parse(await fs.readFile(await contained(output, statePath), 'utf8'));
      if (state.fingerprint === fingerprint && await validManifest(state.manifest, items, root, output)) {
        logger.log('Video queue unchanged; three local drafts exist.');
        return { status: 'skipped', fingerprint };
      }
    } catch { /* Missing, stale or invalid cache is retried. */ }
    // Freeze the ranked input so a concurrent refresh cannot change what is rendered.
    // Retained as the manifest's local fact source.
    const snapshot = await fs.mkdtemp(path.join(output, 'queue-'));
    const input = path.join(snapshot, 'input.json');
    await fs.writeFile(input, JSON.stringify({ items: items.map(item => ({ ...item, channel: 'tiktok', format: 'short-video' })) }));
    const manifest = await renderVideo({ queue: input, count: 3 });
    if (!await validManifest(manifest, items, root, output)) throw new Error('Renderer returned invalid or unsafe drafts');
    const temporary = path.join(snapshot, 'state.json');
    await fs.writeFile(temporary, JSON.stringify({ schemaVersion: 1, fingerprint, manifest }, null, 2) + '\n');
    await fs.rename(temporary, statePath);
    logger.log('Video queue rendered: three local drafts; publication disabled.');
    return { status: 'rendered', fingerprint };
  } catch (error) {
    logger.warn(`WARNING: video queue skipped: ${error.message}`);
    return { status: 'warning' };
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await renderQueue();
}
