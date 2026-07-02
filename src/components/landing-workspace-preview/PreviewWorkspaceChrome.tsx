import {
  Calendar,
  Clock,
  Grid3x3,
  MapPin,
  Maximize2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { WorkspaceViewSwitcher, type WorkspaceView } from "@/components/TripWorkspaceViews";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PreviewWorkspaceChrome({
  view,
  onViewChange,
}: {
  view: WorkspaceView;
  onViewChange: (view: WorkspaceView) => void;
}) {
  const canvasToolbar = (
    <div
      className="flex items-center gap-1 rounded-xl border border-[#e7e3dc] bg-[#fefcf8] p-1 shadow-sm"
      aria-hidden="true"
    >
      <Button type="button" variant="ghost" size="icon" className="size-7 rounded-lg" disabled tabIndex={-1}>
        <ZoomIn className="size-3.5 text-stone-500" />
      </Button>
      <Button type="button" variant="ghost" size="icon" className="size-7 rounded-lg" disabled tabIndex={-1}>
        <ZoomOut className="size-3.5 text-stone-500" />
      </Button>
      <div className="mx-0.5 h-4 w-px bg-[#e7e3dc]" />
      <Button type="button" variant="ghost" size="icon" className="size-7 rounded-lg" disabled tabIndex={-1}>
        <Maximize2 className="size-3.5 text-stone-500" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 rounded-lg bg-amber-50"
        disabled
        tabIndex={-1}
      >
        <Grid3x3 className="size-3.5 text-amber-800" />
      </Button>
      <span className="px-1 font-mono text-xs text-stone-500">100%</span>
    </div>
  );

  const tripMetadata = (
    <div className="flex max-w-[min(100%,20rem)] shrink-0 items-center gap-1.5 overflow-hidden rounded-xl border border-[#e7e3dc] bg-[#fefcf8] px-2 py-1.5 shadow-sm md:gap-2 md:px-2.5 md:py-2 lg:max-w-none lg:gap-2.5 lg:px-3">
      <span className="flex shrink-0 items-center gap-1 truncate text-xs text-stone-500">
        <Calendar className="size-3 shrink-0" />
        <span className="truncate">Dec 14–21, 2025</span>
      </span>
      <div className="h-3 w-px shrink-0 bg-[#e7e3dc]" />
      <span className="flex shrink-0 items-center gap-1 truncate text-xs text-stone-500">
        <MapPin className="size-3 shrink-0" />
        <span className="truncate">Kyoto, Japan</span>
      </span>
      <div className="h-3 w-px shrink-0 bg-[#e7e3dc]" />
      <span className="flex shrink-0 items-center gap-1 text-xs text-stone-500">
        <Clock className="size-3 shrink-0" />
        7 nights
      </span>
    </div>
  );

  return (
    <div className="absolute inset-x-3 top-3 z-10">
      <div className="flex w-full items-center gap-2">
        <div
          className={cn(
            "hidden shrink-0 md:block",
            view !== "canvas" && "pointer-events-none invisible",
          )}
        >
          {canvasToolbar}
        </div>

        <div className="flex min-w-0 flex-1 justify-center px-1">
          <WorkspaceViewSwitcher value={view} onValueChange={onViewChange} />
        </div>

        <div className="hidden shrink-0 md:block">{tripMetadata}</div>
      </div>
    </div>
  );
}
