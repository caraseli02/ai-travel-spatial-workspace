import { useMemo, useState } from "react";
import { createDemoTrip } from "@/data/tripData";
import type { CanvasCard } from "@/models/trip";
import type { WorkspaceView } from "@/components/TripWorkspaceViews";
import { BrowserChrome } from "./BrowserChrome";
import { DesktopWorkspacePreview } from "./DesktopWorkspacePreview";
import { InboxPreview } from "./InboxPreview";
import { MobileWorkspacePreview } from "./MobileWorkspacePreview";

export default function LandingWorkspacePreviewRoot() {
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>("canvas");
  const [selectedCard, setSelectedCard] = useState<CanvasCard | null>(null);
  const demoTrip = useMemo(() => createDemoTrip(), []);

  return (
    <div className="mt-2 w-full max-w-[1180px] overflow-hidden rounded-2xl border border-border bg-background shadow-[0_30px_60px_rgba(12,10,9,0.15)]">
      <BrowserChrome />
      <div className="flex h-[420px] md:h-[556px]">
        <InboxPreview />
        <DesktopWorkspacePreview
          view={workspaceView}
          onViewChange={setWorkspaceView}
          selectedCard={selectedCard}
          onSelectCard={setSelectedCard}
          demoTrip={demoTrip}
        />
        <MobileWorkspacePreview
          view={workspaceView}
          onViewChange={setWorkspaceView}
          selectedCard={selectedCard}
          onSelectCard={setSelectedCard}
          demoTrip={demoTrip}
        />
      </div>
    </div>
  );
}
