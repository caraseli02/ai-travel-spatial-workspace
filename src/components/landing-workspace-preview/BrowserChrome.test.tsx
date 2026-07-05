import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LANDING_PREVIEW_TRIP_ROUTE } from "./landingPreviewDemoCues";
import { BrowserChrome } from "./BrowserChrome";

describe("BrowserChrome", () => {
  it("shows the Demo Trip route in the faux browser address bar", () => {
    const html = renderToStaticMarkup(<BrowserChrome />);

    expect(html).toContain(LANDING_PREVIEW_TRIP_ROUTE);
    expect(html).not.toContain("wayfarer.app/trips/kyoto");
  });
});
