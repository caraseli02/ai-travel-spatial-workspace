---
name: Ready-for-agent implementation slice
about: Create a scoped issue that an implementation agent can complete and verify
title: ""
labels: ready-for-agent
assignees: ""
---

## Parent

Link the parent PRD or parent issue.

## What to build

Describe the observable behavior to implement.

## Out of scope

List adjacent work the agent must not take on.

## Acceptance criteria

- [ ] Observable outcome with a clear pass/fail result.
- [ ] Tests or focused verification cover the behavior.

## Verification required

- [ ] `make test`
- [ ] `make check`
- [ ] Browser/E2E evidence if this changes UI, routing, localStorage persistence, or cross-component behavior.

## Blocked by

List blockers, or write `None`.
