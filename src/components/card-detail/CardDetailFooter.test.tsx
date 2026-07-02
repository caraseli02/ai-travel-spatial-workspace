import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { CardDetailFooter } from "./CardDetailFooter";

describe("CardDetailFooter", () => {
  it("shows only meaningful card actions and separates the destructive delete action", () => {
    const markup = renderToStaticMarkup(
      <CardDetailFooter
        sourceMemory={{
          kind: "source-backed",
          sourceType: "link",
          sourceLabel: "Article",
          rawContent: "https://example.com/kyoto-guide",
          sourceUrl: "https://example.com/kyoto-guide",
          inboxItemId: "inbox-kyoto-guide",
        }}
        confirmDelete={false}
        onStartLinking={vi.fn()}
        onDelete={vi.fn()}
        showLinkButton
        showDeleteButton
      />,
    );

    expect(markup).toContain("Link with another card");
    expect(markup).toContain("Open original link");
    expect(markup).toContain("Delete Card");
    expect(markup).not.toContain("Itinerary");
    expect(markup).toContain('data-card-detail-footer-section="destructive"');
  });
});
