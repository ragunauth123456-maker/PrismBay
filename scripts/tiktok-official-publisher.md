# Official TikTok publisher: owner authorization required

This is a disabled-by-default transport adapter for the local renderer's `post-queue.json`, not a TikTok-approved app or a completed public posting UI. Node 24 built-ins only; no npm installation or paid service. It uses the existing `ffprobe` executable on PATH to recheck MP4/H264/yuv420p, 1080x1920, 23–60 fps and the renderer's 12–20 second duration policy. It never renders or modifies media. Local videos are limited deliberately to 64 MiB for one complete FILE_UPLOAD chunk; larger files are blocked rather than incorrectly chunked.

Read together with [renderer and verified manifest documentation](render-viral-videos.md). The manifest and referenced fact-source snapshot must exist locally. This isolated checkout currently contains no rendered video manifest or binaries. The renderer's pending rights and disabled publication flags are preserved: authorization lives in a separate, owner-reviewed approval record. No scheduler or existing render loop invokes this publisher.

## One-time human authorization

1. The TikTok account owner must register/configure an app in TikTok for Developers, enable Content Posting API Direct Post and obtain the necessary approval for `video.publish`. Configure the official OAuth redirect URI and complete the owner-facing authorization flow. Verify OAuth state, exchange the authorization code securely, and retain the returned granted scopes. This script does not log in, exchange codes, refresh tokens or scrape browsers.
2. The owner must explicitly grant `video.publish`. A local flag cannot grant scope. Supply the resulting access token to this process as `TIKTOK_ACCESS_TOKEN` using your secret manager or secure session environment, never a command argument, source file, transcript or Git. Do not commit tokens/client secrets/refresh tokens. Expired or revoked credentials require the official refresh/re-authorization flow outside this adapter.
3. Record genuine developer approval evidence locally. App approval and Direct Post audit are separate. Without audit evidence this adapter only accepts `SELF_ONLY` and fresh creator info indicating a private account. Public/friends posting requires the audited app flag, audit evidence and the exact live privacy option. API errors, caps and missing permissions stop the attempt.
4. **Eligibility limitation:** TikTok's guidelines explicitly exclude utilities limited to accounts managed by an internal team. This adapter does not make such an app eligible or replace TikTok's required creator export UI. Use it only behind an approved integration and compliant review experience. The existing renderer includes promotional overlays; the owner must resolve their compliance with TikTok's watermark/content guidelines before approving any draft. The script cannot determine that from video pixels.
5. Alternative: the owner can connect the TikTok account through an already-authorized Metricool account and use that service's native review/publish flow if available under their existing plan. That connection does not authorize this script, supply its OAuth token, or bypass developer review. No Metricool integration, subscription, or charge is created here.

## Local review and dry-run

Store all approval records under ignored `growth-reports/videos/`; the example below is a schema illustration, not permission to approve a draft. First create a record containing genuine app approval and OAuth-grant evidence. After human OAuth, the owner may deliberately request read-only creator information:

```powershell
node scripts/tiktok-official-publisher.mjs --creator-info --approval growth-reports/videos/owner-approval.json
```

This calls **POST**, not GET, `https://open.tiktokapis.com/v2/post/publish/creator_info/query/`. It does not initialize or upload a video. Present the returned creator nickname/account, privacy choices and interaction restrictions in the approved app's review UI. Privacy must be explicitly selected, without a default; interactions must follow TikTok restrictions and require opt-in. Allow caption editing in the local draft before approval. Preview the exact local video, review media/font/music rights, product facts, destination and content guidelines. Skip paid/third-party promotions and any unsupported claims.

Run an offline check (default mode is also dry-run):

```powershell
node scripts/tiktok-official-publisher.mjs --dry-run --manifest growth-reports/videos/render-EXAMPLE/post-queue.json --id prismbay-scrubber --approval growth-reports/videos/owner-approval.json
```

It checks the manifest, fact-source product identity, caption, file size, media, approval and existing duplicate reservation. It prints a SHA256 approval digest binding ID/product/caption to the exact media bytes. It reads no environment values or tokens, performs no network calls and writes no ledger. It always reports live authorization checks as unresolved and exits nonzero when blockers exist; dry-run is never proof of OAuth validity.

After preview and explicit consent in the approved review experience, complete this local record. Replace all placeholders with real evidence. Approval expires after 30 minutes; a media or caption change requires a new digest and consent. The `post_info` object is the creator's expressly chosen metadata. Select `is_aigc` according to actual AI-generated content; do not infer it merely from use of this script. Own-business promotional content requires the creator to select Your Brand, resulting in `brand_organic_toggle: true` and TikTok's Promotional content label. Paid partnership is unsupported. Obtain acceptance of TikTok's Music Usage Confirmation even for a silent video.

```json
{
  "appApproved": true,
  "appApprovalEvidence": "Actual developer portal approval reference",
  "appAudited": false,
  "auditEvidence": "",
  "ownerAuthorized": true,
  "grantedScopes": ["video.publish"],
  "creatorUsername": "Actual username returned by creator info",
  "post": {
    "digest": "Digest printed by dry-run for reviewed media and caption",
    "approvedAt": "Actual ISO timestamp of creator consent",
    "creatorApproved": true,
    "rightsApproved": true,
    "rightsEvidence": "Actual media, font and audio ownership/license review",
    "factsVerified": true,
    "factsEvidence": "Actual product identity and claim verification record",
    "destinationVerified": true,
    "previewReviewed": true,
    "musicUsageConfirmed": true,
    "contentGuidelinesReviewed": true,
    "paidPromotion": false,
    "post_info": {
      "title": "Exact reviewed caption from local manifest",
      "privacy_level": "Creator-selected option from fresh creator info",
      "disable_comment": true,
      "disable_duet": true,
      "disable_stitch": true,
      "brand_organic_toggle": true,
      "brand_content_toggle": false,
      "is_aigc": false
    }
  }
}
```

Local evidence is an operator attestation, not cryptographic verification of app approval. Protect these files with normal account permissions. The live creator request enforces actual scope, account, privacy, interaction and duration permissions again immediately before initialization; it does not expose TikTok's app audit status.

## Deliberate owner-authorized upload only

**Do not run until the above human steps are complete.** Unlike inbox upload, Direct Post can publish as soon as file transfer completes. In the authorized process, set `TIKTOK_PUBLISH_ENABLED` to the exact value `OWNER_AUTHORIZED` and securely supply `TIKTOK_ACCESS_TOKEN`. Then explicitly invoke:

```powershell
node scripts/tiktok-official-publisher.mjs --upload --status --manifest growth-reports/videos/render-EXAMPLE/post-queue.json --id prismbay-scrubber --approval growth-reports/videos/owner-approval.json
```

One video per invocation. The adapter rechecks creator info, initializes with POST `/v2/post/publish/video/init/` using FILE_UPLOAD, then PUTs bytes with Content-Length and Content-Range to the returned HTTPS TikTok upload URL. It never forwards the bearer token to that URL, follows redirects or uses PULL_FROM_URL. There is no media-domain verification requirement for this transfer method. `--status` performs one POST `/v2/post/publish/status/fetch/` after upload. Transfer success means processing, not publication success; inspect the remote status and owner account, or use the approved app's status/webhook support until final completion.

Ignored `growth-reports/videos/tiktok-publisher/` contains one exclusive, fsynced reservation per hashed video ID. It prevents concurrent/repeated initialization, including after network failures, crashes, upload failures or an uncertain result. IDs are intentionally global within this worktree and block re-renders with the same ID too. Never delete reservations or change IDs to retry blindly. An initialized record retains the publish ID for owner-authorized status investigation; no token or signed upload URL is persisted. A crash before initialization may leave a conservative false-positive reservation. Resolve manually against TikTok state; this adapter performs no retries or reset operation. Do not delete the ignored ledger during cleanup or move publishing to another worktree without preserving it.

## Verification and references

`node --test scripts/tiktok-official-publisher.test.mjs` uses injected media probes, isolated temporary fixtures and mocked fetch exclusively. No test can invoke the production fetch default. `node --test` also runs the existing repository suites.

Official documentation checked September 24, 2026:

- [Direct Post reference](https://developers.tiktok.com/docs/en/content-posting-api-reference-direct-post), updated August 24, 2026: initialization, own-brand and AI declarations, private restriction before audit.
- [Creator info](https://developers.tiktok.com/docs/en/content-posting-api-reference-query-creator-info): POST method, scope, live limits and privacy.
- [Media transfer](https://developers.tiktok.com/docs/en/content-posting-api-media-transfer-guide): FILE_UPLOAD and HTTP 201 completion.
- [Status](https://developers.tiktok.com/docs/en/content-posting-api-reference-get-video-status).
- [Content sharing guidelines](https://developers.tiktok.com/docs/en/content-sharing-guidelines): eligibility, creator UI, consent, disclosures and watermark restrictions.
- [Direct Post setup](https://developers.tiktok.com/docs/en/content-posting-api-get-started).

Creator info, media transfer and guidelines pages carry August 4, 2026 dates; the August 24 date belongs to the Direct Post reference, not every API document.
