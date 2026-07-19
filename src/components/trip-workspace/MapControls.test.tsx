// @vitest-environment happy-dom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MapContainer } from "react-leaflet";
import { afterEach, describe, expect, it } from "vitest";
import { MapControlButtons } from "./MapControls";

function renderControls(sheetExpanded?: boolean) {
  return render(
    <MapContainer center={[35.006, 135.76]} zoom={13}>
      <MapControlButtons sheetExpanded={sheetExpanded} />
    </MapContainer>,
  );
}

describe("MapControlButtons", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders zoom in, zoom out, and recenter controls sized for mobile touch (>=44px)", () => {
    renderControls();

    for (const label of ["Zoom map in", "Zoom map out", "Recenter map"]) {
      const button = screen.getByRole("button", { name: label });
      expect(button).toHaveClass("size-11");
    }
  });

  it("sits above the collapsed route sheet peek by default", () => {
    renderControls(false);

    const container = screen.getByRole("button", { name: "Zoom map in" }).closest("div");
    expect(container).toHaveClass("bottom-[192px]");
  });

  it("moves above the expanded route sheet when the sheet is expanded", () => {
    renderControls(true);

    const container = screen.getByRole("button", { name: "Zoom map in" }).closest("div");
    expect(container).toHaveClass("bottom-[calc(42vh+1rem)]");
  });
});
