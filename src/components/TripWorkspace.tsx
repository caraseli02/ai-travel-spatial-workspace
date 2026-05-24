import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Compass, ChevronLeft, MapPin, Calendar,
  ZoomIn, ZoomOut, Maximize2, Grid3X3, Share2, Download,
  Sparkles, PanelLeftClose, PanelLeftOpen, Plus,
  Clock, X, MoreHorizontal
} from 'lucide-react';
import { CanvasCardRenderer } from './CanvasCards';
import InboxPanel from './InboxPanel';
import OnboardingToast from './OnboardingToast';
import CardDetailPanel from './CardDetailPanel';
import type { CanvasCard } from '../models/trip';
import {
  cardTypeOptions,
  getCardCenter,
} from '../models/tripWorkspaceModel';
import type { CardType, TripWorkspaceState } from '../models/tripWorkspaceModel';
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
  upcoming: { bg: '#d1fae5', text: '#065f46', dot: '#10b981', label: 'Upcoming' },
  ongoing: { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b', label: 'Ongoing' },
  completed: { bg: '#f3f4f6', text: '#374151', dot: '#6b7280', label: 'Completed' },
  planning: { bg: '#e0f2fe', text: '#0369a1', dot: '#0ea5e9', label: 'Planning' },
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
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: '#faf9f7' }}>
        <div className="text-center">
          <p className="text-stone-500 text-lg mb-4">Trip not found</p>
          <button
            onClick={() => navigate('/trips')}
            className="text-sm font-medium px-4 py-2 rounded-lg transition-all hover:opacity-90"
            style={{ backgroundColor: '#92400e', color: 'white' }}
          >
            Back to trips
          </button>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: '#faf9f7' }}>
        <div className="flex items-center gap-2 text-stone-400">
          <Compass size={16} className="animate-spin" />
          <span className="text-sm">Loading workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <TripWorkspacePresenter
      trip={trip}
      tripId={tripId}
      isMobile={isMobile}
      inboxOpen={inboxOpen}
      setInboxOpen={setInboxOpen}
      navigate={navigate}
    />
  );
}

interface PresenterProps {
  trip: Trip;
  tripId: string;
  isMobile: boolean;
  inboxOpen: boolean;
  setInboxOpen: React.Dispatch<React.SetStateAction<boolean>>;
  navigate: ReturnType<typeof useNavigate>;
}

function TripWorkspacePresenter({
  trip,
  tripId,
  isMobile,
  inboxOpen,
  setInboxOpen,
  navigate,
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
    createModalCoords,
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

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: '#faf9f7' }}>

      {/* TOP NAV */}
      <header className="flex-shrink-0 z-40"
        style={{ backgroundColor: '#fefcf8', borderBottom: '1px solid #e7e3dc' }}>

        {/* ── Single Row (desktop) / Top Row (mobile) ── */}
        <div className="flex items-center gap-2 px-4" style={{ height: '52px' }}>

          {/* Back + brand */}
          <button
            onClick={() => navigate('/trips')}
            aria-label="Back to trips"
            className="flex items-center gap-1.5 text-stone-500 hover:text-stone-800 transition-colors text-sm flex-shrink-0 cursor-pointer"
          >
            <ChevronLeft size={15} />
            <Compass size={15} color="#92400e" />
            <span className="font-semibold text-stone-700 hidden sm:block" style={{ fontSize: '13px' }}>Wayfarer</span>
          </button>

          <div className="w-px h-5 bg-stone-200 flex-shrink-0" />

          {/* Trip identity */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-6 h-6 rounded flex items-center justify-center text-sm">{trip.emoji}</div>
            <h1 className="font-semibold text-stone-800" style={{ fontSize: '14px' }}>{trip.name}</h1>
            {(() => {
              const tripStatus = deriveTripStatus(trip);
              const statusCfg = workspaceStatusConfig[tripStatus];
              return (
                <span className="hidden md:flex items-center gap-1 text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: statusCfg.bg, color: statusCfg.text }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusCfg.dot }} />
                  {statusCfg.label}
                </span>
              );
            })()}
          </div>

          {/* Desktop center: Day filter pills (hidden on mobile — shown in row 2 below) */}
          <div className="hidden md:flex flex-1 items-center justify-center gap-1.5 overflow-x-auto scrollbar-none px-2">
            <button
              onClick={() => setActiveDay(null)}
              className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer"
              style={{
                backgroundColor: activeDay === null ? '#1c1917' : '#f5f3ef',
                color: activeDay === null ? 'white' : '#78716c',
              }}
            >
              All days
            </button>
            {days.map(d => (
              <button
                key={d.day}
                onClick={() => setActiveDay(activeDay === d.day ? null : d.day)}
                className="flex-shrink-0 flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer"
                style={{
                  backgroundColor: activeDay === d.day ? d.color : '#f5f3ef',
                  color: activeDay === d.day ? 'white' : '#78716c',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: activeDay === d.day ? 'rgba(255,255,255,0.7)' : d.color }} />
                Day&nbsp;{d.day}
              </button>
            ))}
            <button
              onClick={openAddDayModal}
              className="flex-shrink-0 w-6 h-6 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition-all flex items-center justify-center cursor-pointer ml-1"
              style={{ border: '1px solid #e7e3dc' }}
              title="Add Custom Day"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Mobile: push actions to the right */}
          <div className="flex-1 md:hidden" />

          {/* Desktop-only secondary actions */}
          <div className="hidden md:flex items-center gap-1 flex-shrink-0">
            <div className="flex items-center -space-x-2 mr-1">
              {Array.from({ length: Math.min(deriveTripTravelers(trip), 3) }).map((_, i) => {
                const avatars = ['🧑', '👩', '🧔'];
                return (
                  <div key={i} className="w-6 h-6 rounded-full flex items-center justify-center text-xs ring-2 ring-white select-none"
                    style={{ backgroundColor: '#e7e3dc', fontSize: '13px' }}>
                    {avatars[i % avatars.length]}
                  </div>
                );
              })}
            </div>
            <span className="text-xs text-stone-400 mr-2 hidden lg:block select-none">
              {deriveTripTravelers(trip)} {deriveTripTravelers(trip) === 1 ? 'traveler' : 'travelers'}
            </span>
            <button className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-all hover:bg-stone-100 cursor-pointer"
              style={{ color: '#78716c' }}>
              <Share2 size={13} />
              <span>Share</span>
            </button>
            <button className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-all hover:bg-stone-100 cursor-pointer"
              style={{ color: '#78716c' }}>
              <Download size={13} />
              <span>Export</span>
            </button>
          </div>

          {/* Mobile overflow ··· */}
          <div className="relative md:hidden">
            <button
              onClick={() => toggleOverflow()}
              aria-label="More workspace actions"
              aria-expanded={showOverflow}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:bg-stone-100 cursor-pointer"
              style={{ color: '#78716c' }}
            >
              <MoreHorizontal size={16} />
            </button>
            {showOverflow && (
              <>
                {/* backdrop */}
                <div className="fixed inset-0 z-40" onClick={() => toggleOverflow(false)} />
                {/* popover */}
                <div className="absolute right-0 top-full mt-1 z-50 rounded-xl shadow-xl py-1.5 min-w-[160px]"
                  style={{ backgroundColor: '#fefcf8', border: '1px solid #e7e3dc' }}>
                  <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: '#e7e3dc' }}>
                    <div className="flex items-center -space-x-1.5">
                      {Array.from({ length: Math.min(deriveTripTravelers(trip), 3) }).map((_, i) => {
                        const avatars = ['🧑', '👩', '🧔'];
                        return (
                          <div key={i} className="w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white select-none"
                            style={{ backgroundColor: '#e7e3dc', fontSize: '11px' }}>{avatars[i % avatars.length]}</div>
                        );
                      })}
                    </div>
                    <span className="text-xs text-stone-500">
                      {deriveTripTravelers(trip)} {deriveTripTravelers(trip) === 1 ? 'traveler' : 'travelers'}
                    </span>
                  </div>
                  <button className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-stone-50 transition-colors cursor-pointer"
                    style={{ color: '#78716c' }} onClick={() => toggleOverflow(false)}>
                    <Share2 size={14} />
                    <span className="text-sm">Share</span>
                  </button>
                  <button className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-stone-50 transition-colors cursor-pointer"
                    style={{ color: '#78716c' }} onClick={() => toggleOverflow(false)}>
                    <Download size={14} />
                    <span className="text-sm">Export</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Inbox toggle — always visible */}
          <button
            onClick={() => setInboxOpen(o => !o)}
            aria-label={`${inboxOpen ? 'Close' : 'Open'} inbox`}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-all font-medium cursor-pointer flex-shrink-0"
            style={{
              backgroundColor: inboxOpen ? '#fef3c7' : '#f5f3ef',
              color: inboxOpen ? '#92400e' : '#78716c',
            }}
          >
            {inboxOpen ? <PanelLeftClose size={13} /> : <PanelLeftOpen size={13} />}
            <span className="hidden sm:block">Inbox</span>
            {items.filter(i => !i.processed).length > 0 && (
              <span className="w-4 h-4 rounded-full text-xs flex items-center justify-center font-semibold"
                style={{ backgroundColor: '#ef4444', color: 'white', fontSize: '10px' }}>
                {items.filter(i => !i.processed).length}
              </span>
            )}
          </button>
        </div>

        {/* ── Row 2: Day filter strip — mobile only ── */}
        <div className="md:hidden flex items-center gap-1.5 px-4 pb-2.5 overflow-x-auto scrollbar-none flex-nowrap">
          <button
            onClick={() => setActiveDay(null)}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer"
            style={{
              backgroundColor: activeDay === null ? '#1c1917' : '#f5f3ef',
              color: activeDay === null ? 'white' : '#78716c',
            }}
          >
            All
          </button>
          {days.map(d => (
            <button
              key={d.day}
              onClick={() => setActiveDay(activeDay === d.day ? null : d.day)}
              className="flex-shrink-0 flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer"
              style={{
                backgroundColor: activeDay === d.day ? d.color : '#f5f3ef',
                color: activeDay === d.day ? 'white' : '#78716c',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: activeDay === d.day ? 'rgba(255,255,255,0.7)' : d.color }} />
              Day&nbsp;{d.day}
            </button>
          ))}
          <button
            onClick={openAddDayModal}
            className="flex-shrink-0 w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 transition-all flex items-center justify-center cursor-pointer"
            style={{ border: '1px solid #e7e3dc' }}
            title="Add Day"
          >
            <Plus size={12} />
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* INBOX SIDEBAR */}
        <aside
          className="flex-shrink-0 overflow-hidden transition-all duration-300 z-30 animate-in fade-in absolute md:relative h-full bg-[#fefcf8] shadow-2xl md:shadow-none"
          style={{
            width: inboxOpen ? (isMobile ? '100%' : '280px') : '0px',
            borderRight: inboxOpen ? '1px solid #e7e3dc' : 'none',
          }}
        >
          {inboxOpen && (
            <div className="h-full w-full md:w-[280px]">
              <InboxPanel
                items={items}
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
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1 rounded-xl px-1 py-1"
            style={{ backgroundColor: '#fefcf8', border: '1px solid #e7e3dc', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <ToolBtn icon={<ZoomIn size={14} />} onClick={() => handleZoom('in')} title="Zoom in" />
            <span className="text-xs text-stone-400 px-1.5 font-mono">{Math.round(zoom * 100)}%</span>
            <ToolBtn icon={<ZoomOut size={14} />} onClick={() => handleZoom('out')} title="Zoom out" />
            <div className="w-px h-4 bg-stone-200 mx-0.5" />
            <ToolBtn icon={<Maximize2 size={14} />} onClick={handleReset} title="Reset view" />
            <ToolBtn
              icon={<Grid3X3 size={14} />}
              onClick={() => setShowDayLabels(s => !s)}
              title="Toggle day labels"
              active={showDayLabels}
            />
          </div>

          {/* Trip stats pill */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 md:gap-2.5 rounded-xl px-2 py-1.5 md:px-3 md:py-2 select-none"
            style={{ backgroundColor: '#fefcf8', border: '1px solid #e7e3dc', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            {!isMobile && (
              <>
                <StatItem icon={<Calendar size={11} />} label={formatRange(trip.dates?.start, trip.dates?.end)} />
                <div className="w-px h-3 bg-stone-200" />
              </>
            )}
            <StatItem icon={<MapPin size={11} />} label={trip.destination} />
            {!isMobile && (
              <>
                {trip.dates && (
                  <>
                    <div className="w-px h-3 bg-stone-200" />
                    <StatItem icon={<Clock size={11} />} label={getDurationNights(trip.dates?.start, trip.dates?.end)} />
                  </>
                )}
                <div className="w-px h-3 bg-stone-200" />
                <span className="text-xs text-stone-400">
                  Budget: <span className="font-semibold text-stone-600">{deriveTripBudget(trip)}</span>
                </span>
              </>
            )}
            <div className="w-px h-3 bg-stone-200" />
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
                <div className="w-9 h-9 rounded-xl border-2 border-dashed flex items-center justify-center transition-all group-hover:border-stone-400"
                  style={{ borderColor: '#d6cfc3' }}>
                  <Plus size={16} className="text-stone-300 group-hover:text-stone-500 transition-colors" />
                </div>
                <span className="text-xs text-stone-300 group-hover:text-stone-400 transition-colors">Add card</span>
              </div>
            </div>
          </div>

          {/* Onboarding toast */}
          <OnboardingToast />

          {/* Card detail panel */}
          <CardDetailPanel
            card={selectedCard}
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
  icon, onClick, title, active
}: {
  icon: React.ReactNode;
  onClick: () => void;
  title: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer"
      style={{
        backgroundColor: active ? '#fef3c7' : 'transparent',
        color: active ? '#92400e' : '#78716c',
      }}
      onMouseEnter={e => {
        if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = '#f5f3ef';
      }}
      onMouseLeave={e => {
        if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
      }}
    >
      {icon}
    </button>
  );
}

function StatItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1 text-stone-400">
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
    <div className="absolute bottom-6 md:bottom-14 left-1/2 -translate-x-1/2 z-20 w-full max-w-lg px-4 select-none">
      <form onSubmit={handleSubmit} className={`rounded-xl transition-all duration-200 ${focused ? 'shadow-lg' : 'shadow-sm'}`}
        style={{ backgroundColor: '#fefcf8', border: `1.5px solid ${focused ? '#fde68a' : '#e7e3dc'}` }}>
        <div className="flex items-center gap-2 px-3 py-2.5">
          {isThinking ? (
            <Sparkles size={14} className="text-amber-500 animate-spin" />
          ) : (
            <Sparkles size={14} color="#92400e" />
          )}
          <input
            className="flex-1 text-xs outline-none bg-transparent placeholder-stone-300 text-stone-700 disabled:opacity-50"
            placeholder={isThinking ? 'AI is thinking...' : 'Ask AI: "Plan Day 5" or "Suggest a ryokan in Arashiyama"'}
            value={value}
            onChange={e => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            disabled={isThinking}
            style={{ fontFamily: 'inherit' }}
          />
          {isThinking ? (
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            value && (
              <button type="submit" className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                style={{ backgroundColor: '#92400e' }}>
                <Plus size={12} color="white" style={{ transform: 'rotate(45deg)' }} />
              </button>
            )
          )}
        </div>

        {focused && !value && !isThinking && (
          <div className="px-3 pb-2.5 flex flex-wrap gap-1.5 animate-in fade-in slide-in-from-bottom-1">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSuggestionClick(s)}
                className="text-xs px-2.5 py-1 rounded-full transition-all hover:opacity-80 active:scale-95 cursor-pointer"
                style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}
              >
                {s}
              </button>
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
  onSubmit: (cardData: Omit<CanvasCard, 'id' | 'x' | 'y' | 'rotation'>) => void;
  days: { day: number; label: string }[];
}) {
  const [type, setType] = useState<CardType>('sticky');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [day, setDay] = useState(0);
  const [tag, setTag] = useState('');
  const [tagColor, setTagColor] = useState('slate');
  const [detailsString, setDetailsString] = useState('');
  const [price, setPrice] = useState('');
  const [rating, setRating] = useState('4.5');

  useEffect(() => {
    if (isOpen) {
      setType('sticky');
      setTitle('');
      setSubtitle('');
      setDay(0);
      setTag('');
      setTagColor('slate');
      setDetailsString('');
      setPrice('');
      setRating('4.5');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const details = detailsString
      ? detailsString.split('\n').map(s => s.trim()).filter(Boolean)
      : [];

    let image = undefined;
    let color = undefined;

    if (type === 'polaroid') {
      image = '/images/gion.jpg';
    } else if (type === 'hotel') {
      image = '/images/ryokan.jpg';
    } else if (type === 'sticky') {
      color = '#fef3c7';
    }

    onSubmit({
      type,
      title,
      subtitle: subtitle || undefined,
      day: Number(day),
      tag: tag || undefined,
      tagColor: tagColor || undefined,
      details: details.length > 0 ? details : undefined,
      price: price || undefined,
      rating: (type === 'hotel' || type === 'polaroid') ? Number(rating) : undefined,
      image,
      color,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm bg-stone-900/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-stone-50 border border-stone-200 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 bg-white">
          <h3 className="font-bold text-stone-800 text-sm">Create Spatial Card</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-stone-300 hover:text-stone-600 transition-colors cursor-pointer p-1 rounded hover:bg-stone-50"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1 scrollbar-thin">
          {/* Card Type Selector */}
          <div>
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Card Type</label>
            <select
              value={type}
              onChange={e => {
                if (isCardType(e.target.value)) {
                  setType(e.target.value);
                }
              }}
              className="w-full text-xs border rounded-xl px-3 py-2 bg-white border-stone-200 outline-none focus:border-amber-500 text-stone-700 h-[36px]"
            >
              {cardTypeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-xs border rounded-xl px-3 py-2 bg-white border-stone-200 outline-none focus:border-amber-500 text-stone-700"
              placeholder="e.g. Kyoto Tower visit"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Subtitle / Description</label>
            <input
              type="text"
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
              className="w-full text-xs border rounded-xl px-3 py-2 bg-white border-stone-200 outline-none focus:border-amber-500 text-stone-700"
              placeholder="e.g. Evening panorama of the city lights"
            />
          </div>

          {/* Target Day */}
          <div>
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Associate Day</label>
            <select
              value={day}
              onChange={e => setDay(Number(e.target.value))}
              className="w-full text-xs border rounded-xl px-3 py-2 bg-white border-stone-200 outline-none focus:border-amber-500 text-stone-700 h-[36px]"
            >
              <option value={0}>Unassigned (Logistics)</option>
              {days.map(d => (
                <option key={d.day} value={d.day}>Day {d.day}</option>
              ))}
            </select>
          </div>

          {/* Details */}
          <div>
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Details (one bullet per line)</label>
            <textarea
              value={detailsString}
              onChange={e => setDetailsString(e.target.value)}
              className="w-full text-xs border rounded-xl px-3 py-2 bg-white border-stone-200 outline-none focus:border-amber-500 text-stone-700 resize-none h-16"
              placeholder="Detail line 1&#10;Detail line 2"
            />
          </div>

          {/* Type specific inputs */}
          <div className="grid grid-cols-2 gap-3">
            {(type === 'hotel' || type === 'flight') && (
              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Price</label>
                <input
                  type="text"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="w-full text-xs border rounded-xl px-3 py-2 bg-white border-stone-200 outline-none focus:border-amber-500 text-stone-700"
                  placeholder="e.g. $140 total"
                />
              </div>
            )}
            {(type === 'hotel' || type === 'polaroid') && (
              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Rating</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={rating}
                  onChange={e => setRating(e.target.value)}
                  className="w-full text-xs border rounded-xl px-3 py-2 bg-white border-stone-200 outline-none focus:border-amber-500 text-stone-700"
                />
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-stone-200 bg-white flex items-center justify-end gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-stone-200 text-xs font-semibold rounded-xl text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold rounded-xl text-white hover:opacity-90 transition-opacity cursor-pointer animate-pulse"
            style={{ backgroundColor: '#92400e' }}
          >
            Create Card
          </button>
        </div>
      </form>
    </div>
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
  const [dayNum, setDayNum] = useState(nextDayNum);
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDayNum(nextDayNum);
      setLabel('');
    }
  }, [isOpen, nextDayNum]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    onSubmit(dayNum, label);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm bg-stone-900/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-stone-50 border border-stone-200 shadow-2xl rounded-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 bg-white">
          <h3 className="font-bold text-stone-800 text-sm">Add Custom Day</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-stone-300 hover:text-stone-600 transition-colors cursor-pointer p-1 rounded hover:bg-stone-50"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1 text-xs">Day Index</label>
            <input
              type="number"
              min="1"
              required
              value={dayNum}
              onChange={e => setDayNum(Number(e.target.value))}
              className="w-full text-xs border rounded-xl px-3 py-2 bg-white border-stone-200 outline-none focus:border-amber-500 text-stone-700"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1 text-xs">Day Label / Activity</label>
            <input
              type="text"
              required
              value={label}
              onChange={e => setLabel(e.target.value)}
              className="w-full text-xs border rounded-xl px-3 py-2 bg-white border-stone-200 outline-none focus:border-amber-500 text-stone-700"
              placeholder="e.g. Nanzenji Temple & Tofu dinner"
            />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-stone-200 bg-white flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-stone-200 text-xs font-semibold rounded-xl text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold rounded-xl text-white hover:opacity-90 transition-opacity cursor-pointer"
            style={{ backgroundColor: '#92400e' }}
          >
            Add Day
          </button>
        </div>
      </form>
    </div>
  );
}
