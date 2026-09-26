# PrismBay: GitHub + Cloudflare free control plane

## Verified live deployment — 26 September 2026 (UTC)

- Cloudflare Worker: https://prismbay-free-control.prismbay-ragunauth.workers.dev/
- Free-sized D1 database: `prismbay-free-control`, deployed and migrated successfully in Cloudflare ENAM.
- `/healthz` and `/v1/status`: verified HTTP 200 with healthy D1.
- Existing GitHub six-hour cloud run: https://github.com/ragunauth123456-maker/PrismBay/actions/runs/36210960044 (successful; Cloudflare report received in D1).
- Reporter token is stored in Cloudflare Workers Secrets and the repository's encrypted GitHub Actions secrets. A separate administrator token is stored in Cloudflare, with a Windows DPAPI-encrypted local recovery copy on K1 under `%APPDATA%\\PrismBay\\cloudflare-admin.dpapi`. Do not commit it, export it into logs, or send it in chat.
- Cloudflare is request-driven and **not** a continuous replacement for the K1 n8n process. No paid Workers feature, VM, or upgrade was requested by this deployment. Verify your Cloudflare account remains on the Workers Free plan.

The steps below document recreating the deployment if necessary. Do not create a duplicate database or overwrite the working deployment.

This complements, rather than replaces, the **existing successful six-hour GitHub Actions workflow** and K1's local n8n. Cloudflare Workers serves a public read-only dashboard and authenticated status API. Cloudflare D1 stores a small run history and an allowlisted task queue. Only the two existing task types can be acknowledged by the next successful GitHub execution.

**Free-plan boundary:** Workers Free has a daily request and CPU budget; D1 Free has database, daily row-read and write limits. Exceeding free limits should result in throttling/errors, not an instruction to upgrade or incur a charge. Do not activate paid Cloudflare features. Cloudflare is request-driven: it cannot host the continuously running n8n process.

## Current status and account ownership

Cloudflare OAuth has been authorized on K1, and the Worker, D1 migration and GitHub reporter integration have been verified live. Future deployments from a different machine require that owner's own Cloudflare authorization. Do not send passwords, account tokens, administrator secrets or MFA codes through GitHub or chat.

## Activate on your authorized K1 Windows machine

1. Open https://dash.cloudflare.com/ and confirm your account is on **Workers Free**. Sign in yourself.
2. From this repository's `deploy/cloudflare-free` folder on K1, run `npx.cmd --yes wrangler@4 login`. Authorize the OAuth screen in K1's browser promptly; the temporary localhost callback times out if left unattended.
3. Run `npx.cmd --yes wrangler@4 whoami`. If no Cloudflare account is shown, do not attempt deployment.
4. Create one free D1 database: `npx.cmd --yes wrangler@4 d1 create prismbay-free-control`. Copy the returned `database_id` into `wrangler.jsonc`, replacing the all-zero placeholder. The database UUID is not a secret.
5. Apply the committed initial migration: `npx.cmd --yes wrangler@4 d1 migrations apply prismbay-free-control --remote`. Verify that both tables exist before proceeding.
6. Deploy the Worker: `npx.cmd --yes wrangler@4 deploy`. Confirm its public `https://...workers.dev` address and that `/healthz` returns healthy.
7. Generate two unrelated, strong random secrets locally. Set `REPORT_TOKEN` and `ADMIN_TOKEN` with separate `npx.cmd --yes wrangler@4 secret put SECRET_NAME` commands. The report token is for GitHub; the admin token stays private to you.

8. In the existing public PrismBay GitHub repository, set two **Actions secrets**: `PRISMBAY_CF_ENDPOINT` (the HTTPS workers.dev base URL) and `PRISMBAY_CF_REPORT_TOKEN` (exactly the same reporter secret from step 7). You can use `gh secret set NAME --repo ragunauth123456-maker/PrismBay` on K1. Do not add the administrator token to GitHub.
9. Use GitHub Actions > **PrismBay Free Cloud Operations** > Run workflow on `main`. Verify `/v1/status` shows the successful run and an updated catalog timestamp; inspect the two-day GitHub artifact when troubleshooting.
10. Open the Worker's HTTPS root URL on your iPad Pro or Xbox browser to view its public, read-only page. Use your separate Tailscale connection for K1 and local n8n administration.

## Controlled task queue

Only `research_refresh` and `health_check` tasks can be queued. An owner with the private `ADMIN_TOKEN` can POST JSON such as `{"kind":"health_check"}` to `/v1/tasks`. GitHub's reporter token cannot create tasks; it can only collect the approved queue at the **start** of the scheduled job and acknowledge those same tasks **after** its research and health checks have passed. Polling does not trigger extra runs: allow up to six hours plus any GitHub scheduler delay. There is no arbitrary-code runner, financial transaction, email sender or automatic social publisher in this service.

## Safety and fallback

The Cloudflare adapter is optional. Until both GitHub secrets are present, it skips cloud polling and reporting while the existing GitHub workers continue normally. A misconfigured endpoint or reporter token fails visibly. No action disables, migrates or duplicates K1 n8n. The public status response contains only run IDs, status, time, published catalog count and the number of pending tasks.

The bound D1 ID in `wrangler.jsonc` initially consists of zeros and **must** be replaced with the ID returned by Cloudflare before production deployment. Test the package without signing in using `npx.cmd --yes wrangler@4 deploy --dry-run` from this directory. Tests: `node --test test/worker.test.mjs ../../scripts/free-cloud-sync.test.mjs` from the deployment folder.

Further reference: https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/ and https://developers.cloudflare.com/d1/get-started/ .
