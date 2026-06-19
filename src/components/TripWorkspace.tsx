import { useState, useCallback, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Compass,
  ChevronLeft,
  MapPin,
  Calendar,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Share2,
  Download,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Clock,
  X,
  MoreHorizontal,
} from "lucide-react";
import InboxPanel from "./InboxPanel";
import OnboardingToast from "./OnboardingToast";
import CardDetailPanel from "./CardDetailPanel";
import {
  TripCanvasKanbanView,
  TripMapView,
  WorkspaceViewSwitcher,
  type WorkspaceView,
} from "./TripWorkspaceViews";
import type { CanvasCard } from "../models/trip";
import {
  cardTypeOptions,
  isCardType,
} from "../models/tripWorkspaceModel";
import { resolveCardSourceMemory } from "../models/tripMaterialMemory";
import type { CardType, TripWorkspaceState } from "../models/tripWorkspaceModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTripWorkspaceState } from '../hooks/useTripWorkspaceState';
import { useLinkingSession } from '../hooks/useLinkingSession';
import { localTripRepository } from '../models/tripRepository';
import type { Trip } from '../models/trip';
import {
  deriveTripStatus,
  deriveTripTravelers,
  deriveTripBudget,
} from '../utils/tripCardHelpers';

const workspaceStatusConfig = {
  upcoming: {
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    dot: "bg-emerald-500",
    label: "Upcoming",
  },
  ongoing: {
    className: "border-amber-200 bg-amber-50 text-amber-900",
    dot: "bg-amber-500",
    label: "Ongoing",
  },
  completed: {
    className: "border-border bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
    label: "Completed",
  },
  planning: {
    className: "border-sky-200 bg-sky-50 text-sky-800",
    dot: "bg-sky-500",
    label: "Planning",
  },
};

const formatRange = (startStr?: string, endStr?: string) => {
  if (!startStr || !endStr) return "Flexible";
  try {
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return "Flexible";

    const startMonth = start.toLocaleDateString("en-US", { month: "short" });
    const endMonth = end.toLocaleDateString("en-US", { month: "short" });
    const year = start.getFullYear();

    if (start.getFullYear() !== end.getFullYear()) {
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }
    if (startMonth !== endMonth) {
      return `${startMonth} ${start.getDate()}–${endMonth} ${end.getDate()}, ${year}`;
    }
    if (start.getDate() !== end.getDate()) {
      return `${startMonth} ${start.getDate()}–${end.getDate()}, ${year}`;
    }
    return start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "Flexible";
  }
};

const getDurationNights = (startStr?: string, endStr?: string) => {
  if (!startStr || !endStr) return 'Flexible';
  try {
    const s = new Date(startStr);
    const e = new Date(endStr);
    const diffTime = Math.abs(e.getTime() - s.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} ${diffDays === 1 ? 'night' : 'nights'}`;
  } catch {
    return 'Flexible';
  }
};


export default function TripWorkspace() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const showOnboardingToast = useMemo(
    () => new URLSearchParams(location.search).get('onboarding') === '1',
    [location.search],
  );
  const [isMobile, setIsMobile] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(true);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Load trip from repository on mount
  useEffect(() => {
    if (!tripId) {
      setNotFound(true);
      return;
    }
    const loaded = localTripRepository.load(tripId);
    if (!loaded) {
      setNotFound(true);
      return;
    }
    setTrip(loaded);
  }, [tripId]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    // On mobile, close inbox by default so the workspace canvas is clean
    if (window.innerWidth < 768) {
      setInboxOpen(false);
    }
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle not found or loading states
  if (notFound) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="mb-4 text-lg text-muted-foreground">Trip not found</p>
          <Button onClick={() => navigate("/trips")}>Back to trips</Button>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Compass size={16} className="animate-spin" />
          <span className="text-sm">Loading workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <TripWorkspacePresenter
      trip={trip}
      isMobile={isMobile}
      inboxOpen={inboxOpen}
      setInboxOpen={setInboxOpen}
      navigate={navigate}
      showOnboardingToast={showOnboardingToast}
    />
  );
}

interface PresenterProps {
  trip: Trip;
  isMobile: boolean;
  inboxOpen: boolean;
  setInboxOpen: React.Dispatch<React.SetStateAction<boolean>>;
  navigate: ReturnType<typeof useNavigate>;
  showOnboardingToast: boolean;
}

function TripWorkspacePresenter({
  trip,
  isMobile,
  inboxOpen,
  setInboxOpen,
  navigate,
  showOnboardingToast,
}: PresenterProps) {
  const [kanbanZoom, setKanbanZoom] = useState(1);
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>("canvas");

  // Build initial state from loaded trip
  const initialState = useMemo<TripWorkspaceState>(() => {
    return {
      activeDay: null,
      days: trip.days,
      dayLabels: trip.dayLabels,
      cards: trip.cards,
      connections: trip.connections,
      items: trip.inboxItems,
      selectedCard: null,
      isAiThinking: false,
      showCreateModal: false,
      createModalCoords: null,
      showAddDayModal: false,
      showOverflow: false,
    };
  }, [trip]);

  // Initialize unified State coordinator hook
  const {
    state,
    addInboxItem,
    processInboxItem,
    deleteCard,
    updateCard,
    addConnection,
    addCustomDay,
    sendAiQuery,
    setSelectedCard: hookSetSelectedCard,
    openCreateModal,
    closeCreateModal,
    openAddDayModal,
    closeAddDayModal,
    toggleOverflow,
    setActiveDay,
    createManualCard,
  } = useTripWorkspaceState(initialState);

  // Extract variables for easier mapping back to existing JSX naming
  const {
    activeDay,
    days,
    dayLabels,
    cards,
    connections: activeConnections,
    selectedCard,
    showCreateModal,
    showAddDayModal,
    showOverflow,
    items,
    isAiThinking,
  } = state;

  // Initialize stateful Linking Session adapter
  const linkingSession = useLinkingSession({
    connections: activeConnections,
    onAddConnection: addConnection,
  });

  // Compatibility adapters to map old callback names exactly, avoiding wide-scale JSX modifications
  const handleAddItem = addInboxItem;
  const handleProcessItem = processInboxItem;
  const handleSendQuery = sendAiQuery;
  const handleUpdateCard = updateCard;
  const handleDeleteCard = deleteCard;
  const handleStartLinking = linkingSession.start;
  
  const handleOpenCreateModal = useCallback((x?: number, y?: number) => {
    if (x !== undefined && y !== undefined) {
      openCreateModal({ x, y });
    } else {
      openCreateModal({ x: 450, y: 250 });
    }
  }, [openCreateModal]);

  const handleCreateManualCard = createManualCard;

  const handleAddCustomDay = useCallback((dayNum: number, labelText: string) => {
    if (days.some(d => d.day === dayNum)) {
      alert(`Day ${dayNum} already exists!`);
      return;
    }
    addCustomDay(dayNum, labelText);
  }, [days, addCustomDay]);

  const setSelectedCard = useCallback((cardOrFn: CanvasCard | null | ((prev: CanvasCard | null) => CanvasCard | null)) => {
    if (typeof cardOrFn === 'function') {
      hookSetSelectedCard(cardOrFn(selectedCard));
    } else {
      hookSetSelectedCard(cardOrFn);
    }
  }, [selectedCard, hookSetSelectedCard]);

  const handleZoom = useCallback((direction: "in" | "out") => {
    setKanbanZoom((current) => {
      const next = direction === "in" ? current + 0.1 : current - 0.1;
      return Math.min(1.4, Math.max(0.8, Number(next.toFixed(2))));
    });
  }, []);
  const handleReset = useCallback(() => setKanbanZoom(1), []);

  // Persist domain state to repository on every change.
  useEffect(() => {
    const handler = setTimeout(() => {
      localTripRepository.save({
        ...trip,
        cards: state.cards,
        connections: activeConnections,
        inboxItems: items,
        days,
        dayLabels,
      });
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [state.cards, activeConnections, items, days, dayLabels, trip]);

  const selectedCardSourceMemory = selectedCard
    ? resolveCardSourceMemory(selectedCard, items)
    : undefined;
  const handleWorkspaceViewChange = useCallback((view: WorkspaceView) => {
    setWorkspaceView(view);
    if (view === "map" && !isMobile) {
      setInboxOpen(false);
    }
  }, [isMobile, setInboxOpen]);

  const handleCanvasCardSelect = useCallback((card: CanvasCard) => {
    if (linkingSession.isActive) {
      linkingSession.resolveTarget(card.id);
      return;
    }
    setSelectedCard((current) => current?.id === card.id ? null : card);
  }, [linkingSession, setSelectedCard]);

  const handleShareTrip = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: trip.name, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      alert("Trip link copied to clipboard.");
    } catch {
      alert("Could not copy the trip link. Copy it from the address bar.");
    }
  }, [trip.name]);

  const handleExportTrip = useCallback(() => {
    const blob = new Blob([JSON.stringify(trip, null, 2)], { type: "application/json" });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = `${trip.id}.json`;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
  }, [trip]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">

      {/* TOP NAV */}
      <header className="z-40 shrink-0 border-b border-border bg-card">

        {/* ── Single Row (desktop) / Top Row (mobile) ── */}
        <div className="flex h-[52px] items-center gap-2 px-4">

          {/* Back + brand */}
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

          {/* Trip identity */}
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded text-sm">{trip.emoji}</div>
            <h1 className="text-[14px] font-semibold text-foreground">{trip.name}</h1>
            {(() => {
              const tripStatus = deriveTripStatus(trip);
              const statusCfg = workspaceStatusConfig[tripStatus];
              return (
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
              );
            })()}
          </div>

          {/* Desktop center: Day filter pills (hidden on mobile — shown in row 2 below) */}
          <div className="scrollbar-none hidden flex-1 items-center justify-center gap-1.5 overflow-x-auto px-2 md:flex">
            <Button
              variant={activeDay === null ? "default" : "secondary"}
              size="sm"
              onClick={() => setActiveDay(null)}
              className="h-7 shrink-0 rounded-full px-2.5 text-xs"
            >
              All days
            </Button>
            {days.map((d) => (
              <Button
                key={d.day}
                variant={activeDay === d.day ? "default" : "secondary"}
                size="sm"
                onClick={() => setActiveDay(activeDay === d.day ? null : d.day)}
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
              onClick={openAddDayModal}
              className="ml-1 size-6 shrink-0 rounded-full"
              title="Add Custom Day"
            >
              <Plus className="size-3" />
            </Button>
          </div>

          {/* Mobile: push actions to the right */}
          <div className="flex-1 md:hidden" />

          {/* Desktop-only secondary actions */}
          <div className="hidden shrink-0 items-center gap-1 md:flex">
            <div className="-space-x-2 mr-1 flex items-center">
              {Array.from({ length: Math.min(deriveTripTravelers(trip), 3) }).map((_, i) => {
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
              {deriveTripTravelers(trip)}{" "}
              {deriveTripTravelers(trip) === 1 ? "traveler" : "travelers"}
            </span>
            <Button variant="ghost" size="sm" className="h-auto gap-1 px-2.5 py-1.5 text-xs" onClick={handleShareTrip}>
              <Share2 className="size-3.5" />
              <span>Share</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-auto gap-1 px-2.5 py-1.5 text-xs" onClick={handleExportTrip}>
              <Download className="size-3.5" />
              <span>Export</span>
            </Button>
          </div>

          {/* Mobile overflow ··· */}
          <div className="relative md:hidden">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => toggleOverflow()}
              aria-label="More workspace actions"
              aria-expanded={showOverflow}
              className="max-md:size-11"
            >
              <MoreHorizontal className="size-4" />
            </Button>
            {showOverflow && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => toggleOverflow(false)} />
                <div className="fixed inset-x-4 bottom-6 z-50 rounded-xl border border-border bg-card py-1.5 shadow-xl max-md:left-4 max-md:right-4 md:absolute md:inset-x-auto md:top-full md:right-0 md:bottom-auto md:mt-1 md:min-w-[160px]">
                  <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                    <div className="-space-x-1.5 flex items-center">
                      {Array.from({ length: Math.min(deriveTripTravelers(trip), 3) }).map((_, i) => {
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
                      {deriveTripTravelers(trip)}{" "}
                      {deriveTripTravelers(trip) === 1 ? "traveler" : "travelers"}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    className="h-auto w-full justify-start gap-2.5 rounded-none px-3 py-2.5"
                    onClick={() => {
                      void handleShareTrip();
                      toggleOverflow(false);
                    }}
                  >
                    <Share2 className="size-3.5" />
                    <span className="text-sm">Share</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-auto w-full justify-start gap-2.5 rounded-none px-3 py-2.5"
                    onClick={() => {
                      handleExportTrip();
                      toggleOverflow(false);
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
            onClick={() => setInboxOpen((o) => !o)}
            aria-label={`${inboxOpen ? "Close" : "Open"} inbox${
              items.filter((i) => !i.processed).length > 0
                ? `, ${items.filter((i) => !i.processed).length} items to organize`
                : ""
            }`}
            className={cn(
              "h-auto shrink-0 gap-1 px-2.5 py-1.5 text-xs font-medium max-md:size-11",
              inboxOpen && "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-50",
            )}
          >
            {inboxOpen ? <PanelLeftClose className="size-3.5" /> : <PanelLeftOpen className="size-3.5" />}
            <span className="hidden sm:block">Inbox</span>
            {items.filter((i) => !i.processed).length > 0 && (
              <Badge variant="destructive" className="size-4 justify-center p-0 text-[10px]">
                {items.filter((i) => !i.processed).length}
              </Badge>
            )}
          </Button>
        </div>

        {/* ── Row 2: Day filter strip — mobile only ── */}
        <div className="relative md:hidden">
          <div className="scrollbar-none flex flex-nowrap items-center gap-1.5 overflow-x-auto px-4 pb-2.5">
          <Button
            variant={activeDay === null ? "default" : "secondary"}
            size="sm"
            onClick={() => setActiveDay(null)}
            className="h-8 shrink-0 rounded-full px-3 text-xs"
          >
            All
          </Button>
          {days.map((d) => (
            <Button
              key={d.day}
              variant={activeDay === d.day ? "default" : "secondary"}
              size="sm"
              onClick={() => setActiveDay(activeDay === d.day ? null : d.day)}
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
            onClick={openAddDayModal}
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
              <span className="truncate">{formatRange(trip.dates.start, trip.dates.end)}</span>
              <span className="text-border">·</span>
              <span className="shrink-0">{getDurationNights(trip.dates.start, trip.dates.end)}</span>
              <span className="text-border">·</span>
              <span className="truncate">{trip.destination}</span>
            </div>
            <WorkspaceViewSwitcher value={workspaceView} onValueChange={handleWorkspaceViewChange} />
          </div>
        )}
        {!trip.dates && (
          <div className="flex justify-end border-t border-border/60 px-4 py-2 md:hidden">
            <WorkspaceViewSwitcher value={workspaceView} onValueChange={handleWorkspaceViewChange} />
          </div>
        )}
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* INBOX SIDEBAR */}
        <aside
          className={cn(
            "absolute h-full shrink-0 overflow-hidden bg-card transition-all duration-300 animate-in fade-in md:relative md:z-30 md:shadow-none",
            isMobile && inboxOpen ? "z-[750]" : "z-30",
            inboxOpen ? "border-r border-border shadow-2xl md:shadow-none" : "border-r-0",
          )}
          style={{
            width: inboxOpen ? (isMobile ? "100%" : "280px") : "0px",
          }}
        >
          {inboxOpen && (
            <div className="h-full w-full md:w-[280px]">
              <InboxPanel
                items={items}
                cards={cards}
                onProcessItem={(id) => {
                  handleProcessItem(id);
                  if (isMobile) {
                    setInboxOpen(false);
                  }
                }}
                onAddItem={handleAddItem}
                onOpenAddManual={() => handleOpenCreateModal()}
              />
            </div>
          )}
        </aside>

        {/* CANVAS AREA */}
        <main className="flex-1 relative overflow-hidden">

          {/* Workspace chrome: zoom (left) · view switcher (center) · stats (right) — desktop only */}
          {!isMobile && !(isMobile && inboxOpen) && !selectedCard && (
          <div className="absolute inset-x-3 top-3 z-[700] md:inset-x-0 md:px-3">
            <div
              className={cn(
                "flex w-full items-center gap-2",
                workspaceView === "canvas" ? "justify-between md:justify-start" : "justify-end",
              )}
            >
              {workspaceView === "canvas" ? (
                <div className="hidden shrink-0 items-center gap-1 rounded-xl border border-border bg-card px-1 py-1 shadow-sm md:flex">
                  <ToolBtn icon={<ZoomIn size={14} />} onClick={() => handleZoom("in")} title="Zoom in" />
                  <span className="px-1 font-mono text-xs text-muted-foreground tabular-nums">
                    {Math.round(kanbanZoom * 100)}%
                  </span>
                  <ToolBtn icon={<ZoomOut size={14} />} onClick={() => handleZoom("out")} title="Zoom out" />
                  <div className="mx-0.5 hidden h-4 w-px bg-border sm:block" />
                  <div className="hidden sm:contents">
                    <ToolBtn icon={<Maximize2 size={14} />} onClick={handleReset} title="Reset view" />
                  </div>
                </div>
              ) : (
                <div className="hidden shrink-0 md:block md:w-0" aria-hidden />
              )}

              <div
                className={cn(
                  "shrink-0",
                  workspaceView === "canvas"
                    ? "md:flex md:min-w-0 md:flex-1 md:justify-center md:px-3"
                    : "md:flex md:min-w-0 md:flex-1 md:justify-center",
                )}
              >
                <WorkspaceViewSwitcher value={workspaceView} onValueChange={handleWorkspaceViewChange} />
              </div>

              {workspaceView !== "map" ? (
                <div className="hidden max-w-[min(100%,28rem)] shrink-0 select-none items-center gap-1.5 overflow-hidden rounded-xl border border-border bg-card px-2 py-1.5 shadow-sm md:flex md:gap-2 md:px-2.5 md:py-2 lg:max-w-none lg:gap-2.5 lg:px-3">
                  <StatItem icon={<Calendar size={11} />} label={formatRange(trip.dates?.start, trip.dates?.end)} />
                  <div className="h-3 w-px shrink-0 bg-border" />
                  <StatItem icon={<MapPin size={11} />} label={trip.destination} />
                  {trip.dates && (
                    <>
                      <div className="h-3 w-px shrink-0 bg-border" />
                      <StatItem icon={<Clock size={11} />} label={getDurationNights(trip.dates?.start, trip.dates?.end)} />
                    </>
                  )}
                  <div className="hidden h-3 w-px shrink-0 bg-border lg:block" />
                  <span className="hidden text-xs text-muted-foreground lg:inline">
                    Budget: <span className="font-semibold text-foreground">{deriveTripBudget(trip)}</span>
                  </span>
                </div>
              ) : (
                <div className="hidden shrink-0 md:block md:w-0" aria-hidden />
              )}
            </div>
          </div>
          )}

          {/* Linking Mode Active Banner */}
          {linkingSession.isActive && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-4 py-2 rounded-full border shadow-xl bg-amber-50 border-amber-300 text-amber-900 animate-pulse text-xs font-semibold select-none">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Link Mode: Click another card on the canvas to connect them</span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={linkingSession.cancel}
                className="ml-1 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                aria-label="Cancel link mode"
              >
                <X size={12} />
              </Button>
            </div>
          )}

          {/* AI prompt bar */}
          {workspaceView !== "map" && (
            <AiPromptBar
              onSendQuery={handleSendQuery}
              isThinking={isAiThinking}
              dayCount={days.length}
              isMobile={isMobile}
            />
          )}

          {/* THE CANVAS */}
          {workspaceView === "canvas" && (
            <TripCanvasKanbanView
              days={days}
              cards={cards}
              activeDay={activeDay}
              selectedCard={selectedCard}
              isLinkingActive={linkingSession.isActive}
              linkingOriginId={linkingSession.originId}
              zoom={kanbanZoom}
              isMobile={isMobile}
              onActiveDayChange={setActiveDay}
              onSelectCard={handleCanvasCardSelect}
              onCreateCard={() => handleOpenCreateModal(900, 680)}
              onOpenMap={() => handleWorkspaceViewChange("map")}
            />
          )}

          {workspaceView === "map" && (
            <TripMapView
              days={days}
              cards={cards}
              activeDay={activeDay}
              selectedCard={selectedCard}
              onSelectCard={(card) => setSelectedCard(card)}
            />
          )}

          {showOnboardingToast && <OnboardingToast />}

          {/* Card detail panel */}
          <CardDetailPanel
            card={selectedCard}
            sourceMemory={selectedCardSourceMemory}
            onClose={() => setSelectedCard(null)}
            onUpdateCard={handleUpdateCard}
            onDeleteCard={handleDeleteCard}
            onStartLinking={handleStartLinking}
            isLinkingActive={linkingSession.isActive && linkingSession.originId === selectedCard?.id}
          />

        </main>
      </div>

      {/* DYNAMIC DIALOGS / OVERLAYS */}
      <CreateCardModal
        isOpen={showCreateModal}
        onClose={closeCreateModal}
        onSubmit={handleCreateManualCard}
        days={days}
      />

      <AddDayModal
        isOpen={showAddDayModal}
        onClose={closeAddDayModal}
        onSubmit={handleAddCustomDay}
        nextDayNum={days.length + 1}
      />
    </div>
  );
}

function ToolBtn({
  icon,
  onClick,
  title,
  active,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  title: string;
  active?: boolean;
}) {
  return (
    <Button
      variant={active ? "secondary" : "ghost"}
      size="icon-sm"
      onClick={onClick}
      title={title}
      className={cn("size-7", active && "border-amber-200 bg-amber-50 text-amber-900")}
    >
      {icon}
    </Button>
  );
}

function StatItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex min-w-0 items-center gap-1 text-muted-foreground">
      <span className="shrink-0">{icon}</span>
      <span className="truncate text-xs">{label}</span>
    </div>
  );
}

interface AiPromptBarProps {
  onSendQuery: (query: string) => void;
  isThinking: boolean;
  dayCount: number;
  isMobile: boolean;
}

function AiPromptBar({ onSendQuery, isThinking, dayCount, isMobile }: AiPromptBarProps) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const nextDay = dayCount + 1;
  const suggestions = [
    `Plan Day ${nextDay}`,
    'Suggest a ryokan in Arashiyama',
    'Find a restaurant near Gion',
  ];
  const placeholderExample = `Plan Day ${nextDay}`;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!value.trim() || isThinking) return;
    onSendQuery(value);
    setValue('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSendQuery(suggestion);
  };

  return (
    <div className="absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 z-20 w-full max-w-lg -translate-x-1/2 select-none px-4 md:bottom-14">
      <form
        onSubmit={handleSubmit}
        className={cn(
          "rounded-xl border bg-card transition-all duration-200",
          focused ? "border-amber-300 shadow-lg" : "border-border shadow-sm",
        )}
      >
        <div className="flex items-center gap-2 px-3 py-2.5">
          {isThinking ? (
            <Sparkles size={14} className="animate-spin text-amber-500" />
          ) : (
            <Sparkles size={14} className="text-primary" />
          )}
          <Input
            className="h-auto flex-1 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0"
            placeholder={
              isThinking
                ? "AI is thinking..."
                : isMobile
                  ? "Ask AI about this trip…"
                  : `Ask AI: "${placeholderExample}" or "Suggest a ryokan in Arashiyama"`
            }
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            disabled={isThinking}
          />
          {isThinking ? (
            <div className="flex items-center gap-1">
              <span
                className="size-1.5 animate-bounce rounded-full bg-amber-500"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="size-1.5 animate-bounce rounded-full bg-amber-500"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="size-1.5 animate-bounce rounded-full bg-amber-500"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          ) : (
            value && (
              <Button type="submit" size="icon-sm" className="size-6 shrink-0">
                <Plus size={12} className="rotate-45" />
              </Button>
            )
          )}
        </div>

        {focused && !value && !isThinking && (
          <div className="flex animate-in flex-wrap gap-1.5 px-3 pb-2.5 fade-in slide-in-from-bottom-1">
            {suggestions.map((s, i) => (
              <Button
                key={i}
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleSuggestionClick(s)}
                className="h-auto rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs text-amber-900 hover:bg-amber-100"
              >
                {s}
              </Button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}

// --- SUB-COMPONENTS FOR CREATING CARDS AND CUSTOM DAYS ---

function CreateCardModal({
  isOpen,
  onClose,
  onSubmit,
  days,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cardData: Omit<CanvasCard, "id" | "x" | "y" | "rotation">) => void;
  days: { day: number; label: string }[];
}) {
  const [type, setType] = useState<CardType>("sticky");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [day, setDay] = useState("0");
  const [detailsString, setDetailsString] = useState("");
  const [price, setPrice] = useState("");
  const [rating, setRating] = useState("4.5");

  useEffect(() => {
    if (isOpen) {
      setType("sticky");
      setTitle("");
      setSubtitle("");
      setDay("0");
      setDetailsString("");
      setPrice("");
      setRating("4.5");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const details = detailsString
      ? detailsString
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    let image = undefined;
    let color = undefined;

    if (type === "polaroid") {
      image = "/images/gion.jpg";
    } else if (type === "hotel") {
      image = "/images/ryokan.jpg";
    } else if (type === "sticky") {
      color = "#fef3c7";
    }

    onSubmit({
      type,
      title,
      subtitle: subtitle || undefined,
      day: Number(day),
      details: details.length > 0 ? details : undefined,
      price: price || undefined,
      rating: type === "hotel" || type === "polaroid" ? Number(rating) : undefined,
      image,
      color,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex max-h-[90vh] flex-col">
          <DialogHeader className="border-b border-border px-5 py-4">
            <DialogTitle>Create Spatial Card</DialogTitle>
          </DialogHeader>

          <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-5">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Card Type
              </Label>
              <Select value={type} onValueChange={(v) => isCardType(v) && setType(v)}>
                <SelectTrigger className="h-9 w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cardTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Title
              </Label>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xs"
                placeholder="e.g. Kyoto Tower visit"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Subtitle / Description
              </Label>
              <Input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="text-xs"
                placeholder="e.g. Evening panorama of the city lights"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Associate Day
              </Label>
              <Select value={day} onValueChange={setDay}>
                <SelectTrigger className="h-9 w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Unassigned (Logistics)</SelectItem>
                  {days.map((d) => (
                    <SelectItem key={d.day} value={String(d.day)}>
                      Day {d.day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Details (one bullet per line)
              </Label>
              <Textarea
                value={detailsString}
                onChange={(e) => setDetailsString(e.target.value)}
                className="h-16 resize-none text-xs"
                placeholder={"Detail line 1\nDetail line 2"}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {(type === "hotel" || type === "flight") && (
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Price
                  </Label>
                  <Input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="text-xs"
                    placeholder="e.g. $140 total"
                  />
                </div>
              )}
              {(type === "hotel" || type === "polaroid") && (
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Rating
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="text-xs"
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="shrink-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Card</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddDayModal({
  isOpen,
  onClose,
  onSubmit,
  nextDayNum,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dayNum: number, label: string) => void;
  nextDayNum: number;
}) {
  const [dayNum, setDayNum] = useState(String(nextDayNum));
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (isOpen) {
      setDayNum(String(nextDayNum));
      setLabel("");
    }
  }, [isOpen, nextDayNum]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    onSubmit(Number(dayNum), label);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-0 p-0 sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="border-b border-border px-5 py-4">
            <DialogTitle>Add Custom Day</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 p-5">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Day Index
              </Label>
              <Input
                type="number"
                min="1"
                required
                value={dayNum}
                onChange={(e) => setDayNum(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Day Label / Activity
              </Label>
              <Input
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="text-xs"
                placeholder="e.g. Nanzenji Temple & Tofu dinner"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Day</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
