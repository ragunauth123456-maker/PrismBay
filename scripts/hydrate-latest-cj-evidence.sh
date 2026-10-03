#!/usr/bin/env bash
set -euo pipefail

repo="${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"
api="${GITHUB_API_URL:-https://api.github.com}"
token="${GITHUB_TOKEN:?GITHUB_TOKEN is required}"
mkdir -p growth-reports

headers=(-H "Authorization: Bearer ${token}" -H 'Accept: application/vnd.github+json' -H 'X-GitHub-Api-Version: 2022-11-28')
artifact_id=""
source_run_id=""

check_run() {
  local run_id="$1"
  local json
  json="$(curl -fsSL "${headers[@]}" "${api}/repos/${repo}/actions/runs/${run_id}/artifacts?per_page=50")" || return 1
  local found
  found="$(printf '%s' "$json" | jq -r '.artifacts[] | select(.expired == false and (.name | startswith("paperclip-cj-sourcing-"))) | .id' | head -n1)"
  if [[ -n "$found" && "$found" != "null" ]]; then
    artifact_id="$found"
    source_run_id="$run_id"
    return 0
  fi
  return 1
}

if [[ -n "${CJ_EVIDENCE_RUN_ID:-}" ]]; then
  check_run "$CJ_EVIDENCE_RUN_ID" || true
fi

if [[ -z "$artifact_id" ]]; then
  runs="$(curl -fsSL "${headers[@]}" "${api}/repos/${repo}/actions/workflows/paperclip-cj-sourcing.yml/runs?branch=main&status=success&per_page=20")"
  while read -r run_id; do
    [[ -z "$run_id" ]] && continue
    if check_run "$run_id"; then break; fi
  done < <(printf '%s' "$runs" | jq -r '.workflow_runs[].id')
fi

if [[ -z "$artifact_id" ]]; then
  echo '{"hydrated":false,"reason":"no_successful_cj_artifact_found"}' > growth-reports/cj-evidence-hydration.json
  echo 'No successful CJ sourcing artifact found; control loop will retain research-only fallback behavior.'
  exit 0
fi

curl -fsSL -L "${headers[@]}" "${api}/repos/${repo}/actions/artifacts/${artifact_id}/zip" -o /tmp/prismbay-cj-evidence.zip
unzip -qo /tmp/prismbay-cj-evidence.zip -d growth-reports
jq -n --arg runId "$source_run_id" --arg artifactId "$artifact_id" --arg hydratedAt "$(date -u +%FT%TZ)" '{hydrated:true,sourceRunId:($runId|tonumber),artifactId:($artifactId|tonumber),hydratedAt:$hydratedAt}' > growth-reports/cj-evidence-hydration.json

test -s growth-reports/supplier-commercial-rank.json
echo "Hydrated CJ supplier commercial evidence from run ${source_run_id}, artifact ${artifact_id}."
