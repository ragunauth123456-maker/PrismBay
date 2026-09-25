# PrismBay AI — YouTube publishing audit (2026-09-24)

Channel: `UCw2hs85TzIpdKwJtG-BSxzQ` / `@PrismBayAI`; Metricool brand `6945443`.

## Findings and actions

| Finding | Action | Current state |
|---|---|---|
| AI Shorts booked 20:00 and 20:50 Guyana time | Move second to 00:15 Sept 25, preserve media and metadata | Verified live queue: 4h15m separation |
| PrismBay Clean product Short entered AI YouTube queue | Original retail post was made a draft, autoPublish disabled | Resolved for that retail creative; subsequent reuse of same Metricool UUID for AI vendor video confirms UUID alone is not unique creative identity |
| Commerce-first Copilot guidance can misroute videos | Separate editorial streams and require exact channel, editorial fit, 4h minimum gap and content fingerprint | `scripts/youtube-publishing-guard.mjs` committed; not yet integrated in every publisher |
| GitHub connector 403 on repository writes and issue creation | Use existing K1 authenticated git remote, commit only intended files | Commit `a5b82df` pushed and read back via GitHub connector |
| Scheduled posts may be edited concurrently by other workers | Re-fetch before editing; compare ID and UUID; always re-fetch afterward | Manual verification performed; a lock or single publication controller remains needed |
| Cloud-browser balance and Opera connector access blockers | Prioritize Metricool API, K1 and authorized direct Studio; do not pay | Free fallback paths exist; Ask Studio access not currently verified in this audit |
| No verified ongoing auto-publishing gate | Offline tests detect wrong channel, retail terms, duplicate media/title and inadequate spacing | Six tests pass; enforce at publisher entry point next |

## Safe deployment rule

Do not silently change existing commerce growth workers or start them publishing to the AI channel.
Use `node --test scripts/youtube-publishing-guard.test.mjs` before integrating the guard.
At publishing time, fetch the current queue, confirm channel ID, classification, spacing, duplicates, and re-read after any mutation.
Track the *media fingerprint + destination + publication status*, not Metricool UUID alone.
Never commit OAuth tokens, cookies, private browser profiles or customer data.

## Pending verification

The 20:00 and 00:15 items were still PENDING at the last read. Publication success must be confirmed separately.
Long-form cadence, Ask Studio analytics, and end-to-end automated guard integration remain open until instrumented.
