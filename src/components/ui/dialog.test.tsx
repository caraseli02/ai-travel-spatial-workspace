import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DialogFooter } from "./dialog";

describe("DialogFooter", () => {
  it("keeps shared footer chrome without protruding outside the dialog", () => {
    const markup = renderToStaticMarkup(<DialogFooter>Actions</DialogFooter>);

    expect(markup).toContain("border-t");
    expect(markup).toContain("bg-muted/50");
    expect(markup).toContain("p-4");
    expect(markup).not.toContain("-mx-4");
    expect(markup).not.toContain("-mb-4");
  });
});
