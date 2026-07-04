import { Calendar, Clock, MapPin } from "lucide-react";
import type { WorkspaceView } from "@/components/TripWorkspaceViews";
import { WorkspaceCanvasToolbar } from "@/components/trip-workspace/WorkspaceCanvasToolbar";
import { WorkspaceOverlayChrome } from "@/components/trip-workspace/WorkspaceOverlayChrome";
import { WorkspaceTripStatsPill } from "@/components/trip-workspace/WorkspaceTripStatsPill";

export function PreviewWorkspaceChrome({
  view,
  onViewChange,
}: {
  view: WorkspaceView;
  onViewChange: (view: WorkspaceView) => void;
}) {
  return (
    <WorkspaceOverlayChrome
      view={view}
      onViewChange={onViewChange}
      keepStatsOnMapView
      toolbar={<WorkspaceCanvasToolbar zoomPercent={100} preview showGridToggle />}
      stats={
        <WorkspaceTripStatsPill
          items={[
            { icon: <Calendar size={11} />, label: "Dec 14–21, 2025" },
            { icon: <MapPin size={11} />, label: "Kyoto, Japan" },
            { icon: <Clock size={11} />, label: "7 nights" },
          ]}
        />
      }
    />
  );
}
