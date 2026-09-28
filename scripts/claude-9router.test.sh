#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
bash -n scripts/claude-9router.sh
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
cat > "$tmp/curl" <<'SH'
#!/usr/bin/env bash
last="${*: -1}"
case "$last" in
  */health) printf '{"status":"ok"}' ;;
  */models) printf '{"data":[{"id":"opencode/test-free"}]}' ;;
  *) exit 1 ;;
esac
SH
cat > "$tmp/claude" <<'SH'
#!/usr/bin/env bash
test "$ANTHROPIC_BASE_URL" = "http://127.0.0.1:20128/v1"
test "$ANTHROPIC_MODEL" = "opencode/test-free"
test "$ANTHROPIC_AUTH_TOKEN" = "offline-test-key"
test -z "${ANTHROPIC_API_KEY:-}"
test "$1" = "--model"
test "$2" = "opencode/test-free"
test "$3" = "--print"
printf 'CLAUDE_STUB_OK\n'
SH
chmod +x "$tmp/curl" "$tmp/claude"
export PATH="$tmp:$PATH"
export NINE_ROUTER_API_KEY="offline-test-key"
export NINE_ROUTER_MODEL="opencode/test-free"
export ANTHROPIC_API_KEY="unrelated-local-key"
bash scripts/claude-9router.sh --check
[[ "$(bash scripts/claude-9router.sh --models)" == "opencode/test-free" ]]
[[ "$(bash scripts/claude-9router.sh --run --print 'hello')" == "CLAUDE_STUB_OK" ]]
if NINE_ROUTER_BASE_URL="http://example.com/v1" bash scripts/claude-9router.sh --check >/dev/null 2>&1; then
  echo "FAIL: remote HTTP should be rejected" >&2
  exit 1
fi
if NINE_ROUTER_MODEL="missing-model" bash scripts/claude-9router.sh --check >/dev/null 2>&1; then
  echo "FAIL: unadvertised model should be rejected" >&2
  exit 1
fi
echo "PASS: offline gateway wrapper checks"
