import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Compass,
  ChevronLeft,
  MapPin,
  Calendar,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid3X3,
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
import { CanvasCardRenderer } from "./CanvasCards";
import InboxPanel from "./InboxPanel";
import OnboardingToast from "./OnboardingToast";
import CardDetailPanel from "./CardDetailPanel";
import type { CanvasCard } from "../models/trip";
import {
  cardTypeOptions,
  getCardCenter,
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
import { useSpatialViewport } from '../hooks/useSpatialViewport';
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
  if (!startStr || !endStr) return 'Flexible';
  try {
    const s = new Date(startStr);
    const e = new Date(endStr);
    const startOpt: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const endOpt: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    if (s.getFullYear() !== new Date().getFullYear()) {
      startOpt.year = '2-digit';
    }
    if (e.getFullYear() !== s.getFullYear()) {
      endOpt.year = '2-digit';
    }
    return `${s.toLocaleDateString('en-US', startOpt)} – ${e.toLocaleDateString('en-US', endOpt)}`;
  } catch {
    return 'Flexible';
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
  const [showDayLabels, setShowDayLabels] = useState(true);

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
    updateCardPosition,
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

  // Initialize Spatial Viewport Physics hook
  const {
    zoom,
    pan,
    isDraggingCanvas,
    draggingCardId,
    handleZoom,
    handleReset,
    handleMouseDown,
    handleTouchStart,
    handleMouseMove,
    handleTouchMove,
    handleMouseUp,
    handleCardMouseDown,
    handleCardTouchStart,
  } = useSpatialViewport({
    cards,
    onUpdateCardPosition: updateCardPosition,
    isLinkingActive: linkingSession.isActive,
    onCancelLinking: linkingSession.cancel,
  });

  const canvasRef = useRef<HTMLDivElement>(null);
  // Persist domain state to repository on every change (debounced and skipped during dragging to optimize performance)
  useEffect(() => {
    // Skip saving while a card is being dragged to prevent synchronous main-thread stalls
    if (draggingCardId !== null) {
      return;
    }

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
  }, [state.cards, activeConnections, items, days, dayLabels, trip, draggingCardId]);

  const filteredCards = activeDay
    ? cards.filter(c => c.day === activeDay || c.day === 0)
    : cards;
  const selectedCardSourceMemory = selectedCard
    ? resolveCardSourceMemory(selectedCard, items)
    : undefined;

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
            className="h-auto shrink-0 gap-1.5 px-1 text-muted-foreground hover:text-foreground"
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
            <Button variant="ghost" size="sm" className="h-auto gap-1 px-2.5 py-1.5 text-xs">
              <Share2 className="size-3.5" />
              <span>Share</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-auto gap-1 px-2.5 py-1.5 text-xs">
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
            >
              <MoreHorizontal className="size-4" />
            </Button>
            {showOverflow && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => toggleOverflow(false)} />
                <div className="absolute top-full right-0 z-50 mt-1 min-w-[160px] rounded-xl border border-border bg-card py-1.5 shadow-xl">
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
                    onClick={() => toggleOverflow(false)}
                  >
                    <Share2 className="size-3.5" />
                    <span className="text-sm">Share</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-auto w-full justify-start gap-2.5 rounded-none px-3 py-2.5"
                    onClick={() => toggleOverflow(false)}
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
            aria-label={`${inboxOpen ? "Close" : "Open"} inbox`}
            className={cn(
              "h-auto shrink-0 gap-1 px-2.5 py-1.5 text-xs font-medium",
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
        <div className="scrollbar-none flex flex-nowrap items-center gap-1.5 overflow-x-auto px-4 pb-2.5 md:hidden">
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
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* INBOX SIDEBAR */}
        <aside
          className={cn(
            "absolute z-30 h-full shrink-0 overflow-hidden bg-card transition-all duration-300 animate-in fade-in md:relative md:shadow-none",
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
                onClose={() => setInboxOpen(false)}
              />
            </div>
          )}
        </aside>

        {/* CANVAS AREA */}
        <main className="flex-1 relative overflow-hidden">

          {/* Canvas toolbar */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1 rounded-xl border border-border bg-card px-1 py-1 shadow-sm">
            <ToolBtn icon={<ZoomIn size={14} />} onClick={() => handleZoom('in')} title="Zoom in" />
            <span className="px-1.5 font-mono text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
            <ToolBtn icon={<ZoomOut size={14} />} onClick={() => handleZoom("out")} title="Zoom out" />
            <div className="mx-0.5 h-4 w-px bg-border" />
            <ToolBtn icon={<Maximize2 size={14} />} onClick={handleReset} title="Reset view" />
            <ToolBtn
              icon={<Grid3X3 size={14} />}
              onClick={() => setShowDayLabels(s => !s)}
              title="Toggle day labels"
              active={showDayLabels}
            />
          </div>

          {/* Trip stats pill */}
          <div className="absolute top-3 right-3 z-20 flex select-none items-center gap-1.5 rounded-xl border border-border bg-card px-2 py-1.5 shadow-sm md:gap-2.5 md:px-3 md:py-2">
            {!isMobile && (
              <>
                <StatItem icon={<Calendar size={11} />} label={formatRange(trip.dates?.start, trip.dates?.end)} />
                <div className="h-3 w-px bg-border" />
              </>
            )}
            <StatItem icon={<MapPin size={11} />} label={trip.destination} />
            {!isMobile && (
              <>
                {trip.dates && (
                  <>
                    <div className="h-3 w-px bg-border" />
                    <StatItem icon={<Clock size={11} />} label={getDurationNights(trip.dates?.start, trip.dates?.end)} />
                  </>
                )}
                <div className="h-3 w-px bg-border" />
                <span className="text-xs text-muted-foreground">
                  Budget: <span className="font-semibold text-foreground">{deriveTripBudget(trip)}</span>
                </span>
              </>
            )}
            <div className="h-3 w-px bg-border" />
            <span className="text-xs">🌤️ 8°C</span>
          </div>

          {/* Linking Mode Active Banner */}
          {linkingSession.isActive && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-4 py-2 rounded-full border shadow-xl bg-amber-50 border-amber-300 text-amber-900 animate-pulse text-xs font-semibold select-none">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Link Mode: Click another card on the canvas to connect them</span>
              <button
                onClick={linkingSession.cancel}
                className="hover:bg-amber-100 rounded-full p-0.5 text-amber-700 transition-colors cursor-pointer ml-1"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* AI prompt bar */}
          <AiPromptBar onSendQuery={handleSendQuery} isThinking={isAiThinking} />

          {/* THE CANVAS */}
          <div
            ref={canvasRef}
            className="absolute inset-0 canvas-bg overflow-hidden"
            style={{ cursor: isDraggingCanvas ? 'grabbing' : 'grab' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            onTouchCancel={handleMouseUp}
          >
            <div
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0 0',
                position: 'relative',
                width: '1200px',
                height: '900px',
              }}
            >
              {/* Connection SVG lines */}
              <svg
                className="connection-svg"
                style={{ width: '1200px', height: '900px', zIndex: 0 }}
              >
                {activeConnections.map((conn, i) => {
                  const fromCard = cards.find(c => c.id === conn.from);
                  const toCard = cards.find(c => c.id === conn.to);

                  if (!fromCard || !toCard) return null;

                  // Filter out connections for hidden cards if day filters are active
                  const isFromHidden = activeDay !== null && fromCard.day !== activeDay && fromCard.day !== 0;
                  const isToHidden = activeDay !== null && toCard.day !== activeDay && toCard.day !== 0;
                  if (isFromHidden || isToHidden) return null;

                  const fromCenter = getCardCenter(fromCard);
                  const toCenter = getCardCenter(toCard);

                  return (
                    <g key={i}>
                      <line
                        x1={fromCenter.x} y1={fromCenter.y}
                        x2={toCenter.x} y2={toCenter.y}
                        className="ink-line text-stone-300"
                        strokeWidth="1.5"
                        strokeDasharray={conn.label === 'custom-link' ? '4,4' : '0'}
                      />
                      <circle cx={fromCenter.x} cy={fromCenter.y} r="3" fill="#d6cfc3" />
                      <circle cx={toCenter.x} cy={toCenter.y} r="3" fill="#d6cfc3" />
                    </g>
                  );
                })}
              </svg>

              {/* Day cluster labels */}
              {showDayLabels && dayLabels.map(cfg => {
                const group = days.find(d => d.day === cfg.day);
                if (!group) return null;
                const isActive = activeDay === cfg.day;
                const isDimmed = activeDay !== null && !isActive;
                return (
                  <div
                    key={cfg.day}
                    className="absolute select-none transition-opacity duration-200"
                    style={{
                      left: cfg.x,
                      top: cfg.y,
                      opacity: isDimmed ? 0.3 : 1,
                      zIndex: 0,
                    }}
                  >
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all hover:scale-105 active:scale-95"
                      style={{
                        backgroundColor: cfg.bg,
                        color: cfg.color,
                        border: `1.5px solid ${cfg.border}`,
                      }}
                      onClick={() => setActiveDay(d => d === cfg.day ? null : cfg.day)}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                      {group.label}
                    </div>
                  </div>
                );
              })}

              {/* CARDS */}
              {filteredCards.map(card => {
                const isNewlySpawned = card.id.startsWith('c_spawn_') || card.id.startsWith('c_ai_') || card.id.startsWith('c_manual_') || card.id === 'c15' || card.id === 'c16' || card.id === 'c17';
                const isTargetOfLinking = linkingSession.isActive && linkingSession.originId !== card.id;

                return (
                  <div
                    key={card.id}
                    className={`transition-all duration-200 ${isNewlySpawned ? 'card-drop-in' : ''} ${
                      isTargetOfLinking ? 'hover:ring-4 hover:ring-amber-500/40 hover:scale-[1.02] cursor-pointer' : ''
                    }`}
                    style={{
                      opacity: activeDay !== null && card.day !== activeDay && card.day !== 0 ? 0.2 : 1,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (linkingSession.isActive) {
                        linkingSession.resolveTarget(card.id);
                      } else {
                        setSelectedCard(c => c?.id === card.id ? null : card);
                      }
                    }}
                    onTouchStart={(e) => handleCardTouchStart(card.id, e)}
                  >
                    <CanvasCardRenderer
                      card={card}
                      onMouseDown={(e) => handleCardMouseDown(card.id, e)}
                      isDragging={draggingCardId === card.id}
                    />
                  </div>
                );
              })}

              {/* Add card button */}
              <div
                onClick={() => handleOpenCreateModal(900, 680)}
                className="absolute flex items-center gap-1.5 cursor-pointer group hover:scale-105 active:scale-95 transition-all select-none"
                style={{ left: 880, top: 640 }}
              >
                <div className="flex size-9 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 transition-all group-hover:border-muted-foreground/50">
                  <Plus size={16} className="text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
                </div>
                <span className="text-xs text-muted-foreground/40 transition-colors group-hover:text-muted-foreground">
                  Add card
                </span>
              </div>
            </div>
          </div>

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
    <div className="flex items-center gap-1 text-muted-foreground">
      {icon}
      <span className="text-xs">{label}</span>
    </div>
  );
}

interface AiPromptBarProps {
  onSendQuery: (query: string) => void;
  isThinking: boolean;
}

function AiPromptBar({ onSendQuery, isThinking }: AiPromptBarProps) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const suggestions = [
    'Plan Day 5',
    'Suggest a ryokan in Arashiyama',
    'Find a restaurant near Gion',
  ];

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
    <div className="absolute bottom-6 left-1/2 z-20 w-full max-w-lg -translate-x-1/2 px-4 select-none md:bottom-14">
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
                : 'Ask AI: "Plan Day 5" or "Suggest a ryokan in Arashiyama"'
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
