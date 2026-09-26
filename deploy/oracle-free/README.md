# PrismBay free cloud deployment

GitHub Actions supplies free scheduled computers for the existing public-data PrismBay scripts. It does not keep n8n running continuously. The Oracle files are an optional deployment template, not evidence that an Oracle VM exists.

## GitHub Actions, no VM required

1. The validated workflow is preserved in `deploy/oracle-free/cloud-workers.yml.example` while GitHub's one-time `workflow` OAuth permission is pending. After approval, publish the identical file to `.github/workflows/free-cloud-ops.yml`, check the branch workflow run, and merge the pull request into `main`.
2. Open GitHub Actions > PrismBay Free Cloud Operations > Run workflow for a first manual execution on `main`.
3. Check the summary and two-day execution artifact. A scheduled run then starts approximately every six hours; scheduled starts are best-effort.
4. The workflow refreshes the nine-product public-news catalog with the existing PrismBay research script. Only successful scheduled or manual runs on `main` commit the refreshed catalog. A stale or incomplete catalog fails verification.
5. K1's current n8n service and workflows stay intact until the optional remote n8n instance is tested and deliberately switched over.

Cloud workers do not send emails, order products, process payments, or publish social posts. Public-news attention scores are not actual sales or TikTok rankings.

## Optional 24/7 n8n on Oracle Always Free

Oracle Free Tier grants a limited pool of ARM Ampere A1 compute resources, subject to home-region availability and idle-instance reclamation. Verify current published limits and choose only resources marked **Always Free eligible**. Do not create paid resources.

1. In an Oracle Cloud account, provision a free-eligible Ubuntu ARM64 VM, with no more than the Always Free allowances. Restrict SSH ingress to your own address. Do not expose TCP 5678 or PostgreSQL publicly.
2. Install Docker Engine and Compose using Docker's official Ubuntu instructions, then install Tailscale using its official Linux instructions and enroll the VM into your private tailnet.
3. On the VM clone this repo, enter `deploy/oracle-free`, then copy `.env.example` to `.env`.
4. Run `openssl rand -hex 32` twice and use different generated secrets for `POSTGRES_PASSWORD` and `N8N_ENCRYPTION_KEY`. Replace `N8N_HOST` with your Tailscale device HTTPS hostname, omitting the scheme.
5. Run `docker compose --env-file .env up -d`. Verify `docker compose ps` and `curl -fsS http://127.0.0.1:5678/healthz`.
6. Enable Tailscale HTTPS for the tailnet, then run `sudo tailscale serve --bg http://127.0.0.1:5678`. Confirm private routing with `tailscale serve status`. Never enable Funnel for the n8n editor.
7. From your Tailscale-connected iPad Pro, visit the device's HTTPS `ts.net` address. Create n8n owner credentials with strong authentication.
8. Export K1 workflows with the local n8n CLI. Import their definitions into the cloud instance, re-create credentials privately, and import the existing error workflow first.
9. Manually test each workflow, then disable its old K1 schedule before enabling the same schedule remotely. Keep all payment, outbound email, and publishing actions disabled until separately verified.
10. Set up and test backups for n8n and PostgreSQL volumes before any business-critical migration.

External webhooks require separately reviewed public HTTPS ingress with signature validation. Never expose the n8n editor or database over the public internet.

Remote Desktop Commander stays on K1. The iPad Pro is the primary mobile admin interface. The Xbox Series X is optional for viewing a separately secured, read-only dashboard.

## Provisioning status

This repository contains no Oracle tenancy, instance, SSH keys, Tailscale enrollment, or API secrets. Cloud VM provisioning and final sign-in require authorized access to those services. GitHub Actions runners are short-lived and do not replace a continuously running server.