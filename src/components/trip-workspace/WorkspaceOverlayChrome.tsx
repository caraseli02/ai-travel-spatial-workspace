import { WorkspaceViewSwitcher } from "./WorkspaceViewSwitcher";
import type { WorkspaceView } from "./workspaceViewTypes";
import { cn } from "@/lib/utils";

export interface WorkspaceOverlayChromeProps {
  view: WorkspaceView;
  onViewChange: (view: WorkspaceView) => void;
  toolbar?: React.ReactNode;
  stats?: React.ReactNode;
  /** Landing preview keeps trip metadata visible on map view. */
  keepStatsOnMapView?: boolean;
  /** Sticky below the landing nav so view toggles stay clickable while scrolling. */
  stickyBelowNav?: boolean;
  className?: string;
}

export function WorkspaceOverlayChrome({
  view,
  onViewChange,
  toolbar,
  stats,
  keepStatsOnMapView = false,
  stickyBelowNav = false,
  className,
}: WorkspaceOverlayChromeProps) {
  const showCanvasChrome = view === "canvas";
  const showStats = showCanvasChrome || keepStatsOnMapView;

  return (
    <div
      className={cn(
        "pointer-events-none z-10 w-full px-3",
        stickyBelowNav
          ? "sticky top-[76px] z-[45] py-3"
          : "absolute inset-x-3 top-3 md:inset-x-0 md:px-3",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-auto flex w-full items-center gap-2",
          showCanvasChrome ? "justify-between md:justify-start" : "justify-end",
        )}
      >
        {showCanvasChrome ? (
          <div className="hidden shrink-0 md:block">{toolbar}</div>
        ) : (
          <div className="hidden shrink-0 md:block md:w-0" aria-hidden />
        )}

        <div
          className={cn(
            "shrink-0",
            showCanvasChrome
              ? "md:flex md:min-w-0 md:flex-1 md:justify-center md:px-3"
              : "md:flex md:min-w-0 md:flex-1 md:justify-center",
          )}
        >
          <WorkspaceViewSwitcher value={view} onValueChange={onViewChange} />
        </div>

        {showStats ? (
          <div className="hidden shrink-0 md:block">{stats}</div>
        ) : (
          <div className="hidden shrink-0 md:block md:w-0" aria-hidden />
        )}
      </div>
    </div>
  );
}
