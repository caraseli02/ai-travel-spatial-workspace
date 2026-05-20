import { useState, useRef, useCallback, useEffect } from 'react';
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
import { canvasCards, inboxItems, dayGroups, connections } from '../data/tripData';
import type { CanvasCard, InboxItem } from '../data/tripData';

interface TripWorkspaceProps {
  onBack: () => void;
}

const DAY_LABEL_CONFIG = [
  { day: 1, x: 38, y: 46, color: '#f59e0b', bg: '#fef3c7', border: '#fde68a' },
  { day: 2, x: 38, y: 285, color: '#f97316', bg: '#ffedd5', border: '#fed7aa' },
  { day: 3, x: 38, y: 555, color: '#10b981', bg: '#d1fae5', border: '#a7f3d0' },
  { day: 4, x: 775, y: 255, color: '#f43f5e', bg: '#ffe4e6', border: '#fecdd3' },
];

const DAY_COLOR_PRESETS = [
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#14b8a6', // Teal
];

// CARD DIMENSIONS for dynamic connection center points
const CARD_DIMENSIONS: Record<string, { w: number; h: number }> = {
  polaroid: { w: 220, h: 230 },
  sticky: { w: 200, h: 120 },
  article: { w: 260, h: 220 },
  flight: { w: 280, h: 180 },
  hotel: { w: 260, h: 240 },
  note: { w: 210, h: 110 },
};

function getCardCenter(card: CanvasCard) {
  const dim = CARD_DIMENSIONS[card.type] || { w: 200, h: 150 };
  const w = card.width || dim.w;
  const h = dim.h;
  return {
    x: card.x + w / 2,
    y: card.y + h / 2,
  };
}

export default function TripWorkspace({ onBack }: TripWorkspaceProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(true);

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
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [showDayLabels, setShowDayLabels] = useState(true);
  const [items, setItems] = useState<InboxItem[]>(inboxItems);
  const [cards, setCards] = useState<CanvasCard[]>(canvasCards);
  const [selectedCard, setSelectedCard] = useState<CanvasCard | null>(null);

  // Promoting configurations to local state for Option B & C
  const [days, setDays] = useState(dayGroups);
  const [dayLabels, setDayLabels] = useState(DAY_LABEL_CONFIG);
  const [activeConnections, setActiveConnections] = useState(connections);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Option C: interactive active states
  const [linkingFromId, setLinkingFromId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalCoords, setCreateModalCoords] = useState<{ x: number; y: number } | null>(null);
  const [showAddDayModal, setShowAddDayModal] = useState(false);
  const [showOverflow, setShowOverflow] = useState(false);

  // Card dragging states
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);

  // Custom Inbox Item Classifier/Parser
  const handleAddItem = useCallback((content: string) => {
    let type: 'whatsapp' | 'link' | 'note' | 'flight' | 'hotel' = 'note';
    let source = 'Inbox Clip';
    let avatar = undefined;

    const lower = content.toLowerCase();
    if (lower.includes('flight') || lower.includes('jl') || lower.includes('ana') || lower.includes('sfo-') || lower.includes('kix')) {
      type = 'flight';
      source = 'Flight Parser';
    } else if (lower.includes('hotel') || lower.includes('ryokan') || lower.includes('booking') || lower.includes('stay') || lower.includes('airbnb') || lower.includes('hoshinoya') || lower.includes('hostel')) {
      type = 'hotel';
      source = 'Hotel Scanner';
    } else if (lower.includes('http') || lower.includes('.com') || lower.includes('reddit') || lower.includes('eater') || lower.includes('blog')) {
      type = 'link';
      source = 'Web Parser';
    } else if (lower.includes('chat') || lower.includes('says') || lower.includes(':') || lower.includes('mom') || lower.includes('yuki') || lower.includes('friend')) {
      type = 'whatsapp';
      source = 'WhatsApp Sync';
      avatar = '💬';
    }

    const newItem: InboxItem = {
      id: `i_spawn_${Date.now()}`,
      type,
      source,
      content,
      timestamp: 'Just now',
      processed: false,
      avatar,
    };

    setItems(prev => [newItem, ...prev]);
  }, []);

  // Enhanced handleProcessItem that generates and places stylized cards dynamically near clusters
  const handleProcessItem = useCallback((id: string) => {
    let processedItem: InboxItem | undefined;
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        processedItem = { ...item, processed: true };
        return processedItem;
      }
      return item;
    }));

    if (!processedItem) return;

    const item = processedItem as InboxItem;
    const newCardId = `c_spawn_${Date.now()}`;
    let newCard: CanvasCard;

    const associatedDay = activeDay || 2;
    const dayCfg = dayLabels.find(l => l.day === associatedDay) || dayLabels[0];
    const scatterX = Math.floor(Math.random() * 80) - 40;
    const scatterY = Math.floor(Math.random() * 80) - 40;
    
    const targetX = Math.min(Math.max(dayCfg.x + 180 + scatterX, 50), 1000);
    const targetY = Math.min(Math.max(dayCfg.y + scatterY, 50), 800);

    const rotation = (Math.random() * 4) - 2;

    if (item.type === 'flight') {
      newCard = {
        id: newCardId,
        type: 'flight',
        x: targetX,
        y: targetY,
        rotation,
        title: 'New Flight Ticket',
        subtitle: item.content,
        tag: `Day ${associatedDay} · Flight`,
        tagColor: 'slate',
        day: associatedDay,
        details: ['Parsed from flight tracker', 'Ready for boarding confirmation'],
        width: 280,
      };
    } else if (item.type === 'hotel') {
      newCard = {
        id: newCardId,
        type: 'hotel',
        x: targetX,
        y: targetY,
        rotation,
        title: 'Hotel Accommodation',
        subtitle: item.content,
        tag: `Day ${associatedDay} · Stay`,
        tagColor: 'amber',
        day: associatedDay,
        details: ['Parsed from reservation', 'Address details verified'],
        rating: 4.8,
        width: 260,
      };
    } else if (item.id === 'i4') {
      newCard = {
        id: newCardId,
        type: 'polaroid',
        x: targetX,
        y: targetY,
        rotation,
        title: 'Hidden Temples',
        subtitle: 'Kurama-dera & Jingo-ji',
        image: '/images/ryokan.jpg',
        tag: 'Day 2 · Exploration',
        tagColor: 'orange',
        day: 2,
        width: 220,
      };
    } else if (item.id === 'i6') {
      newCard = {
        id: newCardId,
        type: 'polaroid',
        x: targetX,
        y: targetY,
        rotation,
        title: 'Golden Pavilion (Kinkaku-ji)',
        subtitle: "Mom's Match Rec 🍵",
        image: '/images/gion.jpg',
        tag: 'Day 2 · Sightseeing',
        tagColor: 'orange',
        day: 2,
        width: 220,
      };
    } else if (item.id === 'i7') {
      newCard = {
        id: newCardId,
        type: 'article',
        x: targetX,
        y: targetY,
        rotation,
        title: 'Mizai Restaurant',
        subtitle: 'Michelin 3★ Kaiseki near Maruyama Park',
        tag: 'Day 4 · Fine Dining',
        tagColor: 'rose',
        day: 4,
        details: ['Tasting menu only', 'Pre-payment required', 'Rated 4.9 on Eater'],
        width: 250,
      };
    } else {
      newCard = {
        id: newCardId,
        type: 'sticky',
        x: targetX,
        y: targetY,
        rotation,
        title: item.source || 'AI Parsed Clip',
        subtitle: item.content,
        color: item.type === 'whatsapp' ? '#fce7f3' : '#d1fae5',
        day: associatedDay,
        width: 200,
      };
    }

    setCards(prev => [...prev, newCard]);

    const siblingCard = cards.find(c => c.day === associatedDay && c.id !== newCardId);
    if (siblingCard) {
      setActiveConnections(prev => [...prev, { from: siblingCard.id, to: newCardId, label: 'dynamic-link' }]);
    }
  }, [activeDay, dayLabels, cards]);

  // AI Prompt Parser Logic
  const handleSendQuery = useCallback((query: string) => {
    if (!query.trim()) return;
    setIsAiThinking(true);

    setTimeout(() => {
      const lower = query.toLowerCase();

      if (lower.includes('plan day 5') || lower.includes('suggest day 5') || lower.includes('day 5 itinerary')) {
        setDays(prev => {
          if (prev.some(d => d.day === 5)) return prev;
          return [...prev, { day: 5, label: 'Day 5 — Kurama & Kaiseki', color: '#8b5cf6' }];
        });

        setDayLabels(prev => {
          if (prev.some(l => l.day === 5)) return prev;
          return [...prev, { day: 5, x: 775, y: 555, color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' }];
        });

        const curamaDera: CanvasCard = {
          id: 'c15',
          type: 'polaroid',
          x: 790,
          y: 520,
          rotation: 2.2,
          title: 'Kurama-dera Temple',
          subtitle: 'Mountain hike north of Kyoto',
          image: '/images/fushimi-inari.jpg',
          tag: 'Day 5 · Morning',
          tagColor: 'rose',
          day: 5,
          width: 220,
        };

        setCards(prev => {
          const filtered = prev.filter(c => c.id !== 'c15');
          return [...filtered, curamaDera];
        });

        setActiveConnections(prev => {
          const filtered = prev.filter(conn => !(conn.from === 'c15' && conn.to === 'c14') && !(conn.from === 'c14' && conn.to === 'c15'));
          return [...filtered, { from: 'c15', to: 'c14', label: 'hiking to dining' }];
        });

        setActiveDay(5);

      } else if (lower.includes('ryokan') || lower.includes('hoshinoya') || lower.includes('stay in arashiyama')) {
        const hoshinoya: CanvasCard = {
          id: 'c16',
          type: 'hotel',
          x: 290,
          y: 690,
          rotation: -1.2,
          title: 'Hoshinoya Kyoto',
          subtitle: 'Arashiyama River Luxury Ryokan',
          tag: 'Day 3 · Luxury Ryokan',
          tagColor: 'emerald',
          day: 3,
          details: ['Accessible only via wooden boat ride', 'Stunning river views', '¥110,000/night', 'Private pavilion standard'],
          rating: 5.0,
          image: '/images/ryokan.jpg',
          width: 260,
        };

        setCards(prev => {
          const filtered = prev.filter(c => c.id !== 'c16');
          return [...filtered, hoshinoya];
        });

        setActiveConnections(prev => {
          const filtered = prev.filter(conn => !(conn.from === 'c7' && conn.to === 'c16') && !(conn.from === 'c16' && conn.to === 'c7'));
          return [...filtered, { from: 'c7', to: 'c16', label: 'stay option' }];
        });

        setActiveDay(3);

      } else if (lower.includes('restaurant') || lower.includes('gion food') || lower.includes('gion restaurant') || lower.includes('sasaki')) {
        const gionSasaki: CanvasCard = {
          id: 'c17',
          type: 'article',
          x: 1040,
          y: 280,
          rotation: 1.8,
          title: 'Gion Sasaki',
          subtitle: 'Michelin 3★ creative counter dining',
          tag: 'Day 4 · Splurge dinner',
          tagColor: 'rose',
          day: 4,
          details: ['Pre-book 2 months in advance', 'Counter seating only'],
          width: 260,
        };

        setCards(prev => {
          const filtered = prev.filter(c => c.id !== 'c17');
          return [...filtered, gionSasaki];
        });

        setActiveConnections(prev => {
          const filtered = prev.filter(conn => !(conn.from === 'c10' && conn.to === 'c17') && !(conn.from === 'c17' && conn.to === 'c10'));
          return [...filtered, { from: 'c10', to: 'c17', label: 'dinner option' }];
        });

        setActiveDay(4);

      } else {
        const notesId = `c_ai_sticky_${Date.now()}`;
        const newSticky: CanvasCard = {
          id: notesId,
          type: 'note',
          x: 480 + (Math.random() * 60 - 30),
          y: 350 + (Math.random() * 60 - 30),
          rotation: (Math.random() * 4) - 2,
          title: 'AI Helper Answer 🤖',
          subtitle: `Regarding "${query}": Based on local guides, I highly recommend visiting early morning. Make sure to check weather and transit times!`,
          tag: 'AI Assistant Answer',
          tagColor: 'slate',
          day: activeDay || 0,
          width: 230,
        };

        setCards(prev => [...prev, newSticky]);
      }

      setIsAiThinking(false);
    }, 1200);
  }, [activeDay, cards, days, dayLabels]);

  // Option C: Card Modifying Callbacks
  const handleUpdateCard = useCallback((updated: CanvasCard) => {
    setCards(prev => prev.map(c => c.id === updated.id ? updated : c));
    setSelectedCard(updated);
  }, []);

  const handleDeleteCard = useCallback((cardId: string) => {
    setCards(prev => prev.filter(c => c.id !== cardId));
    setActiveConnections(prev => prev.filter(conn => conn.from !== cardId && conn.to !== cardId));
    if (selectedCard?.id === cardId) {
      setSelectedCard(null);
    }
  }, [selectedCard]);

  const handleStartLinking = useCallback((cardId: string) => {
    setLinkingFromId(cardId);
  }, []);

  const handleOpenCreateModal = useCallback((x?: number, y?: number) => {
    if (x !== undefined && y !== undefined) {
      setCreateModalCoords({ x, y });
    } else {
      setCreateModalCoords({ x: 450, y: 250 });
    }
    setShowCreateModal(true);
  }, []);

  const handleCreateManualCard = useCallback((newCardData: Omit<CanvasCard, 'id' | 'x' | 'y' | 'rotation'>) => {
    const newCardId = `c_manual_${Date.now()}`;
    const coords = createModalCoords || { x: 450, y: 250 };
    const newCard: CanvasCard = {
      id: newCardId,
      x: coords.x,
      y: coords.y,
      rotation: (Math.random() * 4) - 2,
      ...newCardData,
    };
    setCards(prev => [...prev, newCard]);
    setShowCreateModal(false);
    setCreateModalCoords(null);
  }, [createModalCoords]);

  const handleAddCustomDay = useCallback((dayNum: number, labelText: string) => {
    if (days.some(d => d.day === dayNum)) {
      alert(`Day ${dayNum} already exists!`);
      return;
    }
    const color = DAY_COLOR_PRESETS[dayNum % DAY_COLOR_PRESETS.length];
    const newDay = { day: dayNum, label: `Day ${dayNum} — ${labelText}`, color };
    
    // Stagger layout coordinates sequentially based on days length
    const isRight = days.length % 2 === 1;
    const newX = isRight ? 775 : 38;
    const newY = 46 + Math.floor(days.length / 2) * 260;

    const newLabel = {
      day: dayNum,
      x: newX,
      y: newY,
      color,
      bg: color + '12',
      border: color + '30',
    };

    setDays(prev => [...prev, newDay]);
    setDayLabels(prev => [...prev, newLabel]);
    setShowAddDayModal(false);
  }, [days]);

  const handleCardMouseDown = useCallback((cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    // Convert screen coordinates into canvas coordinate space
    const canvasMouseX = (e.clientX - pan.x) / zoom;
    const canvasMouseY = (e.clientY - pan.y) / zoom;

    setDraggingCardId(cardId);
    setDragOffset({
      x: canvasMouseX - card.x,
      y: canvasMouseY - card.y,
    });
  }, [cards, pan, zoom]);

  const handleCardTouchStart = useCallback((cardId: string, e: React.TouchEvent) => {
    e.stopPropagation();
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    const touch = e.touches[0];
    if (!touch) return;

    // Convert screen coordinates into canvas coordinate space
    const canvasMouseX = (touch.clientX - pan.x) / zoom;
    const canvasMouseY = (touch.clientY - pan.y) / zoom;

    setDraggingCardId(cardId);
    setDragOffset({
      x: canvasMouseX - card.x,
      y: canvasMouseY - card.y,
    });
  }, [cards, pan, zoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.canvas-item')) return;
    if (linkingFromId) {
      setLinkingFromId(null);
      return;
    }
    setIsDraggingCanvas(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan, linkingFromId]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.canvas-item')) return;
    if (linkingFromId) {
      setLinkingFromId(null);
      return;
    }
    const touch = e.touches[0];
    if (!touch) return;
    setIsDraggingCanvas(true);
    setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
  }, [pan, linkingFromId]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggingCardId) {
      // Convert screen coordinates into canvas coordinate space
      const canvasMouseX = (e.clientX - pan.x) / zoom;
      const canvasMouseY = (e.clientY - pan.y) / zoom;

      const newX = canvasMouseX - dragOffset.x;
      const newY = canvasMouseY - dragOffset.y;

      setCards(prev => prev.map(c =>
        c.id === draggingCardId ? { ...c, x: newX, y: newY } : c
      ));
      return;
    }

    if (!isDraggingCanvas) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [isDraggingCanvas, draggingCardId, dragOffset, pan, zoom, dragStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    if (draggingCardId) {
      // Prevent default scrolling on mobile when dragging a card
      if (e.cancelable) e.preventDefault();
      // Convert screen coordinates into canvas coordinate space
      const canvasMouseX = (touch.clientX - pan.x) / zoom;
      const canvasMouseY = (touch.clientY - pan.y) / zoom;

      const newX = canvasMouseX - dragOffset.x;
      const newY = canvasMouseY - dragOffset.y;

      setCards(prev => prev.map(c =>
        c.id === draggingCardId ? { ...c, x: newX, y: newY } : c
      ));
      return;
    }

    if (!isDraggingCanvas) return;
    // Prevent default scrolling on mobile when panning the canvas
    if (e.cancelable) e.preventDefault();
    setPan({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y });
  }, [isDraggingCanvas, draggingCardId, dragOffset, pan, zoom, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingCanvas(false);
    setDraggingCardId(null);
  }, []);

  const handleZoom = useCallback((dir: 'in' | 'out') => {
    setZoom(z => Math.min(Math.max(dir === 'in' ? z + 0.1 : z - 0.1, 0.4), 2));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

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
            onClick={onBack}
            aria-label="Back to home"
            className="flex items-center gap-1.5 text-stone-500 hover:text-stone-800 transition-colors text-sm flex-shrink-0 cursor-pointer"
          >
            <ChevronLeft size={15} />
            <Compass size={15} color="#92400e" />
            <span className="font-semibold text-stone-700 hidden sm:block" style={{ fontSize: '13px' }}>Wayfarer</span>
          </button>

          <div className="w-px h-5 bg-stone-200 flex-shrink-0" />

          {/* Trip identity */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-6 h-6 rounded flex items-center justify-center text-sm">🇯🇵</div>
            <h1 className="font-semibold text-stone-800" style={{ fontSize: '14px' }}>7 Days in Kyoto</h1>
            <span className="hidden md:flex items-center gap-1 text-xs px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: '#d1fae5', color: '#065f46' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Planning
            </span>
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
              onClick={() => setShowAddDayModal(true)}
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
              {['🧑', '👩', '🧔'].map((a, i) => (
                <div key={i} className="w-6 h-6 rounded-full flex items-center justify-center text-xs ring-2 ring-white select-none"
                  style={{ backgroundColor: '#e7e3dc', fontSize: '13px' }}>
                  {a}
                </div>
              ))}
            </div>
            <span className="text-xs text-stone-400 mr-2 hidden lg:block select-none">3 travelers</span>
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
              onClick={() => setShowOverflow(o => !o)}
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
                <div className="fixed inset-0 z-40" onClick={() => setShowOverflow(false)} />
                {/* popover */}
                <div className="absolute right-0 top-full mt-1 z-50 rounded-xl shadow-xl py-1.5 min-w-[160px]"
                  style={{ backgroundColor: '#fefcf8', border: '1px solid #e7e3dc' }}>
                  <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: '#e7e3dc' }}>
                    <div className="flex items-center -space-x-1.5">
                      {['🧑', '👩', '🧔'].map((a, i) => (
                        <div key={i} className="w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white select-none"
                          style={{ backgroundColor: '#e7e3dc', fontSize: '11px' }}>{a}</div>
                      ))}
                    </div>
                    <span className="text-xs text-stone-500">3 travelers</span>
                  </div>
                  <button className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-stone-50 transition-colors cursor-pointer"
                    style={{ color: '#78716c' }} onClick={() => setShowOverflow(false)}>
                    <Share2 size={14} />
                    <span className="text-sm">Share</span>
                  </button>
                  <button className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-stone-50 transition-colors cursor-pointer"
                    style={{ color: '#78716c' }} onClick={() => setShowOverflow(false)}>
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
            onClick={() => setShowAddDayModal(true)}
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
                <StatItem icon={<Calendar size={11} />} label="Dec 14–21" />
                <div className="w-px h-3 bg-stone-200" />
              </>
            )}
            <StatItem icon={<MapPin size={11} />} label="Kyoto, JP" />
            {!isMobile && (
              <>
                <div className="w-px h-3 bg-stone-200" />
                <StatItem icon={<Clock size={11} />} label="7 nights" />
                <div className="w-px h-3 bg-stone-200" />
                <span className="text-xs text-stone-400">~$2,340 est.</span>
              </>
            )}
            <div className="w-px h-3 bg-stone-200" />
            <span className="text-xs">🌤️ 8°C</span>
          </div>

          {/* Linking Mode Active Banner */}
          {linkingFromId && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-4 py-2 rounded-full border shadow-xl bg-amber-50 border-amber-300 text-amber-900 animate-pulse text-xs font-semibold select-none">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Link Mode: Click another card on the canvas to connect them</span>
              <button
                onClick={() => setLinkingFromId(null)}
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
                const isTargetOfLinking = linkingFromId !== null && linkingFromId !== card.id;

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
                      if (linkingFromId) {
                        if (linkingFromId === card.id) {
                          setLinkingFromId(null);
                          return;
                        }
                        // Connect them!
                        setActiveConnections(prev => {
                          // Prevent duplicate connections
                          if (prev.some(conn => (conn.from === linkingFromId && conn.to === card.id) || (conn.from === card.id && conn.to === linkingFromId))) {
                            return prev;
                          }
                          return [...prev, { from: linkingFromId, to: card.id, label: 'custom-link' }];
                        });
                        setLinkingFromId(null);
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
            isLinkingActive={linkingFromId === selectedCard?.id}
          />

        </main>
      </div>

      {/* DYNAMIC DIALOGS / OVERLAYS */}
      <CreateCardModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setCreateModalCoords(null);
        }}
        onSubmit={handleCreateManualCard}
        days={days}
      />

      <AddDayModal
        isOpen={showAddDayModal}
        onClose={() => setShowAddDayModal(false)}
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
  if (!isOpen) return null;

  const [type, setType] = useState<'polaroid' | 'sticky' | 'article' | 'flight' | 'hotel' | 'note'>('sticky');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [day, setDay] = useState(0);
  const [tag, setTag] = useState('');
  const [tagColor, setTagColor] = useState('slate');
  const [detailsString, setDetailsString] = useState('');
  const [price, setPrice] = useState('');
  const [rating, setRating] = useState('4.5');

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
          <button type="button" onClick={onClose} className="text-stone-300 hover:text-stone-600 transition-colors cursor-pointer p-1 rounded hover:bg-stone-50">
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1 scrollbar-thin">
          {/* Card Type Selector */}
          <div>
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Card Type</label>
            <select
              value={type}
              onChange={e => setType(e.target.value as any)}
              className="w-full text-xs border rounded-xl px-3 py-2 bg-white border-stone-200 outline-none focus:border-amber-500 text-stone-700 h-[36px]"
            >
              <option value="sticky">📌 Sticky Note</option>
              <option value="polaroid">🖼️ Polaroid Location</option>
              <option value="hotel">🏨 Hotel Accommodation</option>
              <option value="flight">✈️ Flight Ticket</option>
              <option value="article">📄 Saved Article</option>
              <option value="note">📝 Quick Note</option>
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
  if (!isOpen) return null;

  const [dayNum, setDayNum] = useState(nextDayNum);
  const [label, setLabel] = useState('');

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
          <button type="button" onClick={onClose} className="text-stone-300 hover:text-stone-600 transition-colors cursor-pointer p-1 rounded hover:bg-stone-50">
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
