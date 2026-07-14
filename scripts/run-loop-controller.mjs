#!/usr/bin/env node
/**
 * Run the local Wayfarer controller loop via Cursor SDK.
 * Uses scripts/loop-state.sh + loop-controller-prompt.sh — same contract as Cloud Automation.
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function runScript(script, args = []) {
  const result = spawnSync("bash", [path.join(repoRoot, "scripts", script), ...args], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  return result;
}

async function main() {
  const apiKey = process.env.CURSOR_API_KEY;
  if (!apiKey) {
    console.error("error: set CURSOR_API_KEY");
    process.exit(1);
  }

  const stateResult = runScript("loop-state.sh");
  if (stateResult.status !== 0) {
    console.error(stateResult.stderr || stateResult.stdout);
    process.exit(1);
  }

  const state = JSON.parse(stateResult.stdout.trim());
  console.error(`Loop state: ${JSON.stringify(state)}`);

  if (state.action === "idle" || state.action === "wait_evaluator") {
    console.error(`Stopping: ${state.action}`);
    process.exit(0);
  }

  const promptResult = runScript("loop-controller-prompt.sh");
  const prompt = promptResult.stdout;

  let Agent;
  try {
    ({ Agent } = await import("@cursor/sdk"));
  } catch {
    console.error("error: @cursor/sdk not installed. Run: npm install");
    process.exit(1);
  }

  const modelId = process.env.CURSOR_AGENT_MODEL ?? "composer-2.5";
  console.error(`Model: ${modelId}`);
  console.error("---");

  const agent = await Agent.create({
    apiKey,
    model: { id: modelId },
    local: { cwd: repoRoot, settingSources: ["project", "user"] },
  });

  try {
    const run = await agent.send(prompt);
    for await (const event of run.stream()) {
      if (event.type === "assistant") {
        for (const block of event.message.content) {
          if (block.type === "text") process.stdout.write(block.text);
        }
      }
    }
    await run.wait();
    console.error("\n---\nController loop finished. Evaluator runs on PR events.");
  } finally {
    if (typeof agent.dispose === "function") await agent.dispose();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
