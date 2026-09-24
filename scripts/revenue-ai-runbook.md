# PrismBay AI video review and posting runbook

Status: **DRAFT — BLOCKED on secure checkout delivery proof**. No upload, scheduling, public release asset or YouTube publication is performed by these scripts.

## Assets and reproduction

Worktree on K1: `C:\Users\Fano Faizul\PrismBay-Revenue-Media`.
All media stays in ignored `growth-reports/videos/revenue-ai/`.

Run `node --test scripts/revenue-ai.test.mjs`, then `node scripts/render-revenue-ai.mjs` using the already installed FFmpeg/FFprobe. No dependencies or paid tools are installed. The renderer uses Windows Arial, H.264/yuv420p, 1080x1920, 30 fps, faststart, no audio, a 1.8 Mbps maximum video bitrate, and rejects outputs exceeding 10 MB. It creates two MP4s, SRT transcripts, a portrait thumbnail PNG, review PNGs, ffprobe reports, post metadata and a manifest containing durations, file sizes and SHA-256 hashes. Generated fonts and media must never be committed.

## Creative rationale

1. **Vendor risk:** a first-person desk walkthrough: “I compare evidence before price.” The speaker's only claimed action is constructing the visible fictional matrix. No invented founder history, real vendor assessment, customer testimonial or realized savings. The matrix compares retention, export testing and ownership, then turns an unknown into an evidence request and named reviewer. This is the proposed authentic first-person story demo; a human can optionally record it in their own voice after review. Current draft is silent.
2. **Automation gates:** two matching fictional invoice records lead through context checks and human approval. A matching identifier is a flag, not proof. The viewer leaves with an immediately usable decision tree: match → investigate → document → approve/hold.

Original educational examples interpret catalog topics, not actual downloadable template contents. The catalog preview references supplier comparison, vendor risk and duplicate-charge detection. Do not claim the illustrated matrix or decision tree is included verbatim in the purchased package. Do not repeat the preview's unverified ROI percentages or document counts.

Both hooks appear from frame zero. Text uses high contrast, large type and central placement. Every lesson is understandable without sound. SRT contains the complete visible lesson, including matrix data. Inspect at phone size, especially the comparison columns and product URL; YouTube overlays vary. The portrait thumbnail is also suitable as a cover frame; confirm current thumbnail selection support in the authorized posting flow.

## Factual and checkout blockers

On 2026-09-24, `https://prismbayai.com/products/spendshield-ai` returned HTTP 200 after redirecting to `https://www.prismbayai.com/products/spendshield-ai`. The HTML is retained locally. Page, `src/data/products.ts` and `src/data/payment-links.ts` display USD 249. The page also states launch pricing ended August 27 and mentions USD 349 afterward; this contradiction needs correction and actual checkout-price confirmation. Draft says “displayed price,” with no countdown, discount or urgency.

Reviewed `src/data/previews.ts` SpendShield table of contents and sample excerpt. Existing product PNGs and demo WEBMs were inventoried but not reused because provenance was not established. No complete original deliverable ZIP/PDF was found in this worktree. `src/lib/storage.ts` points to `/home/team/shared/product-repos`; that server's contents are not available here. `src/routes/api/webhooks/stripe.ts` looks up an existing order by Stripe session and returns when absent. Hosted payment-link order creation and fulfillment are not established by this inspection. This is an unverified path, not proof that production delivery fails.

Before any public asset release or promotion, the checkout engineer must attach reviewable evidence for the exact SpendShield hosted payment link:

- Exact downloadable package exists, opens successfully, and matches the promised product and licence; record package version and SHA-256 without exposing contents publicly.
- Checkout amount/currency and product mapping are correct. A controlled authorized test reaches paid order, fulfillment email/account access and usable private download.
- Signed webhook verification, payment-state checks and replay handling work. Missing/invalid/unpaid tokens cannot download; expiry and access limits work; no public package URL bypass exists.
- Evidence identifies deployed revision, test date, results and engineer sign-off. No customer data, secrets or private download tokens in PRs or manifests.

Do not infer delivery from an HTTP 200, Stripe link, preview, source code or a checkout screenshot. Keep the draft watermark and `publishingAllowed:false` until evidence is reviewed. After approval, make a reviewed source change to remove the watermark, recheck price, rerender, visually inspect and regenerate hashes. Never simply flip the manifest field to publish these drafts.

## Authorized Metricool handoff only

The user verified YouTube channel `UCw2hs85TzIpdKwJtG-BSxzQ` as **PrismBay AI**, not PrismBay Clean. Check the exact channel ID again in the authorized Metricool connection at execution time. Cleaning tools, TikTok posts and PrismBay Clean queues are categorically out of scope.

After delivery proof and separate creative/posting approval, the authorized operator selects the correct AI channel and approved rerender, copies that video's title, description, caption and UTM URL from `post-metadata.json`, and checks the final preview. Do not bypass OAuth, post via TikTok, or publish directly from these scripts. Use an existing approved channel profile link for navigation if Shorts description URLs are not clickable; do not promise a clickable description link. Confirm current platform requirements in the posting UI. Attach SRT where supported; essential information is already burned in. No scheduling or publishing until the separate review is recorded.

No public GitHub binary release is created. If later needed, it requires secure delivery proof first and should contain only the approved marketing asset, never the paid blueprint. This PR contains source and docs only. Do not merge automatically.
