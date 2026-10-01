#!/usr/bin/env bash
set -euo pipefail

if [[ "${GITHUB_ACTIONS:-}" != "true" ]]; then
  echo "This helper is for GitHub-hosted Actions only." >&2
  exit 2
fi

BASE_URL="${FREELLMAPI_BASE_URL:-}"
API_KEY="${FREELLMAPI_API_KEY:-}"
MODEL="${FREELLMAPI_MODEL:-auto:fast}"

probe_chat() {
  local base="$1"
  local key="$2"
  local headers="${RUNNER_TEMP}/freellmapi-smoke-headers.txt"
  local body="${RUNNER_TEMP}/freellmapi-smoke-body.json"
  local payload='{"model":"auto:fast","messages":[{"role":"user","content":"Reply with the single word ready."}],"temperature":0,"max_tokens":24}'
  local status
  status="$(curl -sS -D "$headers" -o "$body" -w '%{http_code}' \
    --connect-timeout 10 --max-time 90 \
    -H "Authorization: Bearer $key" \
    -H 'Content-Type: application/json' \
    -X POST "$base/v1/chat/completions" \
    -d "$payload" || true)"
  [[ "$status" == "200" ]] || return 1
  python3 - "$body" <<'PY'
import json, sys
with open(sys.argv[1], encoding="utf-8") as f:
    data=json.load(f)
content=((data.get("choices") or [{}])[0].get("message") or {}).get("content")
if not isinstance(content, str) or not content.strip():
    raise SystemExit(1)
PY
  local routed
  routed="$(awk 'BEGIN{IGNORECASE=1} /^x-routed-via:/{sub(/^[^:]+:[[:space:]]*/,""); sub(/\r$/,""); print; exit}' "$headers")"
  if [[ -n "$routed" ]]; then
    echo "FreeLLMAPI routed smoke request through: $routed"
  else
    echo "FreeLLMAPI smoke request succeeded."
  fi
}

if [[ -n "$BASE_URL" && -n "$API_KEY" ]]; then
  BASE_URL="${BASE_URL%/}"
  if probe_chat "$BASE_URL" "$API_KEY"; then
    {
      echo "FREELLMAPI_BASE_URL=$BASE_URL"
      echo "FREELLMAPI_API_KEY=$API_KEY"
      echo "FREELLMAPI_MODEL=$MODEL"
      echo "FREELLMAPI_CI_MODE=remote"
    } >> "$GITHUB_ENV"
    echo "Using configured FreeLLMAPI endpoint."
    exit 0
  fi
  echo "Configured FreeLLMAPI endpoint did not pass a live smoke test. Starting a run-scoped local router instead."
fi

command -v docker >/dev/null 2>&1 || {
  echo "Docker is required on the GitHub-hosted runner." >&2
  exit 1
}
command -v openssl >/dev/null 2>&1 || {
  echo "OpenSSL is required on the GitHub-hosted runner." >&2
  exit 1
}

CONTAINER="prismbay-freellmapi-${GITHUB_RUN_ID:-$}"
ENC_KEY="$(openssl rand -hex 32)"
UNIFIED_KEY="freellmapi-$(openssl rand -hex 24)"
echo "::add-mask::$UNIFIED_KEY"
CONFIG='{"keys":[{"platform":"kilo","label":"prismbay-ci"},{"platform":"ovh","label":"prismbay-ci"},{"platform":"aihorde","label":"prismbay-ci"}],"routing":{"strategy":"fastest"}}'

cleanup() {
  docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
}
trap cleanup EXIT

docker run -d --rm \
  --name "$CONTAINER" \
  -p 127.0.0.1:3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e HOST=0.0.0.0 \
  -e ENCRYPTION_KEY="$ENC_KEY" \
  -e FREEAPI_CONFIG_JSON="$CONFIG" \
  -e FREELLMAPI_UPDATE_CHECK=off \
  -e FREEAPI_BLOCK_PRIVATE_PROVIDER_URLS=true \
  ghcr.io/tashfeenahmed/freellmapi:latest >/dev/null

for _ in {1..60}; do
  if curl -fsS --max-time 3 http://127.0.0.1:3001/api/ping >/dev/null 2>&1; then
    break
  fi
  sleep 2
done
curl -fsS --max-time 5 http://127.0.0.1:3001/api/ping >/dev/null

key_installed=false
for _ in {1..20}; do
  if docker exec -e UNIFIED_KEY="$UNIFIED_KEY" "$CONTAINER" node -e '
    const Database=require("better-sqlite3");
    const db=new Database("/app/server/data/freeapi.db");
    const key=process.env.UNIFIED_KEY;
    const result=db.prepare("UPDATE settings SET value=? WHERE key=?").run(key,"unified_api_key");
    if (!result.changes) db.prepare("INSERT INTO settings(key,value) VALUES(?,?)").run("unified_api_key",key);
    db.close();
  ' >/dev/null 2>&1; then
    key_installed=true
    break
  fi
  sleep 1
done
if [[ "$key_installed" != "true" ]]; then
  echo "FreeLLMAPI started, but its run-scoped unified key could not be installed." >&2
  docker logs --tail 80 "$CONTAINER" 2>&1 | sed -E 's/freellmapi-[A-Za-z0-9]+/[redacted-key]/g' || true
  exit 1
fi

MODELS_FILE="$RUNNER_TEMP/freellmapi-models.json"
models_ready=false
for _ in {1..30}; do
  status="$(curl -sS -o "$MODELS_FILE" -w '%{http_code}' --max-time 10 \
    -H "Authorization: Bearer $UNIFIED_KEY" \
    http://127.0.0.1:3001/v1/models || true)"
  if [[ "$status" == "200" ]] && python3 - "$MODELS_FILE" <<'PY'
import json, sys
with open(sys.argv[1], encoding="utf-8") as f:
    data=json.load(f)
rows=data.get("data")
raise SystemExit(0 if isinstance(rows, list) and len(rows) > 0 else 1)
PY
  then
    models_ready=true
    break
  fi
  sleep 3
done

if [[ "$models_ready" != "true" ]]; then
  echo "FreeLLMAPI started, but its free model catalog did not become routable." >&2
  docker logs --tail 80 "$CONTAINER" 2>&1 | sed -E 's/freellmapi-[A-Za-z0-9]+/[redacted-key]/g' || true
  exit 1
fi

smoke_ok=false
for _ in {1..4}; do
  if probe_chat "http://127.0.0.1:3001" "$UNIFIED_KEY"; then
    smoke_ok=true
    break
  fi
  sleep 5
done
[[ "$smoke_ok" == "true" ]] || {
  echo "FreeLLMAPI free-provider routing did not pass the live chat smoke test." >&2
  docker logs --tail 80 "$CONTAINER" 2>&1 | sed -E 's/freellmapi-[A-Za-z0-9]+/[redacted-key]/g' || true
  exit 1
}

{
  echo "FREELLMAPI_BASE_URL=http://127.0.0.1:3001"
  echo "FREELLMAPI_API_KEY=$UNIFIED_KEY"
  echo "FREELLMAPI_MODEL=auto:fast"
  echo "FREELLMAPI_CI_MODE=ephemeral-keyless"
} >> "$GITHUB_ENV"

trap - EXIT
echo "$CONTAINER" > "$RUNNER_TEMP/freellmapi-container-name"
echo "FreeLLMAPI is live for this workflow run with keyless free providers."
