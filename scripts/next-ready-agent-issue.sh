#!/usr/bin/env bash
# Pick the next eligible ready-for-agent issue (unblocked, no open PR).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

MODE="${1:---print}"

if ! command -v gh >/dev/null 2>&1; then
  echo "error: gh CLI is required" >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "error: jq is required" >&2
  exit 1
fi

ISSUES_JSON="$(gh issue list \
  --label "ready-for-agent" \
  --state open \
  --json number,title,body,url \
  --limit 100)"

OPEN_PRS_JSON="$(gh pr list \
  --state open \
  --json number,closingIssuesReferences \
  --limit 100)"

extract_blockers() {
  local body="$1"
  if echo "$body" | grep -qi "none - can start immediately"; then
    return 0
  fi
  echo "$body" | awk '
    /^## Blocked by$/ { in_block=1; next }
    /^## / { in_block=0 }
    in_block { print }
  ' | grep -oE '#[0-9]+' | sed 's/#//' || true
}

issue_is_open() {
  local num="$1"
  local state
  state="$(gh issue view "$num" --json state -q .state 2>/dev/null || echo "MISSING")"
  [[ "$state" == "OPEN" ]]
}

has_open_pr_for_issue() {
  local num="$1"
  echo "$OPEN_PRS_JSON" | jq -e --argjson issue "$num" '
    any(.[]; any(.closingIssuesReferences[]?; .number == $issue))
  ' >/dev/null 2>&1
}

is_blocked() {
  local body="$1"
  local blockers blocker
  blockers="$(extract_blockers "$body")"
  [[ -z "$blockers" ]] && return 1
  while IFS= read -r blocker; do
    [[ -z "$blocker" ]] && continue
    if issue_is_open "$blocker"; then
      return 0
    fi
  done <<< "$blockers"
  return 1
}

pick_next_issue() {
  local sorted issue num title body url skip_reason
  sorted="$(echo "$ISSUES_JSON" | jq 'sort_by(.number)')"
  local count
  count="$(echo "$sorted" | jq 'length')"

  if [[ "$count" -eq 0 ]]; then
    echo "NO_ELIGIBLE:no open ready-for-agent issues" >&2
    return 1
  fi

  for ((i = 0; i < count; i++)); do
    issue="$(echo "$sorted" | jq -c ".[$i]")"
    num="$(echo "$issue" | jq -r '.number')"
    title="$(echo "$issue" | jq -r '.title')"
    body="$(echo "$issue" | jq -r '.body')"
    url="$(echo "$issue" | jq -r '.url')"

    if has_open_pr_for_issue "$num"; then
      skip_reason="open PR references #${num}" >&2
      continue
    fi

    if is_blocked "$body"; then
      skip_reason="blocked (see issue body)" >&2
      continue
    fi

    case "$MODE" in
      --json)
        jq -n \
          --argjson number "$num" \
          --arg title "$title" \
          --arg url "$url" \
          --arg body "$body" \
          '{number: $number, title: $title, url: $url, body: $body}'
        ;;
      --prompt)
        cat <<EOF
Implement GitHub issue #${num} using TDD (vertical RED→GREEN slices).

Issue: ${url}
Parent epic: see ## Parent in issue body

Instructions:
1. Load \`.agents/skills/tdd/SKILL.md\` first.
2. Follow \`docs/agents/implementation-workflow.md\` (WIP=1, branch \`codex/issue-${num}-<short-slug>\`).
3. Read issue body, parent epic, \`CONTEXT.md\`, and relevant ADRs.
4. Implement only this issue; verify with \`make test\` or \`make check\` per scope.
5. Open PR with \`Closes #${num}\`, acceptance criteria checklist, and verification commands.

Do not pick up any other issue. Skip \`ready-for-human\` issues.
EOF
        ;;
      --print|*)
        echo "#${num} ${title}"
        echo "${url}"
        ;;
    esac
    return 0
  done

  echo "NO_ELIGIBLE:all candidates blocked or have open PRs" >&2
  return 1
}

pick_next_issue
