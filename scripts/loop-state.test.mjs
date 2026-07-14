import { execFileSync } from "node:child_process";
import { chmod, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "..");
const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

async function runLoopState({ comments = [], openPullRequests, issue }) {
  const fixtureRoot = await mkdtemp(path.join(tmpdir(), "wayfarer-loop-state-"));
  temporaryDirectories.push(fixtureRoot);
  const binDirectory = path.join(fixtureRoot, "bin");
  await import("node:fs/promises").then(({ mkdir }) =>
    mkdir(binDirectory, { recursive: true }),
  );

  const ghStub = `#!/usr/bin/env bash
set -euo pipefail
command_key="$1 $2"
all_args="$*"
case "$command_key" in
  "pr list")
    if [[ "$all_args" == *"headRefOid"* ]]; then
      printf '%s' "$GH_OPEN_PRS_JSON"
    else
      printf '[]'
    fi
    ;;
  "pr view") printf '{"comments":%s}' "$GH_COMMENTS_JSON" ;;
  "issue list")
    if [[ "$all_args" == *"in-progress"* ]]; then
      printf '[]'
    else
      printf '[{"number":143,"title":"Next issue","body":"## Blocked by\\n\\nNone - can start immediately","url":"https://example.test/issues/143"}]'
    fi
    ;;
  "issue view") printf '%s' "$GH_ISSUE_JSON" ;;
  *) echo "unexpected gh invocation: $all_args" >&2; exit 2 ;;
esac
`;
  const ghPath = path.join(binDirectory, "gh");
  await writeFile(ghPath, ghStub);
  await chmod(ghPath, 0o755);

  const output = execFileSync("bash", ["scripts/loop-state.sh"], {
    cwd: repoRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      GH_COMMENTS_JSON: JSON.stringify(comments),
      GH_ISSUE_JSON: JSON.stringify(issue),
      GH_OPEN_PRS_JSON: JSON.stringify(openPullRequests),
      PATH: `${binDirectory}:${process.env.PATH}`,
    },
  });

  return JSON.parse(output);
}

async function runNextReadyIssue({ openPullRequests, readyIssues }) {
  const fixtureRoot = await mkdtemp(path.join(tmpdir(), "wayfarer-next-ready-"));
  temporaryDirectories.push(fixtureRoot);
  const binDirectory = path.join(fixtureRoot, "bin");
  await import("node:fs/promises").then(({ mkdir }) =>
    mkdir(binDirectory, { recursive: true }),
  );

  const ghStub = `#!/usr/bin/env bash
set -euo pipefail
case "$1 $2" in
  "issue list") printf '%s' "$GH_READY_ISSUES_JSON" ;;
  "pr list") printf '%s' "$GH_OPEN_PRS_JSON" ;;
  *) echo "unexpected gh invocation: $*" >&2; exit 2 ;;
esac
`;
  const ghPath = path.join(binDirectory, "gh");
  await writeFile(ghPath, ghStub);
  await chmod(ghPath, 0o755);

  const output = execFileSync(
    "bash",
    ["scripts/next-ready-agent-issue.sh", "--json"],
    {
      cwd: repoRoot,
      encoding: "utf8",
      env: {
        ...process.env,
        GH_OPEN_PRS_JSON: JSON.stringify(openPullRequests),
        GH_READY_ISSUES_JSON: JSON.stringify(readyIssues),
        PATH: `${binDirectory}:${process.env.PATH}`,
      },
    },
  );

  return JSON.parse(output);
}

const linkedIssue = {
  labels: [{ name: "ready-for-agent" }],
  number: 141,
  state: "OPEN",
  title: "Extract shared Trip Material parser",
  url: "https://example.test/issues/141",
};

const openPullRequest = {
  closingIssuesReferences: [
    { number: 141, url: "https://example.test/issues/141" },
  ],
  headRefName: "cursor/wayfarer-controller-loop",
  headRefOid: "9308d85a9b8ad1678189a0558680ab477fc9a605",
  isDraft: false,
  number: 172,
  title: "Shared Trip Material intake classifier",
};

function evaluatorComment({
  association = "OWNER",
  author = "caraseli02",
  head = openPullRequest.headRefOid,
  verdict,
}) {
  return {
    author: { login: author },
    authorAssociation: association,
    body: `## Evaluator verdict\n\n${verdict}\n\n<!-- wayfarer-evaluator:v1 pr=172 head=${head} verdict=${verdict} -->`,
  };
}

describe("loop-state public JSON contract", () => {
  test("an open PR occupies WIP even when its linked issue label drifted", async () => {
    const state = await runLoopState({
      issue: linkedIssue,
      openPullRequests: [openPullRequest],
    });

    expect(state).toMatchObject({
      action: "wait_evaluator",
      head: openPullRequest.headRefOid,
      issue: 141,
      pr: 172,
      verdict: "pending",
    });
  });

  test("a trusted FAIL verdict for the current head routes the same PR to repair", async () => {
    const state = await runLoopState({
      comments: [evaluatorComment({ verdict: "FAIL" })],
      issue: linkedIssue,
      openPullRequests: [openPullRequest],
    });

    expect(state).toMatchObject({
      action: "repair",
      head: openPullRequest.headRefOid,
      issue: 141,
      pr: 172,
      verdict: "fail",
    });
  });

  test("a FAIL verdict for an old head is invalidated after a push", async () => {
    const state = await runLoopState({
      comments: [
        evaluatorComment({
          head: "7bb6c7b788c2220eccf76a248223f6b5f61d88ff",
          verdict: "FAIL",
        }),
      ],
      issue: linkedIssue,
      openPullRequests: [openPullRequest],
    });

    expect(state).toMatchObject({
      action: "wait_evaluator",
      head: openPullRequest.headRefOid,
      pr: 172,
      verdict: "pending",
    });
  });

  test.each(["PASS", "BLOCKED"])(
    "a trusted current-head %s verdict holds WIP for human action",
    async (verdict) => {
      const state = await runLoopState({
        comments: [evaluatorComment({ verdict })],
        issue: linkedIssue,
        openPullRequests: [openPullRequest],
      });

      expect(state).toMatchObject({
        action: "wait_evaluator",
        head: openPullRequest.headRefOid,
        pr: 172,
        verdict: verdict.toLowerCase(),
      });
    },
  );

  test("closing issue references are exact even when the PR title contains a longer number", async () => {
    const state = await runLoopState({
      issue: linkedIssue,
      openPullRequests: [
        {
          ...openPullRequest,
          title: "Do not confuse #1410 with the linked issue",
        },
      ],
    });

    expect(state.issue).toBe(141);
  });

  test("the fallback picker does not confuse closing issue #1410 with candidate #141", async () => {
    const candidate = {
      body: "## Blocked by\n\nNone - can start immediately",
      number: 141,
      title: "Candidate issue",
      url: "https://example.test/issues/141",
    };
    const picked = await runNextReadyIssue({
      openPullRequests: [
        { closingIssuesReferences: [{ number: 1410 }], number: 172 },
      ],
      readyIssues: [candidate],
    });

    expect(picked).toMatchObject({ number: 141 });
  });

  test("untrusted and duplicate markers cannot override the trusted current-head verdict", async () => {
    const state = await runLoopState({
      comments: [
        evaluatorComment({ verdict: "PASS" }),
        evaluatorComment({
          association: "NONE",
          author: "outside-contributor",
          verdict: "FAIL",
        }),
        evaluatorComment({
          association: "NONE",
          author: "outside-contributor",
          verdict: "BLOCKED",
        }),
      ],
      issue: linkedIssue,
      openPullRequests: [openPullRequest],
    });

    expect(state).toMatchObject({
      action: "wait_evaluator",
      verdict: "pass",
    });
  });

  test("the approved evaluator bot can publish a trusted current-head verdict", async () => {
    const state = await runLoopState({
      comments: [
        evaluatorComment({
          association: "NONE",
          author: "cursoragent",
          verdict: "FAIL",
        }),
      ],
      issue: linkedIssue,
      openPullRequests: [openPullRequest],
    });

    expect(state).toMatchObject({ action: "repair", verdict: "fail" });
  });
});
