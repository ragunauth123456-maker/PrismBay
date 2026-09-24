# PrismBay Clean physical order ingestion

Dedicated Node 24 ESM service. Reuses the repository's Stripe dependency range; no new paid dependency. The existing `src/routes/api/webhooks/stripe.ts` and `src/data/products.ts` belong to PrismBay AI digital downloads and are not used. The repository has no root README.md; README-WATCHDOG.md was reviewed. Nothing here changes Railway STORE_B64 or deploys a service.

## Local setup and verification

Run from `services/physical-orders`:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm start
```

On Windows use `npm.cmd`. Tests use synthetic signed payloads and an ephemeral localhost HTTP listener, never Stripe APIs. Node 24 is required. The local start command requires the environment below with `PROD=false`, `STRIPE_LIVE_MODE=false`, a test signing secret and an imported local catalog. Default DATA_DIR is `data` relative to the working directory.

## Production configuration (not deployed)

Register the exact route **`https://<dedicated-physical-orders-service-host>/webhooks/stripe`**, POST, in **the LIVE PrismBay Clean account**, as an account-scoped snapshot event destination. The hostname cannot be specified until a dedicated host exists. Do not use the AI storefront's `/api/webhooks/stripe` or register this against that account. Subscribe to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `payment_intent.succeeded`

Use these exact server environment names:

| Variable | Production value |
| --- | --- |
| `PROD` | `true` |
| `STRIPE_LIVE_MODE` | `true` |
| `STRIPE_WEBHOOK_SECRET` | Dedicated LIVE endpoint signing secret from PrismBay Clean; secret manager only |
| `PHYSICAL_CATALOG_PATH` | Absolute path to the verified physical-app catalog JSON export |
| `DATA_DIR` | `/data/physical-orders` |
| `PERSISTENT_VOLUME_PATH` | `/data`, the actual mounted persistent volume |
| `PERSISTENT_STORAGE_CONFIRMED` | `true`, only after an operator verifies volume durability |
| `PORT` | Platform-assigned port, default `3001` |

No Stripe API key is required. No outbound Stripe event, catalog, or customer calls occur. Direct account events do not contain an account ID: account isolation relies on the dedicated signing secret and operator-selected account, not an unverifiable API lookup. Connect events with a different account ID and events with the wrong live/test mode are rejected.

GET `/health` returns process liveness only, not disk readiness. Terminate TLS at the platform proxy. Requests are limited to 1 MiB with timeouts. Return 200 only after durable commit; write failures return 500 so Stripe retries. Signature verification uses untouched bytes and the SDK's 300-second tolerance. See [Stripe webhook documentation](https://docs.stripe.com/webhooks).

## Import the physical catalog before production

The physical app was not available from this environment, and this worktree contains no authoritative physical Stripe ID export. **No live mapping has been fabricated or imported. Production startup rejects the empty example.** Copy `catalog.example.json` to an operator-controlled path, then populate it from the physical app's server-side Stripe configuration, confirming the LIVE account ID and every mapping in that account. Do not commit exports containing secrets or customer data.

Schema example (synthetic ID, not a working payment link):

```json
{
  "store": "PrismBay Clean",
  "accountId": "acct_REPLACEFROMPHYSICALAPP",
  "source": "Physical app export, reviewed date and revision",
  "mappings": [
    { "stripeId": "plink_SYNTHETICONLY", "items": [{ "sku": "scrubber", "quantity": 1 }] }
  ]
}
```

Only these SKUs are accepted: `scrubber`, `pethair`, `crevice`, `pressure-washer`, `mattress-vacuum`, `garment-steamer`, `mini-mop`, `drain-catcher`, `home-caddy`. Map all nine products and the bundle. A bundle maps to its explicitly verified constituent SKUs and quantities; never invent bundle composition or a tenth SKU.

Each unique `stripeId` can be `plink_`, `price_`, or `prod_`. Payment-link mapping represents the **entire fixed basket**. Only allowlist fixed-quantity links without optional items, adjustable quantities, or upsells; otherwise omit that link and use complete line-item price/product mappings. Review mappings whenever a link is edited. Typical Checkout webhooks omit line items, so price-only configurations commonly remain `needs_review`; no outbound enrichment is attempted. Expanded line items must be complete (`has_more:false`), and every line must map. Descriptions, names, metadata SKU claims, client references, and public `buy.stripe.com` URL tokens are never used to infer a SKU or Stripe object ID. Unknown or incomplete baskets stay in review.

## Ledger and fulfillment operations

One process and one replica only. Transactions serialize a versioned event ledger and purchase records into a single snapshot, fsync the temporary file, atomically rename, and fsync the directory on Linux. A writer lock prevents concurrent processes. File permissions are 0600, directory 0700 where supported. Windows development cannot fsync directory entries; production is Linux. PROD requires a separate mounted filesystem, rejects overlay/tmpfs/ramfs and missing mount evidence, and requires an operator durability attestation. A mount check cannot itself prove provider durability. Use a persistent Railway volume or replace this ledger with a transactional database before deploying on ephemeral/multi-replica infrastructure.

Back up the volume securely and test restoration. After an unclean shutdown the lock deliberately remains: stop all writers, inspect ledger integrity and backup, then remove only `writer.lock` before restart. Never automatically remove a potentially live writer's lock. Unacknowledged events can be retried after recovery; temporary files are not committed state. A failed write poisons the writer until restart. Corrupt JSON fails startup. Ledger size is unbounded and each transaction rewrites it; migrate to a database for sustained volume. Do not prune event IDs without a reconciliation policy.

PaymentIntent success is provisional `needs_review/awaiting_checkout`, never a second fulfillment queue entry. Checkout wins when both share a payment intent ID, in either delivery order. Paid payment-mode Checkout, positive amount, USD, trusted basket, and a complete US shipping address (50 states/DC, ZIP format) are required for `manual_fulfillment`. Unpaid Checkout is recorded without queuing; asynchronous paid Checkout can subsequently queue it. Missing payment intent, unknown mapping, non-US/missing shipping and conflicting sessions require review. Validation is syntactic, not address deliverability or fraud verification. A no-payment-intent session cannot safely reconcile to a separate intent until a later Checkout includes it.

The ledger retains only Stripe IDs, amounts, approved items and review state. It deliberately does not retain raw events, names, emails, addresses or arbitrary error messages. Logging uses fixed codes only. Operators retrieve customer shipping information through authorized Stripe Dashboard access when manually fulfilling. Keep DATA_DIR outside Git in production; the default local data directory is ignored. No admin/PII HTTP endpoint is exposed. Read the ledger on the secured host for the manual queue. Refunds/disputes and supplier status reconciliation are outside this ingestion service; check current payment status before manual shipment. Nothing marks an order fulfilled.

## CJ safety boundary

`cj.mjs` is an inert server-side interface with simulated tests. Its optional environment is `CJ_INTEGRATION_AUTHORIZED=true`, `CJ_ACCESS_TOKEN`, and `CJ_SESSION_ID` from an explicitly authorized official authenticated CJ session. Leave these unset while that session is absent. Readiness also requires inventory, freight, price and US country checks. These flags are an interface for future verified checks, not proof of live supplier availability. Even with all checks set, `createOrder()` always rejects: there is no network transport, stock purchasing or automatic fulfillment. A real connector needs separately authorized integration, official credential validation, fresh SKU/variant inventory and landed-cost checks, and supplier idempotency before any supplier write is implemented.
