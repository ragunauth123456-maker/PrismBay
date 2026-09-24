# Local Short Video Publisher

The existing Windows loop runs `node scripts/render-viral-queue.mjs` after both product engines. The wrapper hashes the ordered top three approved slug/product pairs with SHA256; timestamps, brief text and lower-ranked products do not invalidate the cache. It skips only when the fingerprint matches and all three nonempty local MP4 drafts exist. A first run, changed top three, invalid cache or missing output triggers the exported Node `render()` directly using a local snapshot of the ranked queue. No shell command is constructed.

Successful fingerprint and complete draft manifest are atomically saved in ignored `growth-reports/videos/queue-state.json`. Failed rendering (including missing ffmpeg/ffprobe) logs a warning, preserves the last successful state and retries next run without failing product refresh. Publication stays disabled and media/font rights review stays pending. Local seed evidence at `growth-reports/viral-seed-pool.json` is also ignored and is not cleared by the runner. No schedule is installed by this integration.

Run all Node tests with `node --test`; queue tests use deterministic renderer fixtures without ffmpeg or network access.

Run from this worktree on K1 (Node 20+ and existing ffmpeg/ffprobe on PATH):

```powershell
node --test scripts/render-viral-videos.test.mjs
node scripts/render-viral-videos.mjs
```

Default: three 15-second silent 1080×1920, 30 fps H.264/yuv420p MP4 shorts, ranked from `growth-reports/viral-content-queue.json`. Each has original animated typography, abstract graphics, a product-name hook, persistent promotional disclosure and a storefront CTA. No downloaded media, paid service, generated product demonstration, runtime credentials or publishing connection is used. Silence deliberately avoids music licensing. Product identities are checked against the explicit approval list matching `viral-product-engine.mjs`; rejected/revoked/pending items are excluded. Queue hook and CTA text are deliberately not trusted as factual claims. Product-name facts still require prepublication review.

Every invocation creates a fresh `growth-reports/videos/render-*/` directory containing videos, text/filter files, staged font, ffprobe reports and **post-queue.json**. This prevents stale authorizations from carrying into new renders and preserves previous runs. All generated assets and queues are ignored by Git; Vercel uploads exclude the directory. Other deployment packaging must likewise exclude `growth-reports/videos/`. Nothing is copied into public assets or deployed.

The manifest is written only after all requested videos pass ffprobe validation. A failed run may leave partial local files but no publish queue. All posts have `status: awaiting_tiktok_authorization`, `publishable: false`, and a mandatory pending media-rights check. It is a review queue, never an automatic publisher. Before any manual upload: verify media/font rights, product facts and the current storefront destination; authorize the TikTok account; enable the platform's promotional disclosure. The URL comes from the existing storefront configuration and is printed in each caption; it does not claim that a profile link is configured.

Options: `--count 1` (up to 3), `--queue relative/path.json`, `--ffmpeg "C:\path with spaces\ffmpeg.exe"`, `--ffprobe "C:\path with spaces\ffprobe.exe"`, `--font "C:\Windows\Fonts\arialbd.ttf"`, `--photos growth-reports/videos/photos.json`. `FFMPEG_PATH` and `FFPROBE_PATH` also work. On Linux the default font is DejaVu Sans Bold. Font use/distribution remains part of the rights review; staged font binaries stay local.

Optional photos manifest (local PNG/JPEG paths inside this worktree only):

```json
{
  "scrubber": {
    "path": "growth-reports/videos/owned-scrubber.jpg",
    "authorized": true,
    "rightsEvidence": "Owner/license record and scope permitting promotional video use"
  }
}
```

Only supply an actual authorized product photo with an auditable rights record. An authorization flag is an assertion, not a completed rights check. Photos appear unaltered in aspect ratio within a separate lower panel. With no authorized photo the default is typography only. No supplier image URLs are fetched.

Windows safety: executable/file arguments use `spawnSync` with `shell:false`; user paths never enter a shell. Text is UTF-8 files with drawtext expansion disabled. Fonts and photos are copied using filesystem APIs to generated ASCII basenames before entering filter expressions, avoiding drive-colon, slash, apostrophe and whitespace escaping ambiguity. Symlink-resolved queue/photo paths must remain inside the worktree. No inputs are removed and no previous renders are overwritten.

Validated on K1 on 2026-09-24 using Node 24.16.0 and ffmpeg/ffprobe 9.0.1: six unit tests passed; all three default shorts rendered and passed ffprobe checks (15 seconds, 1080×1920, H.264/yuv420p). Opening and CTA preview frames were visually inspected. Local results for this run are in `growth-reports/videos/render-v5vlNg/`; they are intentionally not committed. Optional photo rendering was not exercised in this validation run because no owned product photo was supplied.
