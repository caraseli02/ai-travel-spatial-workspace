// @vitest-environment happy-dom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WorkspaceCanvasToolbar } from "./WorkspaceCanvasToolbar";

describe("WorkspaceCanvasToolbar", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders zoom controls and percentage in interactive mode", () => {
    render(
      <WorkspaceCanvasToolbar
        zoomPercent={100}
        onZoomIn={() => undefined}
        onZoomOut={() => undefined}
        onReset={() => undefined}
      />,
    );

    expect(screen.getByTitle("Zoom in")).toBeInTheDocument();
    expect(screen.getByTitle("Zoom out")).toBeInTheDocument();
    expect(screen.getByTitle("Reset view")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("calls zoom and reset handlers when controls are clicked", () => {
    const onZoomIn = vi.fn();
    const onZoomOut = vi.fn();
    const onReset = vi.fn();

    render(
      <WorkspaceCanvasToolbar
        zoomPercent={100}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onReset={onReset}
      />,
    );

    fireEvent.click(screen.getByTitle("Zoom in"));
    fireEvent.click(screen.getByTitle("Zoom out"));
    fireEvent.click(screen.getByTitle("Reset view"));

    expect(onZoomIn).toHaveBeenCalledTimes(1);
    expect(onZoomOut).toHaveBeenCalledTimes(1);
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("renders disabled controls without handlers in preview mode", () => {
    render(<WorkspaceCanvasToolbar zoomPercent={100} preview />);

    expect(screen.getByTitle("Zoom in")).toBeDisabled();
    expect(screen.getByTitle("Zoom out")).toBeDisabled();
    expect(screen.getByTitle("Reset view")).toBeDisabled();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });
});
