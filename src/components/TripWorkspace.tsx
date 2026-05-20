import { useState, useRef, useCallback } from 'react';
import {
  Compass, ChevronLeft, MapPin, Calendar,
  ZoomIn, ZoomOut, Maximize2, Grid3X3, Share2, Download,
  Sparkles, PanelLeftClose, PanelLeftOpen, Plus,
  Clock
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
  const [inboxOpen, setInboxOpen] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [showDayLabels, setShowDayLabels] = useState(true);
  const [items, setItems] = useState<InboxItem[]>(inboxItems);
  const [cards, setCards] = useState<CanvasCard[]>(canvasCards);
  const [selectedCard, setSelectedCard] = useState<CanvasCard | null>(null);

  // Card dragging states
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);

  const handleProcessItem = useCallback((id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, processed: true } : item
    ));
  }, []);

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

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.canvas-item')) return;
    setIsDraggingCanvas(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan]);

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
      <header className="flex items-center gap-3 px-4 py-2.5 flex-shrink-0 z-40"
        style={{ backgroundColor: '#fefcf8', borderBottom: '1px solid #e7e3dc', height: '52px' }}>

        {/* Left: Back + Trip name */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-stone-500 hover:text-stone-800 transition-colors text-sm mr-1"
        >
          <ChevronLeft size={15} />
          <Compass size={15} color="#92400e" />
          <span className="font-semibold text-stone-700 hidden sm:block" style={{ fontSize: '13px' }}>Wayfarer</span>
        </button>

        <div className="w-px h-5 bg-stone-200" />

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded flex items-center justify-center text-sm">🇯🇵</div>
          <div>
            <h1 className="font-semibold text-stone-800 leading-tight" style={{ fontSize: '14px' }}>7 Days in Kyoto</h1>
          </div>
          <span className="hidden sm:flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
            style={{ backgroundColor: '#d1fae5', color: '#065f46' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Planning
          </span>
        </div>

        {/* Center: Day filters */}
        <div className="flex-1 flex items-center justify-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveDay(null)}
            className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium transition-all"
            style={{
              backgroundColor: activeDay === null ? '#1c1917' : '#f5f3ef',
              color: activeDay === null ? 'white' : '#78716c',
            }}
          >
            All days
          </button>
          {dayGroups.map(d => (
            <button
              key={d.day}
              onClick={() => setActiveDay(activeDay === d.day ? null : d.day)}
              className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium transition-all"
              style={{
                backgroundColor: activeDay === d.day ? d.color : '#f5f3ef',
                color: activeDay === d.day ? 'white' : '#78716c',
              }}
            >
              Day {d.day}
            </button>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          <div className="hidden sm:flex items-center">
            <div className="flex items-center -space-x-2">
              {['🧑', '👩', '🧔'].map((a, i) => (
                <div key={i} className="w-6 h-6 rounded-full flex items-center justify-center text-xs ring-2 ring-white"
                  style={{ backgroundColor: '#e7e3dc', fontSize: '13px' }}>
                  {a}
                </div>
              ))}
            </div>
            <span className="text-xs text-stone-400 ml-2 hidden lg:block">3 travelers</span>
          </div>

          <button className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-all hover:bg-stone-100"
            style={{ color: '#78716c' }}>
            <Share2 size={13} />
            <span className="hidden sm:block">Share</span>
          </button>
          <button className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-all hover:bg-stone-100"
            style={{ color: '#78716c' }}>
            <Download size={13} />
            <span className="hidden sm:block">Export</span>
          </button>
          <button
            onClick={() => setInboxOpen(o => !o)}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-all font-medium"
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
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* INBOX SIDEBAR */}
        <aside
          className="flex-shrink-0 overflow-hidden transition-all duration-300 z-30"
          style={{
            width: inboxOpen ? '280px' : '0px',
            borderRight: inboxOpen ? '1px solid #e7e3dc' : 'none',
          }}
        >
          {inboxOpen && (
            <div className="h-full" style={{ width: '280px' }}>
              <InboxPanel items={items} onProcessItem={handleProcessItem} />
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
          <div className="absolute top-3 right-3 z-20 flex items-center gap-2.5 rounded-xl px-3 py-2"
            style={{ backgroundColor: '#fefcf8', border: '1px solid #e7e3dc', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <StatItem icon={<Calendar size={11} />} label="Dec 14–21" />
            <div className="w-px h-3 bg-stone-200" />
            <StatItem icon={<MapPin size={11} />} label="Kyoto, JP" />
            <div className="w-px h-3 bg-stone-200" />
            <StatItem icon={<Clock size={11} />} label="7 nights" />
            <div className="w-px h-3 bg-stone-200" />
            <span className="text-xs text-stone-400">~$2,340 est.</span>
            <div className="w-px h-3 bg-stone-200" />
            <span className="text-xs">🌤️ 8°C</span>
          </div>

          {/* AI prompt bar */}
          <AiPromptBar />

          {/* THE CANVAS */}
          <div
            ref={canvasRef}
            className="absolute inset-0 canvas-bg overflow-hidden"
            style={{ cursor: isDraggingCanvas ? 'grabbing' : 'grab' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
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
                {connections.map((conn, i) => {
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
                        className="ink-line"
                      />
                      <circle cx={fromCenter.x} cy={fromCenter.y} r="3" fill="#d6cfc3" />
                      <circle cx={toCenter.x} cy={toCenter.y} r="3" fill="#d6cfc3" />
                    </g>
                  );
                })}
              </svg>

              {/* Day cluster labels */}
              {showDayLabels && DAY_LABEL_CONFIG.map(cfg => {
                const group = dayGroups.find(d => d.day === cfg.day);
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
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all"
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
                    {/* Soft dashed bounding box */}
                    <div className="absolute inset-0 pointer-events-none" />
                  </div>
                );
              })}

              {/* CARDS */}
              {filteredCards.map(card => (
                <div
                  key={card.id}
                  className="transition-opacity duration-200"
                  style={{
                    opacity: activeDay !== null && card.day !== activeDay && card.day !== 0 ? 0.2 : 1,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCard(c => c?.id === card.id ? null : card);
                  }}
                >
                  <CanvasCardRenderer
                    card={card}
                    onMouseDown={(e) => handleCardMouseDown(card.id, e)}
                    isDragging={draggingCardId === card.id}
                  />
                </div>
              ))}

              {/* Add card button */}
              <div
                className="absolute flex items-center gap-1.5 cursor-pointer group"
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
          <CardDetailPanel card={selectedCard} onClose={() => setSelectedCard(null)} />

          {/* Bottom mini-map legend */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ backgroundColor: 'rgba(254,252,248,0.95)', border: '1px solid #e7e3dc', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            <span className="text-xs text-stone-400 font-medium mr-1">Jump to:</span>
            {dayGroups.map(d => (
              <button
                key={d.day}
                onClick={() => {
                  setActiveDay(null);
                  setPan({ x: 0, y: 0 });
                }}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all hover:opacity-80"
                style={{ backgroundColor: d.color + '20', color: d.color }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                Day {d.day}
              </button>
            ))}
            <div className="w-px h-3 bg-stone-200 mx-1" />
            <span className="text-xs text-stone-400">{cards.length} cards</span>
          </div>
        </main>
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
      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
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

function AiPromptBar() {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const suggestions = [
    'Suggest a Day 5 itinerary',
    'Find restaurants near Gion',
    'How long from Arashiyama to Nishiki?',
  ];

  return (
    <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-20 w-full max-w-lg px-4">
      <div className={`rounded-xl transition-all duration-200 ${focused ? 'shadow-lg' : 'shadow-sm'}`}
        style={{ backgroundColor: '#fefcf8', border: `1.5px solid ${focused ? '#fde68a' : '#e7e3dc'}` }}>
        <div className="flex items-center gap-2 px-3 py-2.5">
          <Sparkles size={14} color="#92400e" />
          <input
            className="flex-1 text-xs outline-none bg-transparent placeholder-stone-300 text-stone-700"
            placeholder='Ask AI: "Plan Day 5" or "Find a ryokan near Arashiyama"'
            value={value}
            onChange={e => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            style={{ fontFamily: 'inherit' }}
          />
          {value && (
            <button className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#92400e' }}>
              <Plus size={12} color="white" style={{ transform: 'rotate(45deg)' }} />
            </button>
          )}
        </div>

        {focused && !value && (
          <div className="px-3 pb-2.5 flex flex-wrap gap-1.5">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setValue(s)}
                className="text-xs px-2.5 py-1 rounded-full transition-all hover:opacity-80"
                style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
