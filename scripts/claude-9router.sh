#!/usr/bin/env bash
# Optional 9Router gateway wrapper. No credentials are written to disk.
set -euo pipefail

mode="${1:---check}"
base="${NINE_ROUTER_BASE_URL:-http://127.0.0.1:20128/v1}"
base="${base%/}"

case "$base" in
  http://127.0.0.1:20128/v1|http://localhost:20128/v1|https://*/v1) ;;
  *) echo "Only localhost HTTP or a remote HTTPS /v1 endpoint is accepted." >&2; exit 2 ;;
esac
case "$mode" in --check|--models|--run) ;; *) echo "Usage: bash scripts/claude-9router.sh [--check|--models|--run <claude arguments>]" >&2; exit 2 ;; esac

for binary in curl node; do
  command -v "$binary" >/dev/null || { echo "Missing $binary" >&2; exit 2; }
done
: "${NINE_ROUTER_API_KEY:?Set NINE_ROUTER_API_KEY privately using your 9Router dashboard endpoint key.}"
if [[ "$mode" == "--run" ]]; then
  command -v claude >/dev/null || { echo "Install Claude Code on the approved cloud host first." >&2; exit 2; }
  : "${NINE_ROUTER_MODEL:?Set NINE_ROUTER_MODEL to an ID listed by --models for an authorized free provider.}"
fi

health_base="${base%/v1}"
health_ok=0
for health_url in "$health_base/api/health" "$health_base/health"; do
  if curl --fail --silent --show-error --max-time 8 "$health_url" >/dev/null 2>&1; then
    health_ok=1
    break
  fi
done
if [[ "$health_ok" -ne 1 ]]; then
  echo "9Router health check failed; verify the private gateway is running." >&2
  exit 1
fi
models="$(curl --fail --silent --show-error --max-time 12 -H "Authorization: Bearer ${NINE_ROUTER_API_KEY}" "$base/models")" || {
  echo "Unable to list gateway models. Check the private endpoint key." >&2
  exit 1
}
MODEL_LIST_JSON="$models" ROUTER_MODEL="${NINE_ROUTER_MODEL:-}" node -e '
let payload;
try { payload=JSON.parse(process.env.MODEL_LIST_JSON); } catch { console.error("Invalid gateway model response"); process.exit(1); }
const ids=Array.isArray(payload.data)?payload.data.map(x=>x.id).filter(x=>typeof x==="string"):[];
if (!ids.length) { console.error("No models available. Connect an approved free provider in 9Router."); process.exit(1); }
if (process.argv[1]==="--models") console.log(ids.join("\n"));
const selected=process.env.ROUTER_MODEL;
if (selected && !ids.includes(selected)) { console.error("Selected model is not advertised by this gateway."); process.exit(1); }
' -- "$mode"

if [[ "$mode" == "--check" || "$mode" == "--models" ]]; then
  [[ "$mode" == "--check" ]] && echo "Router reachable and model catalog available; no model request sent."
  exit 0
fi

# Use a gateway credential instead of a saved Anthropic API key for this process.
export ANTHROPIC_BASE_URL="$base"
export ANTHROPIC_AUTH_TOKEN="$NINE_ROUTER_API_KEY"
export ANTHROPIC_MODEL="$NINE_ROUTER_MODEL"
unset ANTHROPIC_API_KEY
shift
exec claude --model "$NINE_ROUTER_MODEL" "$@"
