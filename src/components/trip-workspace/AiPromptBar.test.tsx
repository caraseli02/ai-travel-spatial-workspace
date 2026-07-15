// @vitest-environment happy-dom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AiPromptBar } from "./AiPromptBar";

const defaultProps = {
  onSendQuery: vi.fn(),
  isThinking: false,
  dayCount: 7,
  isMobile: false,
};

describe("AiPromptBar", () => {
  it("raises stacking order and offsets above the map route sheet in Map view", () => {
    const { container } = render(<AiPromptBar {...defaultProps} workspaceView="map" />);

    const shell = container.firstElementChild;
    expect(shell).toHaveClass("z-[600]");
    expect(shell).toHaveClass("bottom-[calc(42vh+1rem)]");
    expect(screen.getByPlaceholderText(/paste a link or note to save/i)).toBeInTheDocument();
  });
});
