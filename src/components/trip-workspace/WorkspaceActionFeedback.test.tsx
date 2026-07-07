import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WorkspaceActionFeedback } from "./WorkspaceActionFeedback";

describe("WorkspaceActionFeedback", () => {
  it("announces where an organized Inbox Item was placed without covering footer controls", () => {
    const markup = renderToStaticMarkup(
      <WorkspaceActionFeedback
        feedback={{
          tone: "success",
          title: "Placed on canvas",
          message: 'Reddit r/JapanTravel became "Hidden Temples" on Day 2.',
        }}
        onDismiss={() => undefined}
      />,
    );

    expect(markup).toContain('role="status"');
    expect(markup).toContain("Placed on canvas");
    expect(markup).toContain('Reddit r/JapanTravel became &quot;Hidden Temples&quot; on Day 2.');
    expect(markup).toContain("md:top-3");
  });
});
