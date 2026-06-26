#!/usr/bin/env node
/**
 * Run a local Cursor SDK agent for the next eligible tech-debt issue.
 * Requires: CURSOR_API_KEY, gh, jq, npm install (includes @cursor/sdk).
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function runPicker(mode) {
  const result = spawnSync(
    path.join(repoRoot, "scripts/next-tech-debt-issue.sh"),
    [mode],
    { cwd: repoRoot, encoding: "utf8" },
  );
  if (result.status !== 0) {
    const err = (result.stderr || result.stdout || "").trim();
    console.error(err || "No eligible tech-debt issue found.");
    process.exit(result.status || 1);
  }
  return result.stdout.trim();
}

async function main() {
  const apiKey = process.env.CURSOR_API_KEY;
  if (!apiKey) {
    console.error(
      "error: set CURSOR_API_KEY (Cursor dashboard → Integrations → User API keys)",
    );
    process.exit(1);
  }

  let Agent;
  try {
    ({ Agent } = await import("@cursor/sdk"));
  } catch {
    console.error(
      "error: @cursor/sdk not installed. Run: npm install",
    );
    process.exit(1);
  }

  const issueJson = runPicker("--json");
  const issue = JSON.parse(issueJson);

  const prompt = `Implement GitHub issue #${issue.number} using TDD (vertical RED→GREEN slices).

Issue: ${issue.url}
Parent epic: see ## Parent in issue body

Instructions:
1. Load \`.agents/skills/tdd/SKILL.md\` first.
2. Follow \`docs/agents/implementation-workflow.md\` (WIP=1, branch \`codex/issue-${issue.number}-<short-slug>\`).
3. Read issue body, parent epic, \`CONTEXT.md\`, and relevant ADRs.
4. Implement only this issue; verify with \`make test\` or \`make check\` per scope.
5. Open PR with \`Closes #${issue.number}\`, acceptance criteria checklist, and verification commands.

Do not pick up any other issue. Skip \`ready-for-human\` issues.`;

  const modelId = process.env.CURSOR_AGENT_MODEL ?? "composer-2.5";

  console.error(`Starting local agent for #${issue.number}: ${issue.title}`);
  console.error(`Model: ${modelId}`);
  console.error(`Workspace: ${repoRoot}`);
  console.error("---");

  const agent = await Agent.create({
    apiKey,
    model: { id: modelId },
    local: {
      cwd: repoRoot,
      settingSources: ["project", "user"],
    },
  });

  try {
    const run = await agent.send(prompt);
    for await (const event of run.stream()) {
      if (event.type === "assistant") {
        for (const block of event.message.content) {
          if (block.type === "text") {
            process.stdout.write(block.text);
          }
        }
      }
    }
    await run.wait();
    console.error("\n---");
    console.error(`Agent finished for issue #${issue.number}. Review branch/PR before merge.`);
  } finally {
    if (typeof agent.dispose === "function") {
      await agent.dispose();
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
