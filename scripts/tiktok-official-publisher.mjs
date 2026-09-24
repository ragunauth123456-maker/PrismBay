import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { ROOT, APPROVED, verifyProbe } from './render-viral-videos.mjs';

const API = 'https://open.tiktokapis.com/v2/post/publish/';
const MAX = 64 * 1024 * 1024; // Deliberate single-chunk limit for these short local drafts.
const fail = message => { throw new Error(message); };
const hash = value => createHash('sha256').update(value).digest('hex');
export const approvalDigest = (post, sha256) => hash(JSON.stringify([post.id, post.slug, post.product, post.caption, sha256]));
async function local(root, name) {
  if (typeof name !== 'string' || !name.trim()) fail('Local manifest, approval or media path missing');
  const target = await fs.realpath(path.resolve(root, name));
  const rel = path.relative(root, target);
  if (rel.startsWith('..') || path.isAbsolute(rel)) fail('Path outside worktree');
  return target;
}
async function json(file) { return JSON.parse((await fs.readFile(file, 'utf8')).replace(/^\uFEFF/, '')); }
export function probeMedia(file) {
  const result = spawnSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file], { encoding: 'utf8', windowsHide: true, shell: false, maxBuffer: 8 * 1024 * 1024 });
  if (result.error || result.status !== 0) fail('Existing ffprobe required; media verification failed');
  const data = JSON.parse(result.stdout);
  if (!data.format?.format_name?.split(',').includes('mp4')) fail('MP4 container required');
  const v = data.streams?.find(s => s.codec_type === 'video');
  const [n, d] = String(v?.avg_frame_rate).split('/').map(Number);
  if (!(n / d >= 23 && n / d <= 60)) fail('Invalid frame rate');
  return verifyProbe(data);
}
function appChecks(a) {
  const blockers = [];
  if (a?.appApproved !== true || !a?.appApprovalEvidence) blockers.push('Approved developer app evidence required');
  if (a?.ownerAuthorized !== true || !Array.isArray(a?.grantedScopes) || !a.grantedScopes.includes('video.publish')) blockers.push('Owner OAuth video.publish grant required');
  return blockers;
}
export async function inspect({ root = ROOT, manifest, approval, id, probe = probeMedia }) {
  root = await fs.realpath(root);
  const blockers = [];
  let post, bytes, verification, digest, a;
  try { a = await json(await local(root, approval)); } catch { blockers.push('Local creator approval file missing or invalid'); }
  blockers.push(...appChecks(a));
  try {
    const m = await json(await local(root, manifest));
    if (m.schemaVersion !== 1 || m.localOnly !== true || m.publicationEnabled !== false || !Array.isArray(m.posts)) fail('Invalid local draft manifest');
    if (new Set(m.posts.map(p => p.id)).size !== m.posts.length) fail('Duplicate manifest IDs');
    post = m.posts.find(p => p.id === id);
    if (!post || post.channel !== 'tiktok' || APPROVED[post.slug] !== post.product || post.status !== 'awaiting_tiktok_authorization') fail('Unapproved queue entry');
    const source = await json(await local(root, post.factSource));
    if (!source.items?.some(p => p.slug === post.slug && p.product === post.product && p.channel === 'tiktok' && p.format === 'short-video' && p.approved !== false && !['pending', 'rejected', 'revoked'].includes(p.status))) fail('Product missing from approved fact source');
    if (typeof post.caption !== 'string' || !post.caption.trim() || post.caption.length > 2200) fail('Caption must contain 1–2200 UTF-16 units');
    const file = await local(root, post.mediaPath);
    const stat = await fs.stat(file);
    if (!stat.isFile() || path.extname(file).toLowerCase() !== '.mp4' || stat.size < 1 || stat.size > MAX) fail('MP4 must be 1 byte–64 MiB (single-chunk policy)');
    bytes = await fs.readFile(file);
    verification = await probe(file);
    // Hold these exact verified bytes through upload; reject edits during probing.
    if (hash(await fs.readFile(file)) !== hash(bytes)) fail('Media changed during verification');
    digest = approvalDigest(post, hash(bytes));
  } catch (e) { blockers.push(e.message); }
  const p = a?.post;
  if (!p || p.digest !== digest || !digest || p.creatorApproved !== true) blockers.push('Exact video/caption creator approval required');
  for (const field of ['rightsApproved', 'factsVerified', 'destinationVerified', 'previewReviewed', 'musicUsageConfirmed', 'contentGuidelinesReviewed']) {
    if (p?.[field] !== true) blockers.push(`${field} required`);
  }
  if (!p?.rightsEvidence || !p?.factsEvidence) blockers.push('Rights and product facts evidence required');
  if (p?.paidPromotion !== false || p?.post_info?.brand_content_toggle !== false) blockers.push('Paid/third-party promotion skipped');
  const info = p?.post_info;
  if (info?.title !== post?.caption || !info?.privacy_level || info.brand_organic_toggle !== true || typeof info.is_aigc !== 'boolean') blockers.push('Explicit caption, privacy, own-brand and AI declarations required');
  for (const key of ['disable_comment', 'disable_duet', 'disable_stitch']) if (typeof info?.[key] !== 'boolean') blockers.push(`Explicit ${key} required`);
  if (a?.appAudited !== true && info?.privacy_level !== 'SELF_ONLY') blockers.push('Unaudited apps require SELF_ONLY');
  if (a?.appAudited === true && !a.auditEvidence) blockers.push('Audit evidence required');
  const age = Date.now() - Date.parse(p?.approvedAt);
  if (!(age >= 0 && age <= 30 * 60 * 1000)) blockers.push('Creator consent must be within 30 minutes');
  return { blockers, post, bytes, verification, digest, approval: a };
}
async function request(fetchImpl, url, options) {
  try { return await fetchImpl(url, { ...options, redirect: 'error', signal: AbortSignal.timeout(120000) }); }
  catch { fail('Network request failed; do not retry an uncertain publication'); }
}
async function api(fetchImpl, token, endpoint, body = {}) {
  const r = await request(fetchImpl, API + endpoint, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json; charset=UTF-8' }, body: JSON.stringify(body) });
  if (!r.ok) fail(`TikTok HTTP ${r.status}; authorization or service check required`);
  let result;
  try { result = await r.json(); } catch { fail('Invalid TikTok response'); }
  if (result.error?.code !== 'ok' || !result.data) fail('TikTok rejected request (scope, permission, quota or service error)');
  return result.data;
}
export async function creatorInfo({ approval, env = process.env, fetchImpl = fetch }) {
  if (appChecks(approval).length) fail('Approved app and owner video.publish grant required');
  const token = env.TIKTOK_ACCESS_TOKEN;
  if (!token || /[\r\n]/.test(token)) fail('TIKTOK_ACCESS_TOKEN required');
  return api(fetchImpl, token, 'creator_info/query/');
}
export async function publish(options) {
  const { env = process.env, fetchImpl = fetch, dryRun = true, status = false } = options;
  const checked = await inspect(options);
  if (dryRun) {
    const blockers = [...checked.blockers, 'Environment enablement, OAuth token and live creator permissions intentionally not checked'];
    if (checked.post) {
      try {
        await fs.lstat(path.join(options.root ?? ROOT, 'growth-reports/videos/tiktok-publisher', `${hash(checked.post.id)}.json`));
        blockers.push('Duplicate video ID reserved in local ledger; upload will be skipped');
      } catch (e) { if (e.code !== 'ENOENT') blockers.push('Cannot inspect duplicate ledger'); }
    }
    return { status: 'dry-run', blockers, digest: checked.digest, bytes: checked.bytes?.length };
  }
  if (checked.blockers.length) return { status: 'blocked', blockers: checked.blockers };
  if (env.TIKTOK_PUBLISH_ENABLED !== 'OWNER_AUTHORIZED') fail('Publication environment gate disabled');
  const { post, approval: a, bytes, verification } = checked;
  const root = await fs.realpath(options.root ?? ROOT);
  const statePath = path.join(root, 'growth-reports/videos/tiktok-publisher');
  await fs.mkdir(statePath, { recursive: true });
  const state = await local(root, statePath);
  const ledger = path.join(state, `${hash(post.id)}.json`);
  try { await fs.lstat(ledger); return { status: 'duplicate-skipped' }; } catch (e) { if (e.code !== 'ENOENT') throw e; }
  const creator = await creatorInfo({ approval: a, env, fetchImpl });
  const info = a.post.post_info;
  if (creator.creator_username !== a.creatorUsername || !a.creatorUsername || !Array.isArray(creator.privacy_level_options) || !creator.privacy_level_options.includes(info.privacy_level)) fail('Creator identity or privacy mismatch');
  if (a.appAudited !== true && (creator.privacy_level_options.includes('PUBLIC_TO_EVERYONE') || !creator.privacy_level_options.includes('FOLLOWER_OF_CREATOR'))) fail('Unaudited app requires a private creator account');
  if (!(Number.isFinite(creator.max_video_post_duration_sec) && verification.durationSeconds <= creator.max_video_post_duration_sec)) fail('Creator duration limit invalid or exceeded');
  for (const key of ['comment', 'duet', 'stitch']) if (typeof creator[`${key}_disabled`] !== 'boolean' || (creator[`${key}_disabled`] && !info[`disable_${key}`])) fail('Creator interaction restriction mismatch');
  // Exclusive durable reservation BEFORE init. Uncertain requests remain blocked, including crashes.
  let handle;
  try { handle = await fs.open(ledger, 'wx', 0o600); } catch (e) { if (e.code === 'EEXIST') return { status: 'duplicate-skipped' }; throw e; }
  async function save(value) { await handle.truncate(0); await handle.write(JSON.stringify(value), 0, 'utf8'); await handle.sync(); }
  let publishId;
  try {
    await save({ id: post.id, digest: checked.digest, status: 'reserved-uncertain' });
    const post_info = Object.fromEntries(['title', 'privacy_level', 'disable_comment', 'disable_duet', 'disable_stitch', 'brand_organic_toggle', 'brand_content_toggle', 'is_aigc'].map(k => [k, info[k]]));
    const init = await api(fetchImpl, env.TIKTOK_ACCESS_TOKEN, 'video/init/', { post_info, source_info: { source: 'FILE_UPLOAD', video_size: bytes.length, chunk_size: bytes.length, total_chunk_count: 1 } });
    if (typeof init.publish_id !== 'string' || !init.publish_id) fail('Missing publish ID');
    publishId = init.publish_id;
    await save({ id: post.id, publishId, status: 'initialized' });
    let url;
    try { url = new URL(init.upload_url); } catch { fail('Invalid upload URL'); }
    if (url.protocol !== 'https:' || !url.hostname.endsWith('.tiktokapis.com') || url.username || url.password || url.port) fail('Unsafe upload URL');
    const uploaded = await request(fetchImpl, url.href, { method: 'PUT', headers: { 'Content-Type': 'video/mp4', 'Content-Length': String(bytes.length), 'Content-Range': `bytes 0-${bytes.length - 1}/${bytes.length}` }, body: bytes });
    if (uploaded.status !== 201) fail('Upload not confirmed; inspect status before any retry');
    await save({ id: post.id, publishId, status: 'uploaded-processing' });
    let remoteStatus;
    if (status) {
      const result = await api(fetchImpl, env.TIKTOK_ACCESS_TOKEN, 'status/fetch/', { publish_id: publishId });
      remoteStatus = ['PROCESSING_UPLOAD', 'PROCESSING_DOWNLOAD', 'SEND_TO_USER_INBOX', 'PUBLISH_COMPLETE', 'FAILED'].includes(result.status) ? result.status : 'UNKNOWN';
      await save({ id: post.id, publishId, status: remoteStatus });
    }
    return { status: 'uploaded-processing', remoteStatus };
  } finally { await handle.close(); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { values } = parseArgs({ options: { 'dry-run': { type: 'boolean' }, upload: { type: 'boolean' }, 'creator-info': { type: 'boolean' }, status: { type: 'boolean' }, manifest: { type: 'string' }, approval: { type: 'string' }, id: { type: 'string' } } });
    if ([values['dry-run'], values.upload, values['creator-info']].filter(Boolean).length > 1) fail('Choose exactly one mode');
    const result = values['creator-info'] ? await creatorInfo({ approval: await json(await local(ROOT, values.approval)) }) : await publish({ ...values, dryRun: !values.upload });
    console.log(JSON.stringify(result, null, 2));
    if (result.blockers?.length) process.exitCode = 1;
  } catch { console.error('Publisher stopped safely. Check local approvals, configuration, media and TikTok authorization; no automatic retry.'); process.exitCode = 1; }
}
