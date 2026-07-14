#!/usr/bin/env bash
# Claim a ready-for-agent issue for the autonomous loop.
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "usage: claim-issue.sh <issue-number> <branch-name>" >&2
  exit 1
fi

ISSUE_NUM="$1"
BRANCH="$2"

gh issue edit "$ISSUE_NUM" \
  --remove-label "ready-for-agent" \
  --add-label "in-progress"

gh issue comment "$ISSUE_NUM" --body "Claimed by Wayfarer controller loop on branch \`${BRANCH}\`."

echo "claimed #${ISSUE_NUM} on ${BRANCH}"
