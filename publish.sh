#!/usr/bin/env bash
# Rebuild the site and (re)start the production server on port 3000.
# Build runs in the foreground so errors surface; the server is launched in a new
# session (setsid) so it keeps running after this script — and your shell — exits.
# serve.ts frees the port (across user boundaries, retrying on races) before
# binding, so this is safe to re-run no matter who started the current server.
set -euo pipefail
cd "$(dirname "$0")"

# Group-writable so any team member can publish over another member's build.
umask 002
mkdir -p .run

# The workspace starts as sources only (the coming-soon placeholder serves from
# the image's pre-built copy), so the first publish installs deps here. No-op
# once node_modules is current.
bun install
bun run build
# Persist env vars so the watchdog can recover the full environment.
# Only overwrite when DATABASE_URL is present (platform-managed publish).
if [ -n "${DATABASE_URL:-}" ]; then
  cat > .run/server.env <<ENVEOF
DATABASE_URL=${DATABASE_URL:-}
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY:-}
STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET:-}
RESEND_API_KEY=${RESEND_API_KEY:-}
EMAIL_FROM=${EMAIL_FROM:-}
SITE_URL=${SITE_URL:-}
ENVEOF
fi
# If we have a persisted env file, use it; otherwise rely on the current environment.
if [ -s .run/server.env ]; then
  setsid nohup bash -c 'set -a; source .run/server.env; set +a; bun run start' > .run/server.log 2>&1 < /dev/null &
else
  setsid nohup bun run start > .run/server.log 2>&1 < /dev/null &
fi

# Wait for the new server to actually answer before reporting success, so a
# startup crash surfaces here instead of silently leaving the old page live.
for _ in $(seq 1 50); do
  if curl -sf -o /dev/null http://localhost:3000; then
    # Keep the production server available after an unexpected process exit.
    # The watchdog is idempotent and does not rebuild during recovery.
    setsid nohup bash ./scripts/watchdog.sh >> .run/watchdog.log 2>&1 < /dev/null &
    echo "site published; serving on port 3000 (watchdog enabled)"
    exit 0
  fi
  sleep 0.2
done
echo "warning: published, but the server isn't responding — check .run/server.log" >&2
exit 1
