import type { NavigateFunction } from "react-router-dom";
import {
  ChevronLeft,
  Compass,
  Calendar,
  Share2,
  Download,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  MoreHorizontal,
} from "lucide-react";
import type { DayGroup, InboxItem, Trip } from "@/models/trip";
import { WorkspaceViewSwitcher, type WorkspaceView } from "@/components/TripWorkspaceViews";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  deriveTripStatus,
  deriveTripTravelers,
  formatTripDates,
  formatTripDurationNights,
} from "@/utils/tripCardHelpers";
import { workspaceStatusConfig } from "./workspaceStatusConfig";

export interface TripWorkspaceHeaderChromeProps {
  trip: Trip;
  navigate: NavigateFunction;
  days: DayGroup[];
  activeDay: number | null;
  onActiveDayChange: (day: number | null) => void;
  onOpenAddDayModal: () => void;
  inboxOpen: boolean;
  onToggleInbox: () => void;
  inboxItems: InboxItem[];
  showOverflow: boolean;
  onToggleOverflow: (open?: boolean) => void;
  onShareTrip: () => void;
  onExportTrip: () => void;
  workspaceView: WorkspaceView;
  onWorkspaceViewChange: (view: WorkspaceView) => void;
}

export function TripWorkspaceHeaderChrome({
  trip,
  navigate,
  days,
  activeDay,
  onActiveDayChange,
  onOpenAddDayModal,
  inboxOpen,
  onToggleInbox,
  inboxItems,
  showOverflow,
  onToggleOverflow,
  onShareTrip,
  onExportTrip,
  workspaceView,
  onWorkspaceViewChange,
}: TripWorkspaceHeaderChromeProps) {
  const unprocessedCount = inboxItems.filter((item) => !item.processed).length;
  const tripStatus = deriveTripStatus(trip);
  const statusCfg = workspaceStatusConfig[tripStatus];
  const travelerCount = deriveTripTravelers(trip);

  return (
    <header className="z-40 shrink-0 border-b border-border bg-card">
      <div className="flex h-[52px] items-center gap-1.5 overflow-hidden px-3 max-md:gap-1 max-md:px-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/trips")}
          aria-label="Back to trips"
          className="h-auto shrink-0 gap-1.5 px-1 text-muted-foreground hover:text-foreground max-md:size-11 max-md:px-2"
        >
          <ChevronLeft className="size-4" />
          <Compass className="size-4 text-primary" />
          <span className="hidden text-[13px] font-semibold sm:block">Wayfarer</span>
        </Button>

        <div className="h-5 w-px shrink-0 bg-border" />

        <div className="flex min-w-0 items-center gap-1.5 max-md:flex-1 md:shrink-0 md:gap-2">
          <div className="flex size-6 shrink-0 items-center justify-center rounded text-sm">{trip.emoji}</div>
          <h1 className="truncate text-[14px] font-semibold text-foreground">{trip.name}</h1>
          <Badge
            variant="outline"
            className={cn(
              "hidden shrink-0 gap-1 rounded-full px-2 py-0.5 text-xs md:flex",
              statusCfg.className,
            )}
          >
            <span className={cn("size-1.5 rounded-full", statusCfg.dot)} />
            {statusCfg.label}
          </Badge>
        </div>

        <div className="scrollbar-none hidden flex-1 items-center justify-center gap-1.5 overflow-x-auto px-2 md:flex">
          <Button
            variant={activeDay === null ? "default" : "secondary"}
            size="sm"
            onClick={() => onActiveDayChange(null)}
            className="h-7 shrink-0 rounded-full px-2.5 text-xs"
          >
            All days
          </Button>
          {days.map((d) => (
            <Button
              key={d.day}
              variant={activeDay === d.day ? "default" : "secondary"}
              size="sm"
              onClick={() => onActiveDayChange(activeDay === d.day ? null : d.day)}
              className={cn(
                "h-7 shrink-0 gap-1 rounded-full px-2.5 text-xs",
                activeDay === d.day && "text-primary-foreground",
              )}
              style={activeDay === d.day ? { backgroundColor: d.color, borderColor: d.color } : undefined}
            >
              <span
                className="size-1.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: activeDay === d.day ? "rgba(255,255,255,0.7)" : d.color,
                }}
              />
              Day&nbsp;{d.day}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon-sm"
            onClick={onOpenAddDayModal}
            className="ml-1 size-6 shrink-0 rounded-full"
            title="Add Custom Day"
          >
            <Plus className="size-3" />
          </Button>
        </div>

        <div className="hidden shrink-0 items-center gap-1 md:flex">
          <div className="-space-x-2 mr-1 flex items-center">
            {Array.from({ length: Math.min(travelerCount, 3) }).map((_, i) => {
              const avatars = ["🧑", "👩", "🧔"];
              return (
                <div
                  key={i}
                  className="flex size-6 items-center justify-center rounded-full bg-muted text-xs ring-2 ring-card select-none"
                >
                  {avatars[i % avatars.length]}
                </div>
              );
            })}
          </div>
          <span className="mr-2 hidden text-xs text-muted-foreground select-none lg:block">
            {travelerCount} {travelerCount === 1 ? "traveler" : "travelers"}
          </span>
          <Button variant="ghost" size="sm" className="h-auto gap-1 px-2.5 py-1.5 text-xs" onClick={onShareTrip}>
            <Share2 className="size-3.5" />
            <span>Share</span>
          </Button>
          <Button variant="ghost" size="sm" className="h-auto gap-1 px-2.5 py-1.5 text-xs" onClick={onExportTrip}>
            <Download className="size-3.5" />
            <span>Export</span>
          </Button>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 max-md:gap-0">
          <div className="relative md:hidden">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onToggleOverflow()}
              aria-label="More workspace actions"
              aria-expanded={showOverflow}
              className="max-md:size-11"
            >
              <MoreHorizontal className="size-4" />
            </Button>
            {showOverflow && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => onToggleOverflow(false)} />
                <div className="fixed inset-x-4 bottom-6 z-50 rounded-xl border border-border bg-card py-1.5 shadow-xl max-md:left-4 max-md:right-4 md:absolute md:inset-x-auto md:top-full md:right-0 md:bottom-auto md:mt-1 md:min-w-[160px]">
                  <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                    <div className="-space-x-1.5 flex items-center">
                      {Array.from({ length: Math.min(travelerCount, 3) }).map((_, i) => {
                        const avatars = ["🧑", "👩", "🧔"];
                        return (
                          <div
                            key={i}
                            className="flex size-5 items-center justify-center rounded-full bg-muted text-[11px] ring-2 ring-card select-none"
                          >
                            {avatars[i % avatars.length]}
                          </div>
                        );
                      })}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {travelerCount} {travelerCount === 1 ? "traveler" : "travelers"}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    className="h-auto w-full justify-start gap-2.5 rounded-none px-3 py-2.5"
                    onClick={() => {
                      void onShareTrip();
                      onToggleOverflow(false);
                    }}
                  >
                    <Share2 className="size-3.5" />
                    <span className="text-sm">Share</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-auto w-full justify-start gap-2.5 rounded-none px-3 py-2.5"
                    onClick={() => {
                      onExportTrip();
                      onToggleOverflow(false);
                    }}
                  >
                    <Download className="size-3.5" />
                    <span className="text-sm">Export</span>
                  </Button>
                </div>
              </>
            )}
          </div>

          <Button
            variant={inboxOpen ? "secondary" : "ghost"}
            size="sm"
            onClick={onToggleInbox}
            aria-label={`${inboxOpen ? "Close" : "Open"} inbox${
              unprocessedCount > 0 ? `, ${unprocessedCount} items to organize` : ""
            }`}
            className={cn(
              "h-auto shrink-0 gap-1 px-2.5 py-1.5 text-xs font-medium max-md:size-11 max-md:px-2",
              inboxOpen && "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-50",
            )}
          >
            {inboxOpen ? <PanelLeftClose className="size-3.5" /> : <PanelLeftOpen className="size-3.5" />}
            <span className="hidden sm:block">Inbox</span>
            {unprocessedCount > 0 && (
              <Badge variant="destructive" className="size-4 shrink-0 justify-center p-0 text-[10px]">
                {unprocessedCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <div className="relative md:hidden">
        <div className="scrollbar-none flex flex-nowrap items-center gap-1.5 overflow-x-auto px-4 pb-2.5">
          <Button
            variant={activeDay === null ? "default" : "secondary"}
            size="sm"
            onClick={() => onActiveDayChange(null)}
            className="h-8 shrink-0 rounded-full px-3 text-xs"
          >
            All
          </Button>
          {days.map((d) => (
            <Button
              key={d.day}
              variant={activeDay === d.day ? "default" : "secondary"}
              size="sm"
              onClick={() => onActiveDayChange(activeDay === d.day ? null : d.day)}
              className="h-8 shrink-0 gap-1 rounded-full px-3 text-xs"
              style={activeDay === d.day ? { backgroundColor: d.color, borderColor: d.color } : undefined}
            >
              <span
                className="size-1.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: activeDay === d.day ? "rgba(255,255,255,0.7)" : d.color,
                }}
              />
              Day&nbsp;{d.day}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon-sm"
            onClick={onOpenAddDayModal}
            className="size-7 shrink-0 rounded-full"
            title="Add Day"
          >
            <Plus className="size-3" />
          </Button>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-card to-transparent"
        />
      </div>

      {trip.dates && (
        <div className="flex items-center justify-between gap-3 border-t border-border/60 px-4 py-2 md:hidden">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <Calendar className="size-3 shrink-0" />
            <span className="truncate">{formatTripDates(trip.dates)}</span>
            <span className="text-border">·</span>
            <span className="shrink-0">{formatTripDurationNights(trip.dates)}</span>
            <span className="text-border">·</span>
            <span className="truncate">{trip.destination}</span>
          </div>
          <WorkspaceViewSwitcher value={workspaceView} onValueChange={onWorkspaceViewChange} />
        </div>
      )}
      {!trip.dates && (
        <div className="flex justify-end border-t border-border/60 px-4 py-2 md:hidden">
          <WorkspaceViewSwitcher value={workspaceView} onValueChange={onWorkspaceViewChange} />
        </div>
      )}
    </header>
  );
}
