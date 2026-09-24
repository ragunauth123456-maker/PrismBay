# Official CJ supplier scout

Run `node scripts/cj-mcp-scout.mjs`. With no official session it writes
`.run/cj-supplier-research.json`, prints login requirements, and exits zero.
This ignored local queue is separate from public candidate/catalog data.
No account login or supplier purchase is performed by this script.

## One-time owner authentication

1. In Codex/VSCode, enable the existing **CJMCP** stdio configuration pointing to
   `C:\Users\Fano Faizul\CJ-MCP\dist\mcp-server\index.cjs`. Preserve its existing
   custom `TOKEN_ENCRYPT_KEY`. Do not print it or put it in this repository.
2. In VS Code Copilot with MCP Apps enabled, ask the connected assistant to use **CJMCP's `wait_for_login` tool with `{"timeout":30}`**. Enter credentials and complete any verification only in the official popup. `show_login_form` displays text guidance, not a popup; Codex CLI cannot display the MCP Apps login UI. Use the VS Code popup for the owner login, or follow CJ's official secure API-token setup. Do not paste passwords into ChatGPT, GitHub or repository files.
3. The official server persists `.cj-mcp-token` in `HOME`, falling back to
   `USERPROFILE`. Use the same OS account and home for the runner. The scout
   only stats this path; it never opens, decrypts, or exports the session.
4. Supply the **same existing encryption key** securely to the runner's process
   environment as `TOKEN_ENCRYPT_KEY`. Codex's per-server environment is not
   automatically inherited by standalone scheduled scripts. The scout deliberately
   does not read the secret-bearing Codex config. Missing key blocks execution.
5. Set `CJ_MCP_ENABLE=1`. Optionally set `CJ_MCP_SERVER` to the absolute official
   server entry path; otherwise the sibling `../CJ-MCP/dist/mcp-server/index.cjs`
   is used (the K1 layout). This is the scout's server configuration, independent
   of the Codex registration. Run the command above again.

The runner checks flag, session, entry file, and key before invoking research.
Scout failures are warning-only in the loop. An expired session produces failed
official checks: reopen `show_login_form`; the scout never logs in automatically.
Only the official server manages token refresh. Production mode is forced because
the official test mode may write a plaintext debugging token file.

## Verification and limits

Inspected official local source: `src/mcp-server/tools/product.tool.ts`,
`logistics.tool.ts`, `stock.tool.ts`, `src/auth/token-store.ts`, and `config/env.ts`.
Public inventory uses `query_cj_inventory`, not private-stock tools.
At runtime paginated `tools/list` supplies schemas; each allowlisted call validates
its arguments against the discovered schema. Missing tools, changed parameters,
tool errors and unknown response shapes fail closed. No write/order tools are allowed.

Research covers five highest-attention explicitly unlisted candidate slugs,
three search results per category and three variants per product. Search filters
are discovery hints, never proof. Detail must match the product, variants must
identify the product, and stock rows must identify the variant, US country and
positive `totalVerifiedInventory`. Costs must be positive scalar
`variantSellPrice` values. Freight is quoted for one exact variant US to US at an
owner-supplied ZIP; carrier and aging must also match official timeliness results.
Missing or unfamiliar stock wrappers/fields remain unverified until reviewed
against authenticated official evidence; this first version has no live response
validation because login has not been authorized. Test response fixtures are
synthetic contracts, not claims about observed live CJ results.

All call arguments, start/completion timestamps, discovered schemas and the
allowlisted fields used in decisions are retained. Raw responses and errors are
never logged; unrelated payload fields, including credentials, are omitted.
Evidence is a run-time snapshot, not a reservation or a promise of availability.
Repeat verification before any future authorized commerce operation.

Set `CJ_MCP_POLICY` to an owner-maintained local JSON path for estimates, e.g.:

```json
{
  "zip": "10001",
  "retailUsd": 29.95,
  "handlingDays": [2, 4],
  "paymentFees": {
    "percent": 3.5,
    "fixedUsd": 0.35,
    "source": "Replace with owner-confirmed applicable processor fee schedule",
    "checkedAt": "2026-09-24T00:00:00.000Z"
  }
}
```

These are illustrative assumptions, not verified Stripe rates. Supply applicable
fees and realistic handling days yourself. Transit must be an explicit 1–30 day
range; handling adds 1–14 days. Missing policy blocks supplier readiness. Estimates
are for the sampled destination and quantity, not nationwide shipping guarantees.
`supplierReady` applies only to variants passing all checks; product readiness means
at least one such variant. `saleReady` always remains false. Listings, Stripe prices,
CJ orders and live payment authorization require a separate owner-approved workflow.

No paid APIs, installs or subscriptions are required. SDK imports resolve from the
official server installation; K1 has `@modelcontextprotocol/sdk@1.29.0`. No package
dependency change or npm install is needed. Portable installations need Node and
the official server with its SDK installed separately. Tests inject a mock client;
the SDK smoke check imports local classes only, without starting a server or network.

Validation: `node --test scripts/*.test.mjs` and `git diff --check`.
