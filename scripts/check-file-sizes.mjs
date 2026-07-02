#!/usr/bin/env node
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const repoRoot = new URL("..", import.meta.url).pathname;
const configPath = join(repoRoot, "docs/agents/file-size-limits.json");
const config = JSON.parse(readFileSync(configPath, "utf8"));

const allowlistByPath = new Map(
  config.allowlist.map((entry) => [entry.path.replace(/\\/g, "/"), entry]),
);

function countLines(filePath) {
  const content = readFileSync(filePath, "utf8");
  if (content.length === 0) {
    return 0;
  }

  let lines = 0;
  for (const char of content) {
    if (char === "\n") {
      lines += 1;
    }
  }

  if (!content.endsWith("\n")) {
    lines += 1;
  }

  return lines;
}

function shouldSkipFile(filePath, rule) {
  const relativePath = relative(repoRoot, filePath).replace(/\\/g, "/");
  const extension = relativePath.slice(relativePath.lastIndexOf("."));

  if (!rule.extensions.includes(extension)) {
    return true;
  }

  for (const suffix of rule.excludeSuffixes ?? []) {
    if (relativePath.endsWith(suffix)) {
      return true;
    }
  }

  return false;
}

function collectFiles(rule) {
  const files = [];

  function walk(currentDir, excludedDirNames = new Set()) {
    for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (excludedDirNames.has(entry.name)) {
          continue;
        }
        walk(join(currentDir, entry.name), excludedDirNames);
        continue;
      }

      const filePath = join(currentDir, entry.name);
      if (!shouldSkipFile(filePath, rule)) {
        files.push(filePath);
      }
    }
  }

  walk(join(repoRoot, rule.root), new Set(rule.excludeDirs ?? []));
  return files;
}

const violations = [];

for (const rule of config.limits) {
  for (const filePath of collectFiles(rule)) {
    const relativePath = relative(repoRoot, filePath).replace(/\\/g, "/");
    const lines = countLines(filePath);
    const allowlistEntry = allowlistByPath.get(relativePath);

    if (allowlistEntry) {
      if (lines > allowlistEntry.maxLines) {
        violations.push({
          relativePath,
          lines,
          allowed: allowlistEntry.maxLines,
          ruleId: rule.id,
          kind: "allowlist-growth",
          guidance: `This file is allowlisted at ${allowlistEntry.maxLines} lines while issue #${allowlistEntry.issue} is open (${allowlistEntry.note}). Do not add code here; finish the split or lower the allowlist after shrinking the file.`,
        });
      }
      continue;
    }

    if (lines > rule.maxLines) {
      violations.push({
        relativePath,
        lines,
        allowed: rule.maxLines,
        ruleId: rule.id,
        kind: "over-limit",
        guidance: rule.guidance,
      });
    }
  }
}

if (violations.length > 0) {
  console.error("file-size-check: failed\n");
  for (const violation of violations) {
    console.error(
      [
        `- ${violation.relativePath}: ${violation.lines} lines (limit ${violation.allowed} for ${violation.ruleId})`,
        `  Why: large source files hide responsibilities and caused TripWorkspacePresenter to reach 1,137 lines before decomposition.`,
        `  Fix: ${violation.guidance}`,
        `  Policy: docs/agents/file-size-limits.json`,
      ].join("\n"),
    );
    console.error("");
  }
  process.exit(1);
}

console.log("file-size-check: ok");
