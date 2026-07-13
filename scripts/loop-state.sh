#!/usr/bin/env bash
set -euo pipefail

# Emit JSON describing what the autonomous controller should do next.
# See docs/agents/autonomous-workflow.md

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

EVALUATOR_MARKER='<!-- wayfarer-evaluator -->'

json_escape() {
  python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))' <<<"$1"
}

# Gate #171 blocks AI Prompt, Spatial Canvas, and Inbox promotion roots.
GATED_ISSUES=(142 145 151)

is_gated_issue() {
  local n="$1"
  for gated in "${GATED_ISSUES[@]}"; do
    if [[ "$n" == "$gated" ]]; then
      return 0
    fi
  done
  return 1
}

# Open PR whose head branch is codex/issue-* or cursor/wayfarer-controller-loop-*.
ACTIVE_PR_JSON="$(gh pr list --state open \
  --json number,title,headRefName,url,comments \
  --jq '[.[] | select(.headRefName | test("^(codex/issue-|cursor/wayfarer-controller-loop-)"))] | first')"

if [[ "$ACTIVE_PR_JSON" != "null" && -n "$ACTIVE_PR_JSON" ]]; then
  PR_NUMBER="$(jq -r '.number' <<<"$ACTIVE_PR_JSON")"
  PR_URL="$(jq -r '.url' <<<"$ACTIVE_PR_JSON")"
  BRANCH="$(jq -r '.headRefName' <<<"$ACTIVE_PR_JSON")"

  FAIL_BODY="$(gh pr view "$PR_NUMBER" --json comments --jq \
    '[.comments[] | select(.body | test("FAIL"; "i")) | .body] | last // empty')"

  if [[ -n "$FAIL_BODY" ]]; then
    ISSUE_NUM="$(sed -n 's/.*#\([0-9][0-9]*\).*/\1/p' <<<"$FAIL_BODY" | head -1)"
    if [[ -z "$ISSUE_NUM" ]]; then
      ISSUE_NUM="$(sed -n 's/^codex\/issue-\([0-9][0-9]*\).*/\1/p' <<<"$BRANCH")"
    fi
    jq -n \
      --arg action repair \
      --argjson pr "$PR_NUMBER" \
      --arg pr_url "$PR_URL" \
      --arg branch "$BRANCH" \
      --arg issue "${ISSUE_NUM:-}" \
      '{action: $action, pr: $pr, pr_url: $pr_url, branch: $branch, issue: ($issue | if . == "" then null else tonumber end)}'
    exit 0
  fi

  jq -n \
    --arg action wait_evaluator \
    --argjson pr "$PR_NUMBER" \
    --arg pr_url "$PR_URL" \
    --arg branch "$BRANCH" \
    '{action: $action, pr: $pr, pr_url: $pr_url, branch: $branch}'
  exit 0
fi

# No active PR — pick lowest-numbered ready-for-agent issue not in-progress or gated.
# Note: gh --label filter is unreliable with the automation token; filter via jq instead.
CANDIDATE=""
while IFS=$'\t' read -r num title body; do
  if is_gated_issue "$num"; then
    continue
  fi
  if grep -qx 'in-progress' <<<"$(gh issue view "$num" --json labels --jq '.labels[].name')"; then
    continue
  fi
  blocked="$(sed -n 's/.*Blocked by[^#]*#\([0-9][0-9]*\).*/\1/p' <<<"$body" | head -1)"
  if [[ -n "$blocked" ]]; then
    state="$(gh issue view "$blocked" --state all --json state --jq '.state' 2>/dev/null || echo OPEN)"
    if [[ "$state" != "CLOSED" ]]; then
      continue
    fi
  fi
  CANDIDATE="${num}"$'\t'"${title}"
  break
done < <(gh issue list --state open \
  --json number,title,labels,body \
  --limit 200 \
  --jq 'sort_by(.number) | .[] | select([.labels[].name] | index("ready-for-agent")) | "\(.number)\t\(.title)\t\(.body)"')

if [[ -z "$CANDIDATE" ]]; then
  jq -n --arg action idle '{action: $action, reason: "no claimable ready-for-agent issues"}'
  exit 0
fi

ISSUE_NUM="${CANDIDATE%%$'\t'*}"
ISSUE_TITLE="${CANDIDATE#*$'\t'}"
SLUG="$(printf '%s' "$ISSUE_TITLE" | tr '[:upper:]' '[:lower:]' | sed -E 's/^\[[^]]+\][[:space:]]*//; s/[^a-z0-9]+/-/g; s/^-+|-+$//g' | cut -c1-48)"
BRANCH="codex/issue-${ISSUE_NUM}-${SLUG}"

jq -n \
  --arg action claim_new \
  --argjson issue "$ISSUE_NUM" \
  --arg branch "$BRANCH" \
  --arg title "$ISSUE_TITLE" \
  '{action: $action, issue: $issue, branch: $branch, title: $title}'
