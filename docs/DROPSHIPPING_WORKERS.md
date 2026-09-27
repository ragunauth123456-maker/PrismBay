# PrismBay dropshipping cloud workers

This system extends existing cloud workers. It does not install another agent framework, create a paid server, access any user PC, process customer orders, charge cards, or automatically publish unverified product listings.

## Existing worker schedules

- Every six hours: `.github/workflows/free-cloud-ops.yml` executes the existing eight public-data growth workers, runs the storefront health check, and generates a new `growth-reports/dropshipping-worker-board.json`, retains the run artifact, and commits the sanitized board to `main` for owner review. The board coordinates Supplier Auditor, Quality Reviewer, Trend Scout, Storefront CRO, Hook/Creative Writer and Analytics Reviewer tasks. These workers are deterministic scripts, not autonomous LLM inference.
- Four times daily, three research candidates per batch: `.github/workflows/cj-supplier-verification.yml` uses the existing `CJ_API_KEY` GitHub secret on GitHub-hosted runners. It searches CJ without creating orders and checks product identity, variant IDs, the exact variant's CJ-held US inventory, and estimated US-to-US freight. Twelve candidates are covered across four batches. When a verified SKU returns no positively priced country-level freight estimate, the worker retries once using illustrative US ZIP 10001. Such a sample quote never authorizes delivery to a buyer. The public read-only review retains each distinct batch for at most 30 hours and is refreshed as batches complete.
- Existing cloud-agent migration continues daily product research and weekly original video drafts. These drafts remain unpublished until rights and channel checks pass.

## Acceptance and commercial boundaries

- Fuzzy CJ keyword matches are insufficient. `scripts/cj-match-policy.mjs` explicitly checks each of twelve categories and rejects the unrelated shop vacuum and jewelry cabinet returned in the September 26 verification report.
- Variant and US warehouse inventory are queried from the dedicated CJ endpoints, not inferred from the product-summary response.
- CJ methods reporting $0 shipping remain blocked until supplier confirmation. The September 27 sample returned eleven zero-priced methods for one US-stocked organizer. The read-only review now records the exact catalog SKU, zero-price diagnostic and any sample-ZIP quote scope. A US-to-US freight estimate is not a ZIP-specific delivery quote. Require buyer destination ZIP, actual landed cost, delivery promise, supplier media permission, merchant authorization and a separately confirmed live checkout before enabling a sale.
- The public review omits API credentials, raw tokens, private customer records, product-level cost and any automatic commercial approval.
- All GitHub workflows remain on GitHub-hosted runners. K1, AGMADMINLPT18 and any other personal computer stay disconnected.

## Monitoring

Visit the repository Actions tab and inspect `PrismBay Free Cloud Operations`, `PrismBay CJ Supplier Verification`, and `Dropshipping Worker Quality`. The CJ report artifact holds detailed checks. The committed `growth-reports/cj-worker-review.json` holds the sanitized rolling blocker board; the growth run artifact and the committed `growth-reports/dropshipping-worker-board.json` contain dropshipping worker assignments. The newly added freight analyst workstream prioritizes SKUs with physical US stock but missing dependable shipping evidence.

A GitHub Actions success indicates only that the scheduled checks ran without a fatal error. Read the board's status before claiming stock, fulfillment readiness, published promotions or earned revenue.

## AI specialists

The existing manually selectable Copilot profiles in `.github/agents/` supply engineering, supplier auditing and growth-analysis instructions when a user opens an authorized Copilot or Codex session. The cloud scripts continue at their existing schedules even when no model API or AI inference credits are available.

## Offline quality checks

`node --test scripts/cj-match-policy.test.mjs scripts/cj-freight-policy.test.mjs scripts/cj-review-board.test.mjs scripts/dropshipping-dispatch.test.mjs scripts/organic-growth-agent.test.mjs`

`CJ_AUDIT_SELF_TEST_ONLY=1` runs the embedded CJ pipeline assertions without using supplier credentials. The `Dropshipping Worker Quality` GitHub workflow runs both the new tests and preexisting candidate-discovery and CJ MCP regression tests.

CJ API reference: https://developers.cjdropshipping.com/en/api/api2/api/product.html

CJ freight calculation documentation: https://developers.cjdropshipping.com/en/api/api2/api/logistic.html

## Existing-cloud paid-document conversion worker (27 September 2026)

The six-hour `Hook/Creative Writer` task now also runs `scripts/digital-conversion-campaign.mjs` without adding a server, runner, workflow or model subscription. It rotates three **existing** paid document packages across successive six-hour runs: stakeholder mapping ($49), ESG operating pack ($99), and white paper/board briefing ($79). Its source-of-truth URLs are the live, original free buyer guides under GitHub Pages, with a matching existing Stripe Payment Link and a bounded `client_reference_id` for eventual paid-session attribution.

The output in `growth-reports/hook-creative-writer.json` contains an educational post draft, an original-graphics-only 30-second video script, honest document-package disclosures and a campaign-specific free-guide URL. The pre-existing cloud workflow includes the output in its time-limited run artifact. It is *not* an auto-posting or cold-email bot; it has no access to a subscribed mailing list and must never claim transactions, working AI software, or unverified physical inventory. Publishing remains subject to genuine channel authorization and media review. For actual revenue, reconcile live Stripe `payment_status=paid` transactions separately.

Offline checks: `node --test scripts/digital-conversion-campaign.test.mjs scripts/organic-growth-agent.test.mjs`. Existing physical supplier and TikTok approval safeguards remain unchanged.

The cloud revenue health check also fetches all three live free paid-product buyer guides and enforces the correct canonical page, advertised price, existing Stripe checkout reference and refund/support route. If a guide disappears or loses its matching checkout link, the existing six-hour Actions run fails and retains diagnostic output. This is storefront integrity, never proof of a payment or customer acquisition.
