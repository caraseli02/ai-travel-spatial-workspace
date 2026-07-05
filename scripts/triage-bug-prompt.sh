#!/usr/bin/env bash
# Generate TDD agent prompts for open ready-for-agent triage bugs.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

MODE="${1:---multitask}"
ISSUE_NUM="${2:-}"

if ! command -v gh >/dev/null 2>&1; then
  echo "error: gh CLI is required" >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "error: jq is required" >&2
  exit 1
fi

fetch_open_bug_numbers() {
  gh issue list \
    --label bug \
    --label ready-for-agent \
    --state open \
    --json number \
    --jq 'sort_by(.number) | .[].number'
}

read_open_bug_numbers() {
  OPEN_ISSUES=()
  while IFS= read -r num; do
    [[ -n "$num" ]] && OPEN_ISSUES+=("$num")
  done < <(fetch_open_bug_numbers)
}

issue_prompt() {
  local num="$1"
  local title url body

  title="$(gh issue view "$num" --json title -q .title)"
  url="$(gh issue view "$num" --json url -q .url)"
  body="$(gh issue view "$num" --json body -q .body)"

  cat <<EOF
Implement GitHub issue #${num} using TDD (vertical RED→GREEN slices only).

Issue: ${url}
Title: ${title}

## Before coding

1. Load \`.agents/skills/tdd/SKILL.md\` first — one test → one implementation per cycle; never bulk-write tests then implement.
2. Follow \`docs/agents/implementation-workflow.md\` (WIP=1, branch \`codex/issue-${num}-<short-slug>\`).
3. Read the issue body below, \`CONTEXT.md\`, relevant ADRs, and \`docs/architecture/codebase-map.md\`.
4. Implement only this issue; no drive-by refactors.

## Issue body

${body}

## Verification

| Change type | Command |
| --- | --- |
| Models / utils only | \`make test\` |
| UI, routing, persistence, layout | \`make check\` |

Record exact commands and pass/fail in the PR.

## PR

- Title: concise, issue-focused
- Body: \`Closes #${num}\`, acceptance criteria checklist, verification section

Do not pick up any other issue in this session.
EOF
}

print_multitask_header() {
  local count="$1"
  shift
  local issues=("$@")

  cat <<EOF
# Multitask: triage bug backlog (TDD)

EOF

  if (( count == 0 )); then
    cat <<'EOF'
No open `ready-for-agent` bugs remain. Check tech-debt queue instead:

  make debt-next
  make debt-prompt

EOF
    return
  fi

  if (( count == 1 )); then
    cat <<EOF
Only **1** open bug — use a single Agent chat (not Multitask Mode):

| Issue | #${issues[0]} |
| --- | --- |

Or run: \`make triage-prompt ISSUE=${issues[0]}\`

---

EOF
    return
  fi

  cat <<EOF
Launch **${count} parallel Agent chats** (Cursor Multitask Mode). Paste one prompt per agent.
Merge PRs one at a time; rebase later agents onto \`main\` after each merge if needed.

| Agent | Issue |
| --- | --- |
EOF

  local i=1
  for num in "${issues[@]}"; do
    echo "| ${i} | #${num} |"
    i=$((i + 1))
  done

  cat <<'EOF'

**WIP=1 per agent.** Do not share branches between agents.

---

EOF
}

case "$MODE" in
  --issue)
    if [[ -z "$ISSUE_NUM" ]]; then
      echo "usage: $0 --issue <number>" >&2
      exit 1
    fi
    issue_prompt "$ISSUE_NUM"
    ;;
  --multitask)
    read_open_bug_numbers
    MULTITASK_ISSUES=("${OPEN_ISSUES[@]:0:3}")
    print_multitask_header "${#MULTITASK_ISSUES[@]}" "${MULTITASK_ISSUES[@]}"
    for num in "${MULTITASK_ISSUES[@]}"; do
      echo "========== AGENT PROMPT: issue #${num} =========="
      echo
      issue_prompt "$num"
      echo
      echo
    done
    ;;
  --list)
    read_open_bug_numbers
    if ((${#OPEN_ISSUES[@]} == 0)); then
      echo "No open ready-for-agent bugs."
      exit 0
    fi
    for num in "${OPEN_ISSUES[@]}"; do
      gh issue view "$num" --json number,title,url --jq '"#\(.number) \(.title)\n\(.url)"'
      echo
    done
    ;;
  --help|-h)
    cat <<EOF
usage:
  $0 --multitask          Print parallel TDD prompts for open ready-for-agent bugs (up to 3)
  $0 --issue <number>     Print TDD prompt for one issue
  $0 --list               List open triage bugs with URLs
EOF
    ;;
  *)
    echo "error: unknown mode '$MODE' (try --help)" >&2
    exit 1
    ;;
esac
