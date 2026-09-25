# PrismBay revenue-health automation: n8n + GitHub

**Installed and published on K1:** n8n workflow `prismbayRevenueWatch20260925`, named `PrismBay | Paid Store and Viral Catalog Revenue Watch`, running n8n 2.40.5. Definition: [n8n-prismbay-revenue-watch.json](./n8n-prismbay-revenue-watch.json). The local n8n UI listens on `127.0.0.1:5678`, not a publicly exposed webhook.

## Active workflow

Every six hours, the Schedule Trigger fetches the public [professional toolkits storefront](https://ragunauth123456-maker.github.io/PrismBay/toolkits.html), validates four exact existing Stripe-hosted checkout links and the published support/refund routes, then reads the GitHub-hosted `public/viral-catalog.json`. The Code node checks that at least nine approved physical products are present and that the catalog is less than 24 hours old. A missing checkout link, stale data, broken site, or failed HTTP request marks the n8n execution failed; successful executions show a timestamped status and top three public-news attention products. Attention signals do not equal sales or TikTok rankings.

The workflow has no Stripe secret, does not read financial transactions, does not create purchases, does not fulfill orders, and does not publish social posts. Its n8n `errorWorkflow` is wired to the existing active JARVIS error handler (`jarvis05db28a6f9fa04`), which records failed production executions into the local JARVIS event bridge. n8n execution history remains the source of detailed failure evidence. This is a local failure-event route, not proof of external email/SMS delivery.

## K1 availability and commands

Windows Task Scheduler job `PrismBay n8n Service` starts `C:\PrismBayN8n.cmd` at user login only if n8n is not already listening. K1 must remain powered on and logged in for scheduled checks.

```cmd
n8n import:workflow --input=scripts\n8n-prismbay-revenue-watch.json
n8n publish:workflow --id=prismbayRevenueWatch20260925
set N8N_RUNNERS_BROKER_PORT=5689
n8n execute --id=prismbayRevenueWatch20260925 --rawOutput
```

Restart the n8n server after publish so the schedule reloads. A live test of the paid-site and GitHub-catalog validation succeeded before publishing. The local n8n listener returned HTTP 200 after restart.

## Commercial boundaries

Four existing paid digital products and their ZIP download endpoints have been audited separately. The physical storefront remains subject to real supplier stock, shipping, per-order delivery and CJ authorization. Owner-authorized TikTok posting is not connected to this n8n instance. For sales results, check the connected Stripe account; a successful site check does not imply revenue.
