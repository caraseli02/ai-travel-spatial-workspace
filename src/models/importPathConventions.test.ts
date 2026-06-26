import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const srcDirectory = path.join(process.cwd(), "src");
const checkedDirectories = ["hooks", "models"].map((directory) =>
  path.join(srcDirectory, directory),
);

const sourceExtensions = new Set([".ts", ".tsx"]);

function findSourceFiles(directory: string): string[] {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return findSourceFiles(entryPath);
      }

      if (entry.isFile() && sourceExtensions.has(path.extname(entry.name))) {
        return [entryPath];
      }

      return [];
    });
}

function isInternalRelativeImport(filePath: string, specifier: string): boolean {
  if (!specifier.startsWith(".")) {
    return false;
  }

  const resolvedPath = path.resolve(path.dirname(filePath), specifier);
  return resolvedPath === srcDirectory || resolvedPath.startsWith(`${srcDirectory}${path.sep}`);
}

function collectRelativeInternalImports(filePath: string): string[] {
  const sourceText = fs.readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true);
  const violations: string[] = [];

  function visit(node: ts.Node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const specifier = node.moduleSpecifier.text;

      if (isInternalRelativeImport(filePath, specifier)) {
        const relativeFilePath = path.relative(process.cwd(), filePath);
        violations.push(`${relativeFilePath} imports ${specifier}`);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return violations;
}

describe("import path conventions", () => {
  it("uses @/ aliases for src imports in hooks and models", () => {
    const violations = checkedDirectories
      .flatMap(findSourceFiles)
      .flatMap(collectRelativeInternalImports);

    expect(violations).toEqual([]);
  });
});
