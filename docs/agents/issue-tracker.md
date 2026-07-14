# Issue tracker: GitHub

Issues and PRDs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --comments`, filtering comments by `jq` and also fetching labels.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> --comment "..."`

Infer the repo from `git remote -v` — `gh` does this automatically when run inside a clone.

## Pickup rules (autonomous loop)

The controller loop should behave like a standing `/goal`: keep one issue alive until evaluator pass, blocker, or human merge.

- Only issues with the `ready-for-agent` label are eligible for planner pickup.
- Before editing code, the planner claims exactly one issue:
  - remove `ready-for-agent`
  - add the `in-progress` label
  - comment with the branch name (`Claimed by Wayfarer controller loop on branch codex/issue-<n>-<slug>`)
- Use `bash scripts/claim-issue.sh <number> <branch>` for consistent claiming.
- If an issue is already `in-progress` or any open non-draft PR is unresolved, do not pick a different issue. An open PR occupies WIP even when its issue label drifted.
- WIP is 1: never work two issues in parallel.
- The generator may only implement the issue already claimed by the planner.
- The generator opens or updates a PR, but does not declare final completion.
- If an open non-draft PR exists, do not select new work. Wait for a trusted current-head evaluator marker, or repair that same PR when the current-head verdict is FAIL.
- The evaluator independently checks the PR and moves the issue toward `ready-for-human` only after evidence passes.

Run `bash scripts/loop-state.sh` at the start of every controller tick to determine the action.

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments`.

## PR body requirement

Every generator PR should include:

- Related issue and `Closes #<issue>`
- Acceptance criteria checklist
- Verification evidence with exact command outcomes (`make test` / `make check`)
- Runtime/browser evidence when UI, routing, localStorage, or cross-component behavior changed
- Risks, known failures, or explicit `none`

The evaluator report is separate from the generator PR body and should use `docs/agents/autonomous-workflow.md`.

## Claim comment example

`Claimed by Wayfarer controller loop on branch codex/issue-141-shared-trip-material-parser`
