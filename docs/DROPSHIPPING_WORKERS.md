# PrismBay dropshipping cloud workers

This system extends existing cloud workers. It does not install another agent framework, create a paid server, access any user PC, process customer orders, charge cards, or automatically publish unverified product listings.

## Existing worker schedules

- Every six hours: `.github/workflows/free-cloud-ops.yml` executes the existing eight public-data growth workers, runs the storefront health check, and generates a new `growth-reports/dropshipping-worker-board.json` in its retained run artifact. The board coordinates Supplier Auditor, Quality Reviewer, Trend Scout, Storefront CRO, Hook/Creative Writer and Analytics Reviewer tasks. These workers are deterministic scripts, not autonomous LLM inference.
- Four times daily, three research candidates per batch: `.github/workflows/cj-supplier-verification.yml` uses the existing `CJ_API_KEY` GitHub secret on GitHub-hosted runners. It searches CJ without creating orders and checks product identity, variant IDs, the exact variant's CJ-held US inventory, and estimated US-to-US freight. Twelve candidates are covered across four batches. The public read-only review retains each distinct batch for at most 30 hours and is refreshed as batches complete.
- Existing cloud-agent migration continues daily product research and weekly original video drafts. These drafts remain unpublished until rights and channel checks pass.

## Acceptance and commercial boundaries

- Fuzzy CJ keyword matches are insufficient. `scripts/cj-match-policy.mjs` explicitly checks each of twelve categories and rejects the unrelated shop vacuum and jewelry cabinet returned in the September 26 verification report.
- Variant and US warehouse inventory are queried from the dedicated CJ endpoints, not inferred from the product-summary response.
- A US-to-US freight estimate is not a ZIP-specific delivery quote. Require buyer destination ZIP, actual landed cost, delivery promise, supplier media permission, merchant authorization and a separately confirmed live checkout before enabling a sale.
- The public review omits API credentials, raw tokens, private customer records, product-level cost and any automatic commercial approval.
- All GitHub workflows remain on GitHub-hosted runners. K1, AGMADMINLPT18 and any other personal computer stay disconnected.

## Monitoring

Visit the repository Actions tab and inspect `PrismBay Free Cloud Operations`, `PrismBay CJ Supplier Verification`, and `Dropshipping Worker Quality`. The CJ report artifact holds detailed checks. The committed `growth-reports/cj-worker-review.json` holds the sanitized rolling blocker board; the growth run artifact holds the dropshipping worker assignments.

A GitHub Actions success indicates only that the scheduled checks ran without a fatal error. Read the board's status before claiming stock, fulfillment readiness, published promotions or earned revenue.

## AI specialists

The existing manually selectable Copilot profiles in `.github/agents/` supply engineering, supplier auditing and growth-analysis instructions when a user opens an authorized Copilot or Codex session. The cloud scripts continue at their existing schedules even when no model API or AI inference credits are available.

## Offline quality checks

`node --test scripts/cj-match-policy.test.mjs scripts/cj-review-board.test.mjs scripts/dropshipping-dispatch.test.mjs`

`CJ_AUDIT_SELF_TEST_ONLY=1` runs the embedded CJ pipeline assertions without using supplier credentials. The `Dropshipping Worker Quality` GitHub workflow runs both the new tests and preexisting candidate-discovery and CJ MCP regression tests.

CJ API reference: https://developers.cjdropshipping.com/en/api/api2/api/product.html
