#!/usr/bin/env bash
# Run on an authorized OCI VM after Tailscale installation and login.
set -euo pipefail
if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run: sudo bash /opt/prismbay/source/deploy/oracle-free/activate.sh" >&2
  exit 2
fi
command -v docker >/dev/null || { echo "Docker not installed; check cloud-init." >&2; exit 3; }
command -v tailscale >/dev/null || { echo "Install and enroll Tailscale before activation." >&2; exit 4; }
docker compose version >/dev/null || { echo "Docker Compose plugin is missing." >&2; exit 5; }
fqdn="$(tailscale status --json | python3 -c 'import json,sys; print((json.load(sys.stdin).get("Self") or {}).get("DNSName","").rstrip("."))')"
if [[ -z "$fqdn" || "$fqdn" != *.ts.net ]]; then
  echo "Tailscale is not enrolled or MagicDNS is unavailable. Run sudo tailscale up." >&2
  exit 6
fi
cd /opt/prismbay/source/deploy/oracle-free
umask 077
if [[ ! -e .env ]]; then
  password="$(openssl rand -hex 32)"
  encryption="$(openssl rand -hex 32)"
  printf 'POSTGRES_PASSWORD=%s\nN8N_ENCRYPTION_KEY=%s\nN8N_HOST=%s\n' "$password" "$encryption" "$fqdn" > .env
fi
chmod 600 .env
# Bind n8n to localhost; private HTTPS entry is Tailscale Serve, not Funnel.
docker compose --env-file .env up -d
docker compose ps
curl --fail --silent --show-error --retry 15 --retry-delay 3 http://127.0.0.1:5678/healthz
tailscale serve --bg http://127.0.0.1:5678
tailscale serve status
echo "The private n8n URL is https://$fqdn/"
echo "Check tailnet access, create your owner account, and test workflows before moving K1 schedules."
