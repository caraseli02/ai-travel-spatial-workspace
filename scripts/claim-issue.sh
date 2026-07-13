#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: bash scripts/claim-issue.sh <issue-number> <branch-name>" >&2
  exit 1
fi

ISSUE_NUM="$1"
BRANCH="$2"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if ! gh issue view "$ISSUE_NUM" --json labels --jq '.labels[].name' | grep -qx 'ready-for-agent'; then
  echo "Issue #$ISSUE_NUM is not labeled ready-for-agent" >&2
  exit 1
fi

if gh issue view "$ISSUE_NUM" --json labels --jq '.labels[].name' | grep -qx 'in-progress'; then
  echo "Issue #$ISSUE_NUM is already in-progress" >&2
  exit 1
fi

git fetch origin main
git checkout main
git pull origin main

if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  git checkout "$BRANCH"
else
  git checkout -b "$BRANCH"
fi

gh issue edit "$ISSUE_NUM" --remove-label ready-for-agent --add-label in-progress
gh issue comment "$ISSUE_NUM" --body "Claimed by autonomous controller loop on branch \`${BRANCH}\`."

gh issue view "$ISSUE_NUM" --json number,title,body
