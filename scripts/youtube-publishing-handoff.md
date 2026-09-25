# PrismBay AI YouTube publisher — mandatory handoff

**Only channel** `UCw2hs85TzIpdKwJtG-BSxzQ`, Metricool brand `6945443`, `America/Guyana`. Retail/TikTok workers continue separately. No secrets or videos belong in GitHub.

## Installed guards

- `youtube-publishing-guard.mjs`: editorial/channel/spacing/duplicate tests, including semantically similar titles.
- `youtube-publishing-gateway.mjs`: the sole approved entry point for new *programmatic* YouTube scheduling. An authorized Metricool adapter must provide `readBrand`, `readQueue`, `readPublished`, `send` and `readBack`. It uses an exclusive local lock, fresh authenticated data, a durable creative ledger, and fail-closed uncertainty. The repository does **not** contain a Metricool credential or automatically intercept separate external connector calls.
- `youtube-publishing-preflight.mjs`: issues a short-lived local approval for the existing K1 Studio scripts. Requires an authenticated current Metricool snapshot (less than two minutes old), published history, original candidate and media SHA-256.
- `install-youtube-studio-gate.mjs`: instruments the six K1 video-upload scripts, stores one private backup per script, and checks for missing/tampered safety calls. Separate profile-editing scripts are not video publishers.

## Studio handoff (K1, private files only)

Create the directory `C:\Users\Fano Faizul\PrismBayAI\.publish-gate\` and keep JSON snapshots and media out of git. Obtain *live* brand/channel, queue **and published** records from the connected authorized Metricool account. Do not fabricate `fetchedAt`: set it when the authenticated response is received. Save the snapshot as:

```json
{"brandSettings":{"id":6945443,"networksData":{"youtubeData":"UCw2hs85TzIpdKwJtG-BSxzQ"}},"fetchedAt":"REPLACE_WITH_LIVE_ISO_8601","queue":[],"published":[]}
```

The arrays above are a **schema example only**; they must be populated from a real account response. The candidate JSON must have `id`, `channelId`, `providers:[{"network":"youtube"}]`, `youtubeData:{title,tags,type,privacy,madeForKids,isAiGeneratedContent}`, `text`, `media:[...]`, `localMediaPath`, `mediaSha256`, `publicationDate:{dateTime,timezone:"America/Guyana"}`, `autoPublish:true`, `draft:false`.

First run `node scripts/youtube-publishing-preflight.mjs --audit PRIVATE_SNAPSHOT.json`; then `node scripts/youtube-publishing-preflight.mjs --studio PRIVATE_CANDIDATE.json PRIVATE_SNAPSHOT.json C:\Users\Fano Faizul\PrismBayAI\.publish-gate\approval.json`. Only an `approved` result permits the guarded K1 scripts to open/upload, set approved title/description, or click Publish. The receipt expires after 15 minutes and is bound to the media hash, exact channel and metadata. Preflight reserves the creative and slot; uncertainty blocks automatic retries until manually reconciled.

## Tests and operational health

`npm run test:youtube-gate`, `python scripts/youtube_studio_gate.test.py`, then `node scripts/install-youtube-studio-gate.mjs --check` on K1. The existing hourly retail swarm performs the JavaScript tests and Studio-installation drift check, **without** running YouTube publication or blocking independent commerce work.

A 403 from the GitHub connector was previously bypassed using K1's authorized git remote. Keep only reviewed source changes in git, never cookies, browser profiles, OAuth tokens, private snapshots, licensed font files or media. The owner must restrict or remove independent third-party publishing permissions to prevent actors outside this controlled workflow from bypassing repository safeguards.

Publishing success is **only** established by actual platform readback or a verified YouTube video URL. An approved preflight, queued post, or a successful local test is not a confirmed public upload.
