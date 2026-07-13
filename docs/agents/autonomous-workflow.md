# Autonomous workflow: planner, generator, evaluator

Wayfarer autonomous work follows the Learn Harness Engineering recommendation to separate planning, generation, and evaluation. The generator must not be the final judge of completion.

## Goal-shaped controller loop

The autonomous loop should behave like a standing `/goal` even when cron wakes individual stages:

- Keep exactly one issue active at a time.
- A planner claim moves `ready-for-agent` → `in-progress`.
- A generator opens or updates the PR for that same issue/branch.
- The ship path triggers evaluator review immediately after the PR head changes; do not wait for the next scheduled evaluator tick when a PR is ready.
- A scheduled Codex watchdog reconciles missed or stale event evaluations after controller ticks.
- If the evaluator returns `FAIL`, keep the issue `in-progress`, keep the same branch/PR, and produce a focused repair brief from the evaluator comment.
- Do not promote or select a new issue while any open non-draft PR is unresolved, even if its linked issue label drifted.

This is the runtime equivalent of: "work the currently claimed Wayfarer issue until it is evaluator-approved or blocked."

## Roles

| Role      | Responsibility                                                                                                    | Must not do                                                       |
| --------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Planner   | Select one eligible issue, claim it, write the work brief, define verification expectations                       | Edit implementation code or declare the issue complete            |
| Generator | Implement the claimed issue, run local pre-flight checks, open or update a PR                                     | Select new work, broaden scope, or self-certify final completion  |
| Evaluator | Independently verify the PR against the issue, harness docs, runtime evidence, and clean-handoff requirements     | Implement unrelated fixes or accept generator confidence as proof |

## Queue state model

Default minimal flow:

1. `ready-for-agent` — scoped issue is eligible for planner pickup.
2. `in-progress` — planner claimed the issue and generator may work only on that issue.
3. Open PR exists — generator output is ready for independent evaluation.
4. Evaluator `FAIL` — same issue/branch/PR receives a repair brief; WIP remains 1.
5. `ready-for-human` — evaluator passed the PR and it is ready for maintainer review.
6. `blocked` or issue comment — evaluator found a concrete blocker or missing evidence.

Evaluators scan every open non-draft PR. Linked-issue labels are reconciled by the
verdict, but label drift never makes an unresolved PR invisible to the loop.

## Planner contract

The planner output must include:

- Issue number, title, URL, and branch name (`codex/issue-<number>-<short-slug>`).
- Acceptance criteria summary.
- Files or areas likely to change.
- Dependency check: what must already be merged or true.
- Verification plan: `make test` or `make check` per scope.
- Evaluator expectations: what evidence the evaluator should require.

The planner must claim exactly one issue and keep WIP=1.

## Generator contract

The generator must:

1. Read the planner work brief and the full GitHub issue.
2. Start from clean latest `main` and work on the claimed branch only.
3. Load `.agents/skills/tdd/SKILL.md` and use vertical RED→GREEN slices.
4. Make the smallest change that satisfies the issue.
5. Run local pre-flight verification from the brief.
6. Open or update a PR linked with `Closes #<issue>`.
7. End with `PR ready for evaluator`, not `done`.

The generator's checks are useful evidence, but they are not the final done gate.

## Evaluator contract

The evaluator must inspect the PR independently and produce a structured verdict.

Required hard gates (a failure cannot be averaged away):

- Bind the evaluation to the current PR `headRefOid` and ignore verdicts for older heads.
- Resolve the issue through GitHub `closingIssuesReferences`; missing issue/spec intent is `BLOCKED`.
- Require mergeability and a successful current-head `check` workflow. Pending state is retried later rather than failed early.
- Compare the merge-base diff against the issue acceptance criteria and reject unrelated work.
- Inspect the relevant verification ladder in `docs/agents/implementation-workflow.md`; run focused verification when useful and safe.
- Require browser/runtime evidence for UI, routing, localStorage, or cross-component changes.
- Confirm the PR body includes acceptance criteria status and exact verification outcomes.
- Report repository Standards and Spec findings as separate axes; neither axis compensates for the other.

Verdicts:

- `PASS — ready-for-human`: add `ready-for-human` to PR and issue; remove stale `in-progress`/`blocked`; comment with evidence.
- `FAIL — needs generator fix`: keep/restore `in-progress`; remove stale `ready-for-human`/`blocked`; give one exact repair instruction.
- `BLOCKED — needs human decision`: add `blocked`; remove `in-progress`/`ready-for-human`; state the missing decision.

## Repair loop rule

When an `in-progress` issue already has an open PR, controller logic must route by evaluator state:

- No trusted current-head evaluator marker: wait for evaluator; do not run generator again.
- `PASS`: wait for human review/merge or state cleanup; do not select new work until WIP is clear.
- `FAIL`: generate a focused repair brief from the evaluator comment and update the same branch/PR.
- `BLOCKED`: leave the blocker visible and stop autonomous work on that issue.

## Evaluator report format

```md
## Evaluator verdict

PASS | FAIL | BLOCKED

## Issue / PR

- Issue: #N
- PR: #N
- Head: `full SHA`

## Hard gates

- Current-head CI: pass/fail + evidence
- Mergeability: pass/fail + evidence
- Scope: pass/fail + evidence
- Verification evidence: pass/fail + evidence

## Standards

- No findings, or actionable findings with file/line and governing rule

## Spec

- No findings, unavailable, or actionable findings tied to a requirement

## Required follow-up

- none, or exact repair instruction

<!-- wayfarer-evaluator:v1 pr=N head=SHA verdict=PASS|FAIL|BLOCKED -->
```

A PR is review-ready only when every hard gate passes and neither review axis has an actionable blocking finding.

## Controller state helper

Run `bash scripts/loop-state.sh` at the start of every controller tick. It discovers exact issue links through `closingIssuesReferences`, accepts only trusted markers matching the current head, and prints JSON with the required action:

- `wait_evaluator` — open PR exists; evaluator owns next step
- `repair` — evaluator FAIL; fix same branch/PR
- `continue` — `in-progress` issue with no open PR yet; keep implementing
- `claim_new` — no active WIP; pick next `ready-for-agent` issue
- `idle` — no eligible work

Do not ask a human which issue to pick. Follow the state machine.

## Lecture mapping

- Lecture 09: separate worker from checker; prevent premature completion declarations.
- Lecture 10: require full-pipeline/runtime verification when component boundaries matter.
- Lecture 11: make runtime state and evaluation evidence observable.
- Lecture 12: leave clean issue, PR, branch, and handoff state for the next session.
