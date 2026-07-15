# Trip Material Capture-and-Return Usability Study

**Issue:** [#139 — Run the Trip Material capture-and-return usability test](https://github.com/caraseli02/ai-travel-spatial-workspace/issues/139)

**Parent PRD:** [`trip-material-capture-return-prd.md`](./trip-material-capture-return-prd.md)

**Depends on:** [#138 / PR #140](https://github.com/caraseli02/ai-travel-spatial-workspace/pull/140) — deterministic Inbox capture with `sourceUrl`, `rawContent`, capture time, and **Open original source**.

---

## Study goal

Validate the PRD hypothesis: travelers can save Trip Material in an existing Trip, leave or reload Wayfarer, return, find what they saved, explain what it represents, and (for URLs) reopen the original source — without facilitator assistance.

**Pass bar:** at least **4 of 5** participants complete the full loop unassisted.

---

## Before you schedule sessions

### 1. Sync and run the build under test

```bash
git fetch origin
git checkout main
git merge origin/main   # resolve conflicts if your local main diverged
make setup
make check
```

Confirm the capture-and-return E2E passes:

```bash
make e2e -- tests/e2e/inbox-save-reload-recover.spec.ts
```

### 2. Run technical preflight

Verifies every study stimulus survives a Trip Repository save/load round trip unchanged:

```bash
node scripts/usability-study-preflight.mjs
```

All stimuli must print `PASS` before any participant session.

### 3. Start a clean dev server

```bash
make dev
```

Default URL: `http://localhost:5173` (confirm port in terminal output).

### 4. Reset browser state between participants

In DevTools console on any Wayfarer page:

```js
localStorage.clear();
location.reload();
```

Or open a fresh private/incognito window per participant.

**Do not** coach participants on Inbox UI labels, keyboard shortcuts, or where to click before they attempt each task.

---

## Participant profile

Recruit **five** people who match the PRD user:

- Budget-conscious travelers
- Already planning a trip (or can role-play doing so)
- Comfortable pasting URLs and short notes
- No prior exposure to Wayfarer internals or this study script

Mix desktop and mobile if you want broader signal; record device and viewport for each session.

---

## Session setup (facilitator)

| Item | Detail |
| --- | --- |
| Duration | ~15 minutes per participant |
| Recording | Screen + audio (with consent); note timestamps for failure points |
| Environment | Quiet; participant controls mouse/keyboard |
| Trip | Open the assigned route from the stimulus table below |
| Inbox | Must be visible in the Trip Workspace sidebar |

### Opening script (read verbatim)

> "You're planning a trip and found something online or in a message that might be useful later. I'll give you a Trip that's already set up and a piece of information to keep. Your job is to save it in Wayfarer so you can find it again later. I'll ask you to do a few things, but I won't tell you which buttons to press. Think aloud if you're comfortable — there are no wrong answers."

Hand the participant their **stimulus card** (URL or text from the table). Do not demonstrate the Inbox first.

---

## Task protocol (PRD § Validation Protocol)

Run these steps in order. Start a timer at step 2.

| Step | Facilitator says | Success signal | Assistance rule |
| --- | --- | --- | --- |
| 1 | *(already done)* Trip is open | Participant sees Trip Workspace | — |
| 2 | "Save this in your trip." *(hand stimulus)* | Item appears in Inbox after submit | No hints unless stuck **>3 min**; then note failure point and offer minimal rescue |
| 3 | "Now reload the page — or leave and come back to this same trip however you naturally would." | Participant reloads or navigates away and returns | Same assistance rule |
| 4 | "Find what you saved and tell me what it is." | Correct item identified; participant explains meaning in their own words | Prompt once: "What does this represent for your trip?" |
| 5 *(URL only)* | "Open the original source." | Correct URL opens in a new tab | Note if they use **Open original source** vs copying from card body |
| 6 | Debrief | Capture quotes | See observation sheet |

**Opaque-path URL (required):** at least one participant must receive P3 so domain fallback (`example.com` label) is exercised.

---

## Stimulus pack

Assign one row per participant. URLs are stable test endpoints; replace with real travel links if you prefer, but run preflight again after any change.

| ID | Trip route | Type | Stimulus to hand participant | Expected label after save | Notes |
| --- | --- | --- | --- | --- | --- |
| P1 | `/trips/demo-kyoto` | URL + context | `https://www.hiiragiya.co.jp/en/ — checking ryokan availability for Dec 14` | `checking ryokan availability for Dec 14` (truncated) | Traveler text should win over domain |
| P2 | `/trips/demo-kyoto` | URL only | `https://www.google.com/travel/flights/search?tfs=CBwQAhoeEgoyMDI1LTEyLTE0agcIARIDS0lYcgcIARIDU0ZPGAI` | `google.com` | Long opaque query exercises domain fallback |
| P3 | `/trips/demo-kyoto` | URL opaque path | `https://example.com/opaque-path-xyz123` | `example.com` | **Required** PRD opaque-path case; matches E2E fixture |
| P4 | `/trips/demo-kyoto` | Text note | `Mom says: buy matcha kit-kats at Nishiki Market before Dec 20` | First line of note | No **Open original source** expected |
| P5 | `/trips/demo-kyoto` | Reservation text | `ANA JL69 SFO→KIX Dec 14 11:20am — confirmation AB12CD` | First line of text | Pasted reservation details |

Print or share stimuli outside the app (Notes, paper card, chat message). Participants should paste/type from that handoff, not read from the facilitator screen.

---

## Observation sheet (copy per participant)

```
Participant ID: P__
Date:
Device / browser:
Facilitator:

Stimulus ID: P__
Trip route:

--- Task outcomes ---
[ ] Save completed without assistance
[ ] Leave/reload completed without assistance
[ ] Found correct item without assistance
[ ] Explained what item represents (quote): _______________________________
[ ] Opened correct original source (URL participants only)
    Method: [ ] Open original source  [ ] Other: __________

--- If assisted ---
Failure step: ____________________
Hint given: _______________________
Time to recover: __________________

--- Timing ---
Save start → item visible: ____ sec
Reload start → back on trip: ____ sec
Find task start → identified: ____ sec

--- Quotes / surprises ---
_____________________________________
_____________________________________

--- Facilitator notes ---
_____________________________________
```

---

## Scoring rubric

| Participant | Save | Reload/return | Find | Explain | Reopen URL (if applicable) | **Pass?** |
| --- | --- | --- | --- | --- | --- | --- |
| P1 | | | | | n/a | |
| P2 | | | | | | |
| P3 | | | | | | |
| P4 | | | | | n/a | |
| P5 | | | | | n/a | |

**Participant passes** when all applicable columns are Yes without assistance.

**Study passes** when ≥4 participants pass.

Record study result in issue #139 when complete.

---

## Technical guardrail (pre-session)

The PRD requires **100%** of study `sourceUrl` and `rawContent` values to survive repository round trip. The preflight script checks this in Node without a browser.

After each session (optional audit): export trip JSON from the app or inspect `localStorage` key `wayfarer:trips` and confirm the saved item's `sourceUrl` / `rawContent` match the stimulus exactly.

---

## Facilitator boundaries

**In scope for hints (only after 3 min stuck):**

- "Try the panel on the side of the screen."
- "You may need to paste what I gave you into a text box."

**Out of scope (invalidates unassisted pass):**

- Naming "Inbox", "Submit", or **Open original source**
- Explaining that Wayfarer does not fetch linked pages
- Demonstrating the flow before the participant attempts it

**Out of study scope (do not test):**

- AI classification or extraction quality
- Canvas promotion / Place on canvas
- Itinerary generation
- Cross-device sync

---

## Debrief prompts (after task 6)

1. "Was it obvious that your material was saved?"
2. "When you came back, how did you decide which item was yours?"
3. "For the link, did you trust **Open original source** to be the right place?"
4. "Anything you expected Wayfarer to do automatically that it didn't?"

---

## Deliverables for issue #139

When sessions are done, comment on #139 with:

1. Pass/fail against the 4/5 bar
2. Table of per-participant outcomes
3. Failure points (if any) with timestamps
4. Preflight script output (paste or attach)
5. `make check` commit SHA used for sessions
6. Decision: proceed to follow-up hypotheses in PRD § Follow-Up Decisions, or investigate failures first

---

## Quick facilitator checklist

- [ ] `origin/main` includes PR #140
- [ ] `make check` passes on session build
- [ ] `node scripts/usability-study-preflight.mjs` all PASS
- [ ] Dev server running; trip routes load
- [ ] Five stimulus cards printed/shared
- [ ] Five blank observation sheets
- [ ] Recording consent obtained
- [ ] localStorage cleared / incognito per participant
- [ ] At least one opaque-path URL participant (P3)
