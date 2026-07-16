import { useState, useCallback, useEffect, useMemo } from "react";
import type { NavigateFunction } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Clock,
  X,
} from "lucide-react";
import InboxPanel from "./InboxPanel";
import OnboardingToast from "./OnboardingToast";
import CardDetailPanel from "./CardDetailPanel";
import {
  TripCanvasKanbanView,
  TripMapView,
  type WorkspaceView,
} from "./TripWorkspaceViews";
import type { CanvasCard, Trip } from "../models/trip";
import { resolveCardSourceMemory } from "../models/tripMaterialMemory";
import type { TripWorkspaceState } from "../models/tripWorkspaceModel";
import { buildInboxItem, shouldCaptureViaPromptBar } from "../models/tripWorkspaceInbox";
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
import { WorkspaceCanvasToolbar } from "./trip-workspace/WorkspaceCanvasToolbar";
import { WorkspaceOverlayChrome } from "./trip-workspace/WorkspaceOverlayChrome";
import { WorkspaceTripStatsPill } from "./trip-workspace/WorkspaceTripStatsPill";
import {
  WorkspaceActionFeedback,
  type WorkspaceFeedback,
} from "./trip-workspace/WorkspaceActionFeedback";
import {
  buildExportFeedback,
  buildShareFeedback,
  buildInboxCaptureFeedback,
} from "./trip-workspace/workspaceFeedbackMessages";
import { useTripWorkspaceFeedbackEffects } from "./trip-workspace/useTripWorkspaceFeedbackEffects";

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
  const [kanbanViewResetNonce, setKanbanViewResetNonce] = useState(0);
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>("canvas");
  const [workspaceFeedback, setWorkspaceFeedback] = useState<WorkspaceFeedback | null>(null);
  const [pendingOrganizedItemId, setPendingOrganizedItemId] = useState<string | null>(null);

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
    aiPromptEffect,
    clearAiPromptEffect,
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
  const handleProcessItem = useCallback((id: string) => {
    setPendingOrganizedItemId(id);
    processInboxItem(id);
  }, [processInboxItem]);
  const handleSendQuery = useCallback((query: string) => {
    if (!query.trim()) return;

    if (shouldCaptureViaPromptBar(query, isMobile)) {
      const capturedItem = buildInboxItem(query);
      addInboxItem(query);
      setWorkspaceFeedback(buildInboxCaptureFeedback({ label: capturedItem.source }));
      setInboxOpen(true);
      return;
    }

    sendAiQuery(query);
  }, [isMobile, addInboxItem, sendAiQuery, setInboxOpen]);
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
      setWorkspaceFeedback({
        tone: "error",
        title: "Day already exists",
        message: `Day ${dayNum} is already in this Trip Workspace.`,
      });
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

  useTripWorkspaceFeedbackEffects({
    pendingOrganizedItemId,
    setPendingOrganizedItemId,
    isAiThinking,
    aiPromptEffect,
    clearAiPromptEffect,
    items,
    cards,
    setSelectedCard,
    setWorkspaceFeedback,
    setInboxOpen,
  });

  const handleZoom = useCallback((direction: "in" | "out") => {
    setKanbanZoom((current) => {
      const next = direction === "in" ? current + 0.1 : current - 0.1;
      return Math.min(1.4, Math.max(0.8, Number(next.toFixed(2))));
    });
  }, []);
  const handleReset = useCallback(() => {
    setKanbanZoom(1);
    setKanbanViewResetNonce((nonce) => nonce + 1);
  }, []);

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
    let usedNativeShare = false;
    if (navigator.share) {
      try {
        await navigator.share({ title: trip.name, url });
        usedNativeShare = true;
        setWorkspaceFeedback(buildShareFeedback("native-shared"));
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          // fall through to clipboard when share fails
        }
      }
    }
    if (usedNativeShare) return;
    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API unavailable");
      }
      await navigator.clipboard.writeText(url);
      setWorkspaceFeedback(buildShareFeedback("clipboard-copied"));
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      const legacyCopied = document.execCommand("copy");
      document.body.removeChild(textarea);

      if (legacyCopied) {
        setWorkspaceFeedback(buildShareFeedback("clipboard-copied"));
      } else {
        setWorkspaceFeedback(buildShareFeedback("copy-failed", url));
      }
    }
  }, [trip.name]);

  const handleExportTrip = useCallback(() => {
    const filename = `${trip.id}.json`;
    let objectUrl: string | null = null;

    try {
      const blob = new Blob([JSON.stringify(trip, null, 2)], { type: "application/json" });
      objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      anchor.click();
      setWorkspaceFeedback(buildExportFeedback("download-started", filename));
    } catch {
      setWorkspaceFeedback(buildExportFeedback("download-failed", filename));
    } finally {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    }
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
                showCaptureInput={isMobile}
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
            <WorkspaceOverlayChrome
              className="z-[700]"
              view={workspaceView}
              onViewChange={handleWorkspaceViewChange}
              toolbar={
                <WorkspaceCanvasToolbar
                  zoomPercent={Math.round(kanbanZoom * 100)}
                  onZoomIn={() => handleZoom("in")}
                  onZoomOut={() => handleZoom("out")}
                  onReset={handleReset}
                />
              }
              stats={
                <WorkspaceTripStatsPill
                  items={[
                    { icon: <Calendar size={11} />, label: formatTripDates(trip.dates) },
                    { icon: <MapPin size={11} />, label: trip.destination },
                    ...(trip.dates
                      ? [{ icon: <Clock size={11} />, label: formatTripDurationNights(trip.dates) }]
                      : []),
                  ]}
                  trailing={
                    <span className="hidden text-xs text-muted-foreground lg:inline">
                      Budget:{" "}
                      <span className="font-semibold text-foreground">{deriveTripBudget(trip)}</span>
                    </span>
                  }
                />
              }
            />
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

          <WorkspaceActionFeedback
            feedback={workspaceFeedback}
            avoidDetailPanel={selectedCard !== null}
            onDismiss={() => setWorkspaceFeedback(null)}
          />

          {workspaceView === "canvas" && (
            <TripCanvasKanbanView
              days={days}
              cards={cards}
              activeDay={activeDay}
              selectedCard={selectedCard}
              isLinkingActive={linkingSession.isActive}
              linkingOriginId={linkingSession.originId}
              zoom={kanbanZoom}
              viewResetNonce={kanbanViewResetNonce}
              isMobile={isMobile}
              onActiveDayChange={setActiveDay}
              onSelectCard={handleCanvasCardSelect}
              onCreateCard={() => handleOpenCreateModal(900, 680)}
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

          <AiPromptBar
            onSendQuery={handleSendQuery}
            isThinking={isAiThinking}
            dayCount={days.length}
            isMobile={isMobile}
            workspaceView={workspaceView}
          />

          {showOnboardingToast && <OnboardingToast forceShow />}

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
