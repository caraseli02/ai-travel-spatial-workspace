// @vitest-environment happy-dom
import "@testing-library/jest-dom/vitest";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CanvasCard } from "@/models/trip";
import CardDetailPanel from "./CardDetailPanel";

const stickyCard: CanvasCard = {
  id: "c1",
  type: "sticky",
  x: 0,
  y: 0,
  rotation: 0,
  title: "Pack light!",
  subtitle: "Ryokan provides yukata & toiletries.",
};

describe("CardDetailPanel mobile chrome", () => {
  afterEach(() => {
    cleanup();
  });

  it("opens as a right side panel on desktop", () => {
    render(<CardDetailPanel card={stickyCard} onClose={vi.fn()} />);

    const content = document.querySelector('[data-slot="sheet-content"]');
    expect(content).toHaveAttribute("data-side", "right");
  });

  it("opens as a bottom sheet on mobile", () => {
    render(<CardDetailPanel card={stickyCard} onClose={vi.fn()} isMobile />);

    const content = document.querySelector('[data-slot="sheet-content"]');
    expect(content).toHaveAttribute("data-side", "bottom");
    expect(content?.className).toContain("rounded-t-2xl");
  });
});
