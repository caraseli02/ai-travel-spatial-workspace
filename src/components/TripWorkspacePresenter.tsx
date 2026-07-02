import { useState, useCallback, useEffect, useMemo } from "react";
import type { NavigateFunction } from "react-router-dom";
import {
  Calendar,
  MapPin,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Clock,
  X,
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
import type { CanvasCard, Trip } from "../models/trip";
import { resolveCardSourceMemory } from "../models/tripMaterialMemory";
import type { TripWorkspaceState } from "../models/tripWorkspaceModel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTripWorkspaceState } from "../hooks/useTripWorkspaceState";
import { useLinkingSession } from "../hooks/useLinkingSession";
import { localTripRepository } from "../models/tripRepository";
import {
  deriveTripBudget,
  formatTripDates,
  formatTripDurationNights,
} from "../utils/tripCardHelpers";
import { AiPromptBar } from "./trip-workspace/AiPromptBar";
import { CreateCardModal } from "./trip-workspace/CreateCardModal";
import { AddDayModal } from "./trip-workspace/AddDayModal";
import { TripWorkspaceHeaderChrome } from "./trip-workspace/TripWorkspaceHeaderChrome";

export interface TripWorkspacePresenterProps {
  trip: Trip;
  isMobile: boolean;
  inboxOpen: boolean;
  setInboxOpen: React.Dispatch<React.SetStateAction<boolean>>;
  navigate: NavigateFunction;
  showOnboardingToast: boolean;
}

export default function TripWorkspacePresenter({
  trip,
  isMobile,
  inboxOpen,
  setInboxOpen,
  navigate,
  showOnboardingToast,
}: TripWorkspacePresenterProps) {
  const [kanbanZoom, setKanbanZoom] = useState(1);
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>("canvas");

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
  } = useTripWorkspaceState(initialState, trip);

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

  const linkingSession = useLinkingSession({
    connections: activeConnections,
    onAddConnection: addConnection,
  });

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
    if (days.some((d) => d.day === dayNum)) {
      alert(`Day ${dayNum} already exists!`);
      return;
    }
    addCustomDay(dayNum, labelText);
  }, [days, addCustomDay]);

  const setSelectedCard = useCallback((cardOrFn: CanvasCard | null | ((prev: CanvasCard | null) => CanvasCard | null)) => {
    if (typeof cardOrFn === "function") {
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
    setSelectedCard((current) => (current?.id === card.id ? null : card));
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
      <TripWorkspaceHeaderChrome
        trip={trip}
        navigate={navigate}
        days={days}
        activeDay={activeDay}
        onActiveDayChange={setActiveDay}
        onOpenAddDayModal={openAddDayModal}
        inboxOpen={inboxOpen}
        onToggleInbox={() => setInboxOpen((open) => !open)}
        inboxItems={items}
        showOverflow={showOverflow}
        onToggleOverflow={toggleOverflow}
        onShareTrip={handleShareTrip}
        onExportTrip={handleExportTrip}
        workspaceView={workspaceView}
        onWorkspaceViewChange={handleWorkspaceViewChange}
      />

      <div className="relative flex flex-1 overflow-hidden">
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

        <main className="relative flex-1 overflow-hidden">
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
                    <StatItem icon={<Calendar size={11} />} label={formatTripDates(trip.dates)} />
                    <div className="h-3 w-px shrink-0 bg-border" />
                    <StatItem icon={<MapPin size={11} />} label={trip.destination} />
                    {trip.dates && (
                      <>
                        <div className="h-3 w-px shrink-0 bg-border" />
                        <StatItem icon={<Clock size={11} />} label={formatTripDurationNights(trip.dates)} />
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

          {linkingSession.isActive && (
            <div className="absolute top-16 left-1/2 z-30 flex -translate-x-1/2 animate-pulse items-center gap-2.5 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-900 shadow-xl select-none">
              <span className="h-2 w-2 animate-ping rounded-full bg-amber-500" />
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

          {workspaceView !== "map" && (
            <AiPromptBar
              onSendQuery={handleSendQuery}
              isThinking={isAiThinking}
              dayCount={days.length}
              isMobile={isMobile}
            />
          )}

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
