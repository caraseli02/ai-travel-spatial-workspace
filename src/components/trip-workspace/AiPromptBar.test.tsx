// @vitest-environment happy-dom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AiPromptBar } from "./AiPromptBar";

const defaultProps = {
  onSendQuery: vi.fn(),
  isThinking: false,
  dayCount: 7,
  isMobile: false,
};

describe("AiPromptBar", () => {
  afterEach(() => {
    cleanup();
  });

  it("raises stacking order and offsets above the map route sheet in Map view", () => {
    const { container } = render(<AiPromptBar {...defaultProps} workspaceView="map" />);

    const shell = container.firstElementChild;
    expect(shell).toHaveClass("z-[600]");
    expect(shell).toHaveClass("bottom-[calc(42vh+1rem)]");
    expect(screen.getByPlaceholderText(/paste a link or note to save/i)).toBeInTheDocument();
  });

  it("renders as a compact FAB on the mobile map companion instead of a full-width bar", () => {
    render(<AiPromptBar {...defaultProps} isMobile workspaceView="map" />);

    const fab = screen.getByRole("button", { name: "Ask AI about this trip" });
    expect(fab).toBeInTheDocument();
    expect(fab).toHaveClass("size-11");
    expect(screen.queryByPlaceholderText(/ask ai about this trip/i)).not.toBeInTheDocument();
  });

  it("expands the mobile map FAB into the full prompt input on tap, and can be closed again", () => {
    render(<AiPromptBar {...defaultProps} isMobile workspaceView="map" />);

    fireEvent.click(screen.getByRole("button", { name: "Ask AI about this trip" }));

    const input = screen.getByPlaceholderText(/ask ai about this trip/i);
    expect(input).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close AI prompt" }));

    expect(screen.getByRole("button", { name: "Ask AI about this trip" })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/ask ai about this trip/i)).not.toBeInTheDocument();
  });

  it("collapses the mobile map FAB back down after sending a query", () => {
    const onSendQuery = vi.fn();
    render(<AiPromptBar {...defaultProps} isMobile workspaceView="map" onSendQuery={onSendQuery} />);

    fireEvent.click(screen.getByRole("button", { name: "Ask AI about this trip" }));
    const input = screen.getByPlaceholderText(/ask ai about this trip/i);
    fireEvent.change(input, { target: { value: "Plan Day 8" } });
    fireEvent.click(screen.getByRole("button", { name: "Send AI prompt" }));

    expect(onSendQuery).toHaveBeenCalledWith("Plan Day 8");
    expect(screen.getByRole("button", { name: "Ask AI about this trip" })).toBeInTheDocument();
  });

  it("keeps the full-width prompt bar on mobile Canvas view (not the map FAB)", () => {
    render(<AiPromptBar {...defaultProps} isMobile workspaceView="canvas" />);

    expect(screen.queryByRole("button", { name: "Ask AI about this trip" })).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ask ai about this trip/i)).toBeInTheDocument();
  });
});
