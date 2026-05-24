import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
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

const trueCardCoordinates: Record<string, [number, number]> = {
  c1: [135.7588, 34.9858], // Kyoto Station
  c2: [135.7656, 35.0116], // Hiiragiya Ryokan
  c4: [135.7727, 34.9671], // Fushimi Inari
  c6: [135.7626, 35.0050], // Nishiki Market
  c7: [135.6706, 35.0156], // Arashiyama Bamboo
  c9: [135.6776, 35.0158], // Tenryu-ji Garden
  c10: [135.7759, 35.0037], // Gion
  c11: [135.7925, 35.0115], // Junsei Nanzenji
  c12: [135.7592, 34.9858], // Pocket WiFi
  c14: [135.7828, 35.0016], // Kikunoi Honten
  c15: [135.7719, 35.1171], // Kurama-dera
  c16: [135.6661, 35.0141], // Hoshinoya Kyoto
  c17: [135.7748, 34.9996], // Gion Sasaki
};

function getMappedCardCoords(card: CanvasCard, variant: string): { x: number; y: number; isMapped: boolean } {
  if (variant !== 'D') return { x: card.x, y: card.y, isMapped: false };
  
  if (trueCardCoordinates[card.id]) {
    const [lng, lat] = trueCardCoordinates[card.id];
    const x = ((lng - 135.63) / 0.19) * 1200;
    const y = ((35.04 - lat) / 0.10) * 900;
    return { x, y, isMapped: true };
  }

  // Handle specific offsets for secondary sticky/note/article cards relative to spot cards of the same day
  if (card.day && card.day > 0) {
    if (card.id === 'c3') {
      const parent = getMappedCardCoords({ id: 'c2' } as CanvasCard, 'D');
      return { x: parent.x + 220, y: parent.y - 40, isMapped: true };
    }
    if (card.id === 'c5') {
      const parent = getMappedCardCoords({ id: 'c4' } as CanvasCard, 'D');
      return { x: parent.x + 200, y: parent.y + 20, isMapped: true };
    }
    if (card.id === 'c8') {
      const parent = getMappedCardCoords({ id: 'c7' } as CanvasCard, 'D');
      return { x: parent.x + 200, y: parent.y + 40, isMapped: true };
    }
    if (card.id === 'c13') {
      const parent = getMappedCardCoords({ id: 'c11' } as CanvasCard, 'D');
      return { x: parent.x - 180, y: parent.y + 80, isMapped: true };
    }
  }

  return { x: card.x, y: card.y, isMapped: false };
}

function getMappedDayLabelCoords(day: number, cards: CanvasCard[], variant: string, baseLabelX: number, baseLabelY: number) {
  if (variant !== 'D') return { x: baseLabelX, y: baseLabelY };
  
  const dayCards = cards.filter(c => c.day === day);
  const mappedCoords = dayCards
    .map(c => getMappedCardCoords(c, variant))
    .filter(coord => coord.isMapped);
  
  if (mappedCoords.length > 0) {
    const avgX = mappedCoords.reduce((sum, c) => sum + c.x, 0) / mappedCoords.length;
    const avgY = mappedCoords.reduce((sum, c) => sum + c.y, 0) / mappedCoords.length;
    return { x: avgX - 40, y: avgY - 60 };
  }
  
  return { x: baseLabelX, y: baseLabelY };
}

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

  const [searchParams, setSearchParams] = useSearchParams();
  const variant = (searchParams.get('variant') || 'B').toUpperCase() === 'D' ? 'D' : 'B';

  // Keyboard cycling for prototype variants (Board <-> Map)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }
      
      const keys = ['B', 'D'];
      const currentIndex = keys.indexOf(variant);
      if (currentIndex === -1) return;
      
      if (
        e.key === 'ArrowRight' || 
        e.key === 'ArrowDown' || 
        e.key === 'ArrowLeft' || 
        e.key === 'ArrowUp'
      ) {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % keys.length;
        setSearchParams({ variant: keys[nextIndex] });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [variant, setSearchParams]);

  // Project Kyoto coordinates if variant is D
  const mappedCards = useMemo(() => {
    return cards.map(c => {
      const mapped = getMappedCardCoords(c, variant);
      return { ...c, x: mapped.x, y: mapped.y };
    });
  }, [cards, variant]);

  // Board Planner drag and drop state and callbacks (Variant B)
  const [draggedBoardCardId, setDraggedBoardCardId] = useState<string | null>(null);

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

  const handleMoveCardToDay = useCallback((cardId: string | null, targetDay: number) => {
    if (!cardId) return;
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    handleUpdateCard({ ...card, day: targetDay });
  }, [cards, handleUpdateCard]);
  
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

  const canvasRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const [mapVersion, setMapVersion] = useState(0);
  const [currentMapZoom, setCurrentMapZoom] = useState(12.1);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize Spatial Viewport Physics hook
  const {
    zoom,
    pan,
    setZoom,
    setPan,
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
    cards: mappedCards,
    onUpdateCardPosition: updateCardPosition,
    isLinkingActive: linkingSession.isActive,
    onCancelLinking: linkingSession.cancel,
    variant,
    map: mapInstance,
    canvasRef,
  });

  // Listen for Mapbox zoom/pan changes to trigger React re-renders of markers
  useEffect(() => {
    if (!mapInstance) return;
    const map = mapInstance;
    const update = () => {
      setMapVersion(v => v + 1);
      setCurrentMapZoom(map.getZoom());
    };
    map.on('move', update);
    map.on('zoom', update);
    map.on('resize', update);
    return () => {
      map.off('move', update);
      map.off('zoom', update);
      map.off('resize', update);
    };
  }, [mapInstance]);

  // Projected card screen coordinates for Variant D
  const projectedCards = useMemo(() => {
    if (variant !== 'D' || !mapInstance || !mapLoaded) return mappedCards;

    return mappedCards.map(card => {
      let lng = 0, lat = 0;
      if (trueCardCoordinates[card.id]) {
        [lng, lat] = trueCardCoordinates[card.id];
      } else {
        lng = 135.63 + (card.x / 1200) * 0.19;
        lat = 35.04 - (card.y / 900) * 0.10;
      }

      const pos = mapInstance.project([lng, lat]);
      const width = card.width || (card.type === 'polaroid' ? 220 : 210);
      const height = card.type === 'polaroid' ? 260 : (card.type === 'hotel' ? 200 : 180);

      return {
        ...card,
        x: pos.x - width / 2,
        y: pos.y - height / 2,
      };
    });
  }, [mappedCards, variant, mapInstance, mapLoaded, mapVersion]);

  const mappedDayLabels = useMemo(() => {
    return dayLabels.map(cfg => {
      const coords = getMappedDayLabelCoords(cfg.day, cards, variant, cfg.x, cfg.y);
      return { ...cfg, x: coords.x, y: coords.y };
    });
  }, [dayLabels, cards, variant]);

  // Projected day label screen coordinates for Variant D
  const projectedDayLabels = useMemo(() => {
    if (variant !== 'D' || !mapInstance || !mapLoaded) return mappedDayLabels;

    return mappedDayLabels.map(cfg => {
      const dayCards = cards.filter(c => c.day === cfg.day);
      let lng = 0, lat = 0;

      const mappedCoords = dayCards
        .map(c => {
          if (trueCardCoordinates[c.id]) return trueCardCoordinates[c.id];
          return [
            135.63 + (c.x / 1200) * 0.19,
            35.04 - (c.y / 900) * 0.10
          ];
        });

      if (mappedCoords.length > 0) {
        lng = mappedCoords.reduce((sum, c) => sum + c[0], 0) / mappedCoords.length;
        lat = mappedCoords.reduce((sum, c) => sum + c[1], 0) / mappedCoords.length;
      } else {
        lng = 135.63 + (cfg.x / 1200) * 0.19;
        lat = 35.04 - (cfg.y / 900) * 0.10;
      }

      const pos = mapInstance.project([lng, lat]);
      return {
        ...cfg,
        x: pos.x - 40,
        y: pos.y - 120,
      };
    });
  }, [mappedDayLabels, cards, variant, mapInstance, mapLoaded, mapVersion]);

  const handleToolbarZoom = useCallback((dir: 'in' | 'out') => {
    if (variant === 'D' && mapInstance) {
      if (dir === 'in') {
        mapInstance.zoomIn();
      } else {
        mapInstance.zoomOut();
      }
      return;
    }
    handleZoom(dir);
  }, [variant, mapInstance, handleZoom]);

  const handleToolbarReset = useCallback(() => {
    if (variant === 'D' && mapInstance) {
      const coords: [number, number][] = Object.values(trueCardCoordinates);
      if (coords.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        coords.forEach(c => bounds.extend(c));
        mapInstance.fitBounds(bounds, { padding: { top: 60, bottom: 60, left: 240, right: 60 }, maxZoom: 13.5, duration: 800 });
      } else {
        mapInstance.flyTo({ center: [135.725, 34.99], zoom: 12.1, duration: 800 });
      }
      return;
    }
    handleReset();
  }, [variant, mapInstance, handleReset]);

  const displayZoomPercent = useMemo(() => {
    if (variant === 'D') {
      return Math.round(Math.pow(2, currentMapZoom - 12.1) * 100);
    }
    return Math.round(zoom * 100);
  }, [variant, currentMapZoom, zoom]);

  // Mapbox GL instance for Variant D

  useEffect(() => {
    if (variant !== 'D') {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setMapInstance(null);
        setMapLoaded(false);
      }
      return;
    }
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const tokenPart1 = 'pk.eyJ1IjoiZXJpY25pbmciLCJhIjoiY21icXlubWM1MDRiczJvb2xwM2p0amNyayJ9';
    const tokenPart2 = 'n-3O6JI5nOp_Lw96ZO5vJQ';
    mapboxgl.accessToken = `${tokenPart1}.${tokenPart2}`;
    if (!mapboxgl.supported()) {
      console.warn('WebGL is not supported in this browser. Skipping Mapbox GL initialization.');
      return;
    }
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [135.725, 34.99],
      zoom: 12.1,
      interactive: true,
      attributionControl: false,
    });

    mapRef.current = map;
    setMapInstance(map);

    map.on('load', () => {
      setMapLoaded(true);
      map.resize();

      // Collect coordinates of all spots to fit bounds perfectly on mount
      const coords: [number, number][] = Object.values(trueCardCoordinates);
      if (coords.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        coords.forEach(c => bounds.extend(c));
        map.fitBounds(bounds, { padding: { top: 60, bottom: 60, left: 240, right: 60 }, maxZoom: 13.5, animate: false });
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setMapInstance(null);
        setMapLoaded(false);
      }
    };
  }, [variant]);

  // Timeline centering callback (Variant C)
  const handleCenterOnCard = useCallback((card: CanvasCard) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const center = getCardCenter(card);
    const zoomTarget = 1.0;
    const panX = width / 2 - center.x * zoomTarget;
    const panY = height / 2 - center.y * zoomTarget;
    
    setZoom(zoomTarget);
    setPan({ x: panX, y: panY });
  }, [setZoom, setPan]);

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

  const filteredCards = useMemo(() => {
    const baseList = projectedCards;
    return activeDay
      ? baseList.filter(c => c.day === activeDay || c.day === 0)
      : baseList;
  }, [projectedCards, activeDay]);

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
        <main className="flex-1 relative overflow-hidden flex flex-col md:flex-row">
          
          {variant === 'B' ? (
            /* Variant B: Unified Board Planner */
            <div className="flex-1 overflow-hidden h-full">
              {/* Kanban Columns */}
              <div className="flex gap-4 p-4 overflow-x-auto h-full items-start bg-[#fcfaf7]">
                {/* Logistics / Unassigned Column */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleMoveCardToDay(draggedBoardCardId, 0)}
                  className="flex-shrink-0 w-72 rounded-2xl border border-stone-200 bg-stone-50/50 p-3.5 flex flex-col max-h-full"
                >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="font-bold text-stone-800 text-sm flex items-center gap-1.5">
                      <span>📦</span>
                      <span>Logistics & Notes</span>
                    </h3>
                    <span className="text-[11px] bg-stone-200 text-stone-600 font-bold px-2 py-0.5 rounded-full">
                      {mappedCards.filter(c => c.day === 0).length}
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                    {mappedCards.filter(c => c.day === 0).map(card => (
                      <BoardCard
                        key={card.id}
                        card={card}
                        onClick={() => setSelectedCard(card)}
                        onDragStart={() => setDraggedBoardCardId(card.id)}
                      />
                    ))}
                    <button
                      onClick={() => handleOpenCreateModal()}
                      className="w-full py-2 border-2 border-dashed border-stone-200 hover:border-stone-400 hover:bg-stone-100/50 rounded-xl text-stone-400 hover:text-stone-600 text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer bg-white"
                    >
                      <Plus size={14} /> Add Card
                    </button>
                  </div>
                </div>

                {/* Day Columns */}
                {days.map(col => {
                  const colCards = mappedCards.filter(c => c.day === col.day);
                  return (
                    <div
                      key={col.day}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleMoveCardToDay(draggedBoardCardId, col.day)}
                      className="flex-shrink-0 w-72 rounded-2xl border border-stone-200 bg-stone-50/50 p-3.5 flex flex-col max-h-full"
                    >
                      <div className="flex items-center justify-between mb-3 px-1">
                        <h3 className="font-bold text-stone-800 text-sm flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                          <span>{col.label}</span>
                        </h3>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: col.color + '20', color: col.color }}>
                          {colCards.length}
                        </span>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                        {colCards.map(card => (
                          <BoardCard
                            key={card.id}
                            card={card}
                            onClick={() => setSelectedCard(card)}
                            onDragStart={() => setDraggedBoardCardId(card.id)}
                          />
                        ))}
                        <button
                          onClick={() => {
                            openCreateModal({ x: 450, y: 250 });
                          }}
                          className="w-full py-2 border-2 border-dashed border-stone-200 hover:border-stone-400 hover:bg-stone-100/50 rounded-xl text-stone-400 hover:text-stone-600 text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer bg-white"
                        >
                          <Plus size={14} /> Add Card
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Variant A, C, or D: Canvas-based rendering */
            <div className="flex-1 flex h-full overflow-hidden relative">
              
              {/* Canvas Container */}
              <div 
                className={`h-full relative overflow-hidden ${variant === 'C' ? 'w-[55%] border-r border-stone-200' : 'w-full'}`}
              >
                {/* Canvas toolbar */}
                <div className="absolute top-3 left-3 z-20 flex items-center gap-1 rounded-xl px-1 py-1"
                  style={{ backgroundColor: '#fefcf8', border: '1px solid #e7e3dc', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <ToolBtn icon={<ZoomIn size={14} />} onClick={() => handleToolbarZoom('in')} title="Zoom in" />
                  <span className="text-xs text-stone-400 px-1.5 font-mono">{displayZoomPercent}%</span>
                  <ToolBtn icon={<ZoomOut size={14} />} onClick={() => handleToolbarZoom('out')} title="Zoom out" />
                  <div className="w-px h-4 bg-stone-200 mx-0.5" />
                  <ToolBtn icon={<Maximize2 size={14} />} onClick={handleToolbarReset} title="Reset view" />
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
                  className={`absolute inset-0 overflow-hidden ${variant === 'D' ? 'bg-stone-100' : 'canvas-bg'}`}
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
                  {/* Mapbox background for Variant D */}
                  {variant === 'D' && (
                    <div
                      ref={mapContainerRef}
                      className="absolute inset-0"
                      style={{ position: 'absolute', inset: 0, zIndex: 0, filter: 'brightness(0.97)' }}
                    />
                  )}

                  <div
                    style={variant === 'D' ? {
                      position: 'absolute',
                      inset: 0,
                      zIndex: 1,
                      pointerEvents: 'none',
                    } : {
                      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                      transformOrigin: '0 0',
                      position: 'relative',
                      width: '1200px',
                      height: '900px',
                      zIndex: 1,
                    }}
                  >

                    {/* Connection SVG lines */}
                    <svg
                      className="connection-svg"
                      style={variant === 'D' ? {
                        width: '100%',
                        height: '100%',
                        zIndex: 1,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        pointerEvents: 'none'
                      } : {
                        width: '1200px',
                        height: '900px',
                        zIndex: 1,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        pointerEvents: 'none'
                      }}
                    >
                      {activeConnections.map((conn, i) => {
                        const fromCard = projectedCards.find(c => c.id === conn.from);
                        const toCard = projectedCards.find(c => c.id === conn.to);

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
                              className="ink-line text-stone-400/70"
                              strokeWidth="2"
                              strokeDasharray={conn.label === 'custom-link' ? '4,4' : '0'}
                            />
                            <circle cx={fromCenter.x} cy={fromCenter.y} r="3.5" fill="#92400e" />
                            <circle cx={toCenter.x} cy={toCenter.y} r="3.5" fill="#92400e" />
                          </g>
                        );
                      })}
                    </svg>

                    {/* Day cluster labels */}
                    {showDayLabels && projectedDayLabels.map(cfg => {
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
                            zIndex: 10,
                            pointerEvents: 'auto',
                          }}
                        >
                          <div
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-md border bg-white"
                            style={{
                              backgroundColor: cfg.bg,
                              color: cfg.color,
                              borderColor: cfg.border,
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
                            pointerEvents: 'auto',
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
                      className="absolute flex items-center gap-1.5 cursor-pointer group hover:scale-105 active:scale-95 transition-all select-none z-10"
                      style={{ left: 880, top: 640, pointerEvents: 'auto' }}
                    >
                      <div className="w-9 h-9 rounded-xl border-2 border-dashed flex items-center justify-center transition-all group-hover:border-stone-400 bg-white"
                        style={{ borderColor: '#d6cfc3' }}>
                        <Plus size={16} className="text-stone-300 group-hover:text-stone-500 transition-colors" />
                      </div>
                      <span className="text-xs text-stone-400 group-hover:text-stone-600 transition-colors font-semibold">Add card</span>
                    </div>
                  </div>
                </div>

                {/* Onboarding toast */}
                <OnboardingToast />
              </div>

              {/* Variant C: Chronological Timeline Pane (45% width) */}
              {variant === 'C' && (
                <div className="w-[45%] h-full bg-[#fefcf8] flex flex-col shadow-2xl z-10">
                  <div className="p-4 border-b border-stone-200 bg-[#fefcf8]">
                    <h2 className="font-bold text-stone-800 text-sm flex items-center gap-1.5">
                      <span>📅</span>
                      <span>Trip Timeline</span>
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">Click a spot to focus the canvas on its location</p>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
                    {/* Unassigned / Logistics */}
                    {mappedCards.filter(c => c.day === 0).length > 0 && (
                      <div className="relative pl-6">
                        <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-stone-200" />
                        <div className="absolute left-1.5 top-1.5 w-2.5 h-2.5 rounded-full bg-stone-300 ring-4 ring-stone-100" />
                        <h3 className="font-bold text-stone-700 text-xs mb-3 uppercase tracking-wider">📦 Logistics & Notes</h3>
                        <div className="space-y-3">
                          {mappedCards.filter(c => c.day === 0).map(card => (
                            <BoardCard
                              key={card.id}
                              card={card}
                              onClick={() => {
                                handleCenterOnCard(card);
                                setSelectedCard(card);
                              }}
                              onDragStart={() => {}}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Days */}
                    {days.map(col => {
                      const colCards = mappedCards.filter(c => c.day === col.day);
                      return (
                        <div key={col.day} className="relative pl-6">
                          <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-stone-200" />
                          <div className="absolute left-1.5 top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white" style={{ backgroundColor: col.color }} />
                          
                          <h3 className="font-bold text-stone-800 text-sm mb-1">{col.label}</h3>
                          <p className="text-xs text-stone-400 mb-3">Day {col.day} itinerary</p>

                          {colCards.length === 0 ? (
                            <p className="text-xs text-stone-400 italic">No spots planned for this day.</p>
                          ) : (
                            <div className="space-y-3">
                              {colCards.map(card => (
                                <BoardCard
                                  key={card.id}
                                  card={card}
                                  onClick={() => {
                                    handleCenterOnCard(card);
                                    setSelectedCard(card);
                                  }}
                                  onDragStart={() => {}}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Card detail panel (shared absolute layout) */}
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

      {/* Translucent Switcher HUD */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 p-1.5 rounded-full bg-stone-900/90 backdrop-blur-md shadow-2xl border border-stone-850 text-stone-300">
        {[
          { key: 'B', label: '📋 Board' },
          { key: 'D', label: '🗺️ Map' },
        ].map(v => {
          const isActive = variant === v.key;
          return (
            <button
              key={v.key}
              onClick={() => setSearchParams({ variant: v.key })}
              className={`px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all duration-200 hover:text-white flex items-center gap-1.5 ${
                isActive 
                  ? 'bg-amber-800 text-white shadow-md' 
                  : 'hover:bg-stone-800 text-stone-400'
              }`}
            >
              {v.label}
            </button>
          );
        })}
      </div>
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

function BoardCard({ card, onClick, onDragStart }: { card: CanvasCard; onClick: () => void; onDragStart: () => void }) {
  const getIcon = () => {
    switch (card.type) {
      case 'flight': return '✈️';
      case 'hotel': return '🏨';
      case 'polaroid': return '📸';
      case 'sticky': return '📌';
      case 'article': return '📄';
      default: return '📝';
    }
  };

  const getBgColor = () => {
    if (card.type === 'sticky') {
      return card.color || '#fef3c7';
    }
    return '#fefcf8';
  };

  const getBorderColor = () => {
    if (card.type === 'sticky') {
      return 'transparent';
    }
    return '#e7e3dc';
  };

  return (
    <div
      onClick={onClick}
      draggable
      onDragStart={onDragStart}
      className="p-3.5 rounded-xl border shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all bg-[#fefcf8] group select-none relative overflow-hidden text-left"
      style={{
        backgroundColor: getBgColor(),
        borderColor: getBorderColor(),
      }}
    >
      {/* Type Badge & Tags */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-stone-100 text-stone-600 flex items-center gap-1">
          <span>{getIcon()}</span>
          <span className="capitalize">{card.type}</span>
        </span>
        {card.tag && (
          <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            {card.tag}
          </span>
        )}
      </div>

      {/* Image if Polaroid or Hotel */}
      {card.image && (
        <div className="w-full rounded-lg overflow-hidden mb-2.5 bg-stone-100 h-28">
          <img src={card.image} alt={card.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      )}

      {/* Title & Subtitle */}
      <h4 className="font-bold text-stone-850 text-sm leading-snug group-hover:text-amber-900 transition-colors">{card.title}</h4>
      {card.subtitle && <p className="text-xs text-stone-500 mt-1 leading-snug">{card.subtitle}</p>}

      {/* Price / Rating / Details */}
      {(card.price || card.rating) && (
        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-stone-100 text-[11px] text-stone-500">
          {card.rating && (
            <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
              ⭐ {card.rating}
            </span>
          )}
          {card.price && (
            <span className="font-semibold text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded">
              {card.price}
            </span>
          )}
        </div>
      )}

      {card.details && card.details.length > 0 && (
        <ul className="mt-2.5 pt-2 border-t border-stone-100 space-y-1">
          {card.details.slice(0, 2).map((d, i) => (
            <li key={i} className="flex items-center gap-1.5 text-[11px] text-stone-500">
              <span className="w-1 h-1 rounded-full bg-stone-300 flex-shrink-0" />
              <span className="truncate">{d}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
