#!/usr/bin/env bash
# Lightweight production supervisor for the PrismBay server.
# The supervisor, not the application, owns the server PID. It intentionally
# starts serve.ts directly (no rebuild) so recovery is fast and low-memory.
set -u

SITE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
RUN_DIR="$SITE_DIR/.run"
LOCK_FILE="$RUN_DIR/watchdog.lock"
LOG_FILE="$RUN_DIR/watchdog.log"
HEALTH_URL="http://127.0.0.1:3000/"
MAX_BACKOFF=60

mkdir -p "$RUN_DIR"
# flock is atomic and releases automatically if this process is killed, unlike
# a PID/lock-directory check. This also makes publish.sh safe under races.
exec 9>"$LOCK_FILE"
flock -n 9 || exit 0

backoff=1
while :; do
  if ! curl -fsS --max-time 5 -o /dev/null "$HEALTH_URL"; then
    # serve.ts frees :3000 itself, making this safe after a partial publish.
    (cd "$SITE_DIR" && set -a; source "$RUN_DIR/server.env" 2>/dev/null || true; set +a; nohup bun run start >>"$RUN_DIR/server.log" 2>&1 & echo $! > "$RUN_DIR/server.pid")
    sleep 1
    if curl -fsS --max-time 5 -o /dev/null "$HEALTH_URL"; then
      backoff=1
    else
      printf '%s server did not become healthy; retrying in %ss\n' "$(date -Is)" "$backoff" >> "$LOG_FILE"
      sleep "$backoff"
      (( backoff < MAX_BACKOFF )) && backoff=$((backoff * 2))
      continue
    fi
  fi
  sleep 5
  # A healthy endpoint resets the crash backoff; repeated crashes still have
  # an upper bound, preventing a busy restart loop.
done
