#!/usr/bin/env bash
# Print JSON describing what the Wayfarer controller loop should do next.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

if ! command -v gh >/dev/null 2>&1; then
  echo '{"action":"error","reason":"gh CLI required"}' >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo '{"action":"error","reason":"jq required"}' >&2
  exit 1
fi

OPEN_PRS_JSON="$(gh pr list \
  --state open \
  --json number,title,isDraft,headRefName,headRefOid,closingIssuesReferences \
  --limit 100)"

OPEN_WIP_PR="$(echo "$OPEN_PRS_JSON" | jq -c '
  [.[] | select(.isDraft == false)] | sort_by(.number) | first // empty
')"

if [[ -n "$OPEN_WIP_PR" ]]; then
  pr_num="$(echo "$OPEN_WIP_PR" | jq -r '.number')"
  branch="$(echo "$OPEN_WIP_PR" | jq -r '.headRefName')"
  head_sha="$(echo "$OPEN_WIP_PR" | jq -r '.headRefOid')"
  issue_num="$(echo "$OPEN_WIP_PR" | jq -r '.closingIssuesReferences[0].number // empty')"
  evaluator_bots="${WAYFARER_EVALUATOR_BOTS:-cursoragent,cursoragent[bot]}"
  pr_details="$(gh pr view "$pr_num" --json comments)"
  verdict="$(echo "$pr_details" | jq -r \
    --argjson pr "$pr_num" \
    --arg head "$head_sha" \
    --arg bots "$evaluator_bots" '
      def trusted($allowed_bots):
        (.authorAssociation // "") as $association
        | (.author.login // "") as $login
        | ((["OWNER", "MEMBER", "COLLABORATOR"] | index($association)) != null)
          or (($allowed_bots | split(",") | index($login)) != null);
      [
        .comments[]
        | select(trusted($bots))
        | .body
        | try capture("<!-- wayfarer-evaluator:v1 pr=\($pr) head=\($head) verdict=(?<verdict>PASS|FAIL|BLOCKED) -->")
      ]
      | last.verdict // "pending"
      | ascii_downcase
    ')"

  if [[ -n "$issue_num" ]]; then
    issue_json="$(gh issue view "$issue_num" --json number,title,url,state,labels)"
    issue_title="$(echo "$issue_json" | jq -r '.title')"
    issue_url="$(echo "$issue_json" | jq -r '.url')"
    if [[ "$verdict" == "fail" ]]; then
      action="repair"
    else
      action="wait_evaluator"
    fi
    jq -n \
      --arg action "$action" \
      --argjson issue "$issue_num" \
      --arg title "$issue_title" \
      --arg url "$issue_url" \
      --argjson pr "$pr_num" \
      --arg branch "$branch" \
      --arg head "$head_sha" \
      --arg verdict "$verdict" \
      '{action:$action, issue:$issue, title:$title, url:$url, pr:$pr, branch:$branch, head:$head, verdict:$verdict}'
  else
    jq -n \
      --argjson pr "$pr_num" \
      --arg branch "$branch" \
      --arg head "$head_sha" \
      --arg verdict "$verdict" \
      '{action:"wait_evaluator", issue:null, pr:$pr, branch:$branch, head:$head, verdict:$verdict, reason:"missing linked issue/spec"}'
  fi
  exit 0
fi

IN_PROGRESS_JSON="$(gh issue list \
  --label "in-progress" \
  --state open \
  --json number,title,url \
  --limit 10)"

IN_PROGRESS_COUNT="$(echo "$IN_PROGRESS_JSON" | jq 'length')"

if [[ "$IN_PROGRESS_COUNT" -gt 0 ]]; then
  issue="$(echo "$IN_PROGRESS_JSON" | jq -c 'sort_by(.number) | .[0]')"
  num="$(echo "$issue" | jq -r '.number')"
  title="$(echo "$issue" | jq -r '.title')"
  url="$(echo "$issue" | jq -r '.url')"

  jq -n \
    --argjson issue "$num" \
    --arg title "$title" \
    --arg url "$url" \
    '{action:"continue", issue:$issue, title:$title, url:$url}'
  exit 0
fi

PICK_JSON="$(bash "$REPO_ROOT/scripts/next-ready-agent-issue.sh" --json 2>/dev/null || true)"
if [[ -n "$PICK_JSON" ]]; then
  echo "$PICK_JSON" | jq '. + {action:"claim_new"}'
  exit 0
fi

jq -n '{action:"idle", reason:"no eligible ready-for-agent issues"}'
