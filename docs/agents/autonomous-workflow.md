# Autonomous Controller Loop

Cron-driven automation that claims one `ready-for-agent` issue per run, implements it with TDD, opens a PR, and waits for evaluator review.

## State machine

Run `bash scripts/loop-state.sh` at the start of every run. Follow the `action` field:

| Action | Meaning | Agent behavior |
| --- | --- | --- |
| `claim_new` | No active loop PR; next issue available | `bash scripts/claim-issue.sh <n> codex/issue-<n>-<slug>`, implement with TDD, verify, open PR |
| `repair` | Evaluator left `FAIL` on the active PR | Fix the same branch/PR; re-run verification |
| `wait_evaluator` | PR open, awaiting evaluator | Stop without coding |
| `idle` | No claimable work | Stop without coding |

## Claiming an issue

```bash
bash scripts/claim-issue.sh <issue-number> codex/issue-<number>-short-slug
```

The script:

1. Verifies the issue is `ready-for-agent` and not blocked.
2. Adds `in-progress`, removes `ready-for-agent`.
3. Creates and checks out the branch from `main`.

## Gate #171

Do not claim issues blocked by [#171](https://github.com/caraseli02/ai-travel-spatial-workspace/issues/171) (AI Prompt, Spatial Canvas deepening, Inbox promotion chains) until the #139 usability test outcome is recorded.

Ungated architecture slices (#141, #144, #148–#150, #152, #154, #161) may proceed.

## Verification

- Behavior-only module changes: `make test`
- UI, routing, persistence, or build changes: `make check`

Record exact commands and results in the PR.

## Evaluator

After opening a PR, end the run with: **PR ready for evaluator.**

The evaluator posts `PASS` or `FAIL` on the PR. `FAIL` triggers `repair` on the next cron tick.

## Related docs

- Issue tracker: `docs/agents/issue-tracker.md`
- Implementation workflow: `docs/agents/implementation-workflow.md`
- Triage labels: `docs/agents/triage-labels.md`
