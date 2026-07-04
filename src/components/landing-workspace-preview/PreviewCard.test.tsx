import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { CanvasCard } from "@/models/trip";

const { canvasCardRenderer } = vi.hoisted(() => ({
  canvasCardRenderer: vi.fn(({ card }: { card: CanvasCard }) => (
    <div data-testid="canvas-card-renderer">{card.title}</div>
  )),
}));

vi.mock("@/components/CanvasCards", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/components/CanvasCards")>();
  return {
    ...actual,
    CanvasCardRenderer: canvasCardRenderer,
  };
});

import { PreviewCard } from "./PreviewCard";
import { kanbanColumns } from "./landingPreviewData";

describe("PreviewCard", () => {
  it("delegates every card type to CanvasCardRenderer with embedded mode", () => {
    const cards = kanbanColumns.flatMap((column) => column.cards);

    for (const card of cards) {
      canvasCardRenderer.mockClear();
      renderToStaticMarkup(<PreviewCard card={card} />);

      expect(canvasCardRenderer).toHaveBeenCalledOnce();
      expect(canvasCardRenderer).toHaveBeenCalledWith(
        expect.objectContaining({ card, embedded: true }),
        undefined,
      );
    }
  });
});
