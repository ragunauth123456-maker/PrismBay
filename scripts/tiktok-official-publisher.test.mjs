import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { publish, approvalDigest } from './tiktok-official-publisher.mjs';

// Hard tripwire: even a test that accidentally omits injection cannot reach TikTok.
globalThis.fetch = async () => { throw new Error('Real network forbidden in publisher tests'); };

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tiktok-publisher-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const bytes = Buffer.from('mock-media-only');
  const post = { id: 'prismbay-scrubber', slug: 'scrubber', product: '5-in-1 Electric Spin Scrubber', channel: 'tiktok', status: 'awaiting_tiktok_authorization', caption: 'Ad | PrismBay Clean', mediaPath: 'video.mp4', factSource: 'facts.json' };
  const approval = { appApproved: true, appApprovalEvidence: 'owner portal record', appAudited: true, auditEvidence: 'audit record', ownerAuthorized: true, grantedScopes: ['video.publish'], creatorUsername: 'owner', post: { digest: approvalDigest(post, createHash('sha256').update(bytes).digest('hex')), creatorApproved: true, approvedAt: new Date().toISOString(), rightsApproved: true, factsVerified: true, destinationVerified: true, previewReviewed: true, musicUsageConfirmed: true, contentGuidelinesReviewed: true, rightsEvidence: 'owned media and font license', factsEvidence: 'review record', paidPromotion: false, post_info: { title: post.caption, privacy_level: 'SELF_ONLY', disable_comment: true, disable_duet: true, disable_stitch: true, brand_organic_toggle: true, brand_content_toggle: false, is_aigc: false } } };
  const creator = { creator_username: 'owner', privacy_level_options: ['SELF_ONLY', 'PUBLIC_TO_EVERYONE'], max_video_post_duration_sec: 60, comment_disabled: false, duet_disabled: true, stitch_disabled: true };
  await fs.writeFile(path.join(root, 'video.mp4'), bytes);
  await fs.writeFile(path.join(root, 'facts.json'), JSON.stringify({ items: [{ ...post, format: 'short-video' }] }));
  const calls = [];
  const good = data => ({ ok: true, status: 200, json: async () => ({ error: { code: 'ok' }, data }) });
  let hook;
  const options = { root, manifest: 'manifest.json', approval: 'approval.json', id: post.id, dryRun: false, probe: async () => ({ durationSeconds: 15 }), env: { TIKTOK_ACCESS_TOKEN: 'secret-test-token', TIKTOK_PUBLISH_ENABLED: 'OWNER_AUTHORIZED' }, fetchImpl: async (url, init) => {
    calls.push({ url, init });
    if (hook) { const r = await hook(url, init); if (r) return r; }
    if (url.endsWith('creator_info/query/')) return good(creator);
    if (url.endsWith('video/init/')) return good({ publish_id: 'mock-id', upload_url: 'https://upload.us.tiktokapis.com/video/?upload_token=secret' });
    if (init.method === 'PUT') return { status: 201 };
    if (url.endsWith('status/fetch/')) return good({ status: 'PUBLISH_COMPLETE' });
    throw new Error('Unexpected mock request');
  } };
  const save = async () => {
    await fs.writeFile(path.join(root, 'manifest.json'), JSON.stringify({ schemaVersion: 1, localOnly: true, publicationEnabled: false, posts: [post] }));
    await fs.writeFile(path.join(root, 'approval.json'), JSON.stringify(approval));
  };
  await save();
  return { root, post, approval, creator, options, calls, save, good, hook: fn => { hook = fn; } };
}

test('dry-run reads no token, performs no network or ledger writes', async t => {
  const f = await fixture(t);
  f.options.env = new Proxy({}, { get() { throw new Error('Environment read'); } });
  const r = await publish({ ...f.options, dryRun: true });
  assert.equal(r.status, 'dry-run'); assert.equal(r.blockers.length, 1); assert.equal(f.calls.length, 0);
  await assert.rejects(fs.stat(path.join(f.root, 'growth-reports')));
});
test('default mode cannot publish', async t => { const f = await fixture(t); delete f.options.dryRun; assert.equal((await publish(f.options)).status, 'dry-run'); assert.equal(f.calls.length, 0); });
test('environment gate blocks publication', async t => { const f = await fixture(t); delete f.options.env.TIKTOK_PUBLISH_ENABLED; await assert.rejects(publish(f.options), /gate disabled/); assert.equal(f.calls.length, 0); });
test('missing token blocks before request', async t => { const f = await fixture(t); delete f.options.env.TIKTOK_ACCESS_TOKEN; await assert.rejects(publish(f.options), /TOKEN required/); assert.equal(f.calls.length, 0); });
for (const [name, mutate] of [
  ['missing OAuth scope', a => { a.grantedScopes = []; }],
  ['missing app approval', a => { a.appApproved = false; }],
  ['missing rights', a => { a.post.rightsApproved = false; }],
  ['unverified claims', a => { a.post.factsVerified = false; }],
  ['paid promotion', a => { a.post.paidPromotion = true; }],
  ['missing AI declaration', a => { delete a.post.post_info.is_aigc; }],
  ['missing own brand disclosure', a => { a.post.post_info.brand_organic_toggle = false; }],
  ['stale creator approval', a => { a.post.approvedAt = '2020-01-01'; }],
  ['unaudited public post', a => { a.appAudited = false; a.post.post_info.privacy_level = 'PUBLIC_TO_EVERYONE'; }],
]) test(name + ' fails closed', async t => { const f = await fixture(t); mutate(f.approval); await f.save(); assert.equal((await publish(f.options)).status, 'blocked'); assert.equal(f.calls.length, 0); });
test('401 never initializes and errors never expose response secrets', async t => { const f = await fixture(t); f.hook(() => ({ ok: false, status: 401 })); await assert.rejects(publish(f.options), /HTTP 401/); assert.equal(f.calls.length, 1); });
test('server missing scope error never initializes', async t => { const f = await fixture(t); f.hook(() => ({ ok: true, json: async () => ({ error: { code: 'scope_not_authorized', message: 'secret-test-token' } }) })); await assert.rejects(publish(f.options), e => !e.message.includes('secret-test-token') && /rejected/.test(e.message)); assert.equal(f.calls.length, 1); });
for (const [name, change] of [
  ['privacy mismatch', c => { c.privacy_level_options = ['PUBLIC_TO_EVERYONE']; }],
  ['wrong account', c => { c.creator_username = 'wrong'; }],
  ['duration limit', c => { c.max_video_post_duration_sec = 5; }],
  ['missing interaction permissions', c => { delete c.comment_disabled; }],
]) test(name + ' stops before init', async t => { const f = await fixture(t); change(f.creator); await assert.rejects(publish(f.options)); assert.equal(f.calls.length, 1); });
test('successful FILE_UPLOAD and status; repeat ID skipped', async t => {
  const f = await fixture(t);
  const result = await publish({ ...f.options, status: true });
  assert.equal(result.remoteStatus, 'PUBLISH_COMPLETE'); assert.equal(f.calls.length, 4);
  assert.equal(f.calls[0].init.method, 'POST');
  const init = JSON.parse(f.calls[1].init.body);
  assert.deepEqual(init.source_info, { source: 'FILE_UPLOAD', video_size: 15, chunk_size: 15, total_chunk_count: 1 });
  assert.equal(init.post_info.brand_organic_toggle, true); assert.equal(init.post_info.is_aigc, false);
  assert.equal(f.calls[2].init.headers.Authorization, undefined);
  assert.equal(f.calls[2].init.headers['Content-Range'], 'bytes 0-14/15');
  assert.equal(f.calls[2].init.redirect, 'error');
  assert.equal((await publish(f.options)).status, 'duplicate-skipped'); assert.equal(f.calls.length, 4);
});
test('network failure during init retains reservation and redacts secrets', async t => {
  const f = await fixture(t); f.hook(url => { if (url.endsWith('video/init/')) throw new Error('secret-test-token'); });
  await assert.rejects(publish(f.options), /Network request failed/);
  assert.equal((await publish(f.options)).status, 'duplicate-skipped'); assert.equal(f.calls.length, 2);
});
test('upload failure cannot cause automatic repost', async t => { const f = await fixture(t); f.hook((url, init) => init.method === 'PUT' ? { status: 500 } : undefined); await assert.rejects(publish(f.options), /Upload not confirmed/); assert.equal((await publish(f.options)).status, 'duplicate-skipped'); });
test('untrusted upload URL never receives bytes', async t => { const f = await fixture(t); f.hook(url => url.endsWith('video/init/') ? f.good({ publish_id: 'id', upload_url: 'https://evil.example/upload' }) : undefined); await assert.rejects(publish(f.options), /Unsafe upload URL/); assert.equal(f.calls.length, 2); });
test('changed media invalidates approval', async t => { const f = await fixture(t); await fs.writeFile(path.join(f.root, 'video.mp4'), 'changed'); assert.equal((await publish(f.options)).status, 'blocked'); assert.equal(f.calls.length, 0); });
test('caption edit invalidates approval', async t => { const f = await fixture(t); f.post.caption = 'changed'; await f.save(); assert.equal((await publish(f.options)).status, 'blocked'); });
test('failed media probe blocks', async t => { const f = await fixture(t); f.options.probe = () => { throw new Error('Invalid H264'); }; assert.equal((await publish(f.options)).status, 'blocked'); assert.equal(f.calls.length, 0); });
test('unaudited app blocks public creator even SELF_ONLY', async t => { const f = await fixture(t); f.approval.appAudited = false; await f.save(); await assert.rejects(publish(f.options), /private creator/); });
test('unaudited private creator may upload SELF_ONLY', async t => { const f = await fixture(t); f.approval.appAudited = false; f.creator.privacy_level_options = ['SELF_ONLY', 'FOLLOWER_OF_CREATOR']; await f.save(); assert.equal((await publish(f.options)).status, 'uploaded-processing'); });
test('concurrent attempts initialize at most once', async t => { const f = await fixture(t); const result = await Promise.all([publish(f.options), publish(f.options)]); assert.equal(result.filter(r => r.status === 'duplicate-skipped').length, 1); assert.equal(f.calls.filter(c => c.url.endsWith('video/init/')).length, 1); });
test('zero-size file blocks', async t => { const f = await fixture(t); await fs.writeFile(path.join(f.root, 'video.mp4'), ''); assert.equal((await publish(f.options)).status, 'blocked'); });
test('oversized caption blocks', async t => { const f = await fixture(t); f.post.caption = 'a'.repeat(2201); await f.save(); assert.equal((await publish(f.options)).status, 'blocked'); });
test('path outside worktree blocks', async t => { const f = await fixture(t); f.post.mediaPath = '../outside.mp4'; await f.save(); assert.equal((await publish(f.options)).status, 'blocked'); });
