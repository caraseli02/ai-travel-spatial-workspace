import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Calendar, MapPin } from "lucide-react";
import { WorkspaceTripStatsPill } from "./WorkspaceTripStatsPill";

describe("WorkspaceTripStatsPill", () => {
  it("renders stat items separated by dividers", () => {
    const markup = renderToStaticMarkup(
      <WorkspaceTripStatsPill
        items={[
          { icon: <Calendar size={11} />, label: "Dec 14–21, 2025" },
          { icon: <MapPin size={11} />, label: "Kyoto, Japan" },
        ]}
      />,
    );

    expect(markup).toContain("Dec 14–21, 2025");
    expect(markup).toContain("Kyoto, Japan");
  });
});
