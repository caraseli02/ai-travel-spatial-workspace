import React from "react";
import { Star, Plane, MapPin, Wifi } from "lucide-react";
import type { CanvasCard } from "../models/trip";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  filterRedundantCardDetails,
  resolveKanbanCardTag,
} from "../utils/tripWorkspaceViewHelpers";

export interface CardRendererProps {
  card: CanvasCard;
  onMouseDown?: (e: React.MouseEvent) => void;
  isDragging?: boolean;
  embedded?: boolean;
}

const tagColorMap: Record<string, { bg: string; text: string; border: string }> = {
  amber:   { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
  orange:  { bg: '#ffedd5', text: '#c2410c', border: '#fed7aa' },
  emerald: { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
  rose:    { bg: '#ffe4e6', text: '#be123c', border: '#fecdd3' },
  slate:   { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' },
  blue:    { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' },
};

function getCanvasItemStyle(
  card: CanvasCard,
  options: { embedded?: boolean; isDragging?: boolean; defaultWidth?: number } = {},
): React.CSSProperties {
  const { embedded, isDragging, defaultWidth = 220 } = options;
  if (embedded) {
    return {
      position: "relative",
      width: "100%",
      transform: isDragging ? "scale(1.02)" : undefined,
      zIndex: isDragging ? 50 : 1,
    };
  }

  return {
    position: "absolute",
    left: card.x,
    top: card.y,
    width: card.width || defaultWidth,
    transform: `rotate(${card.rotation}deg)${isDragging ? " scale(1.05)" : ""}`,
    zIndex: isDragging ? 50 : 1,
    transition: isDragging ? "none" : "transform 0.2s ease, box-shadow 0.2s ease",
  };
}

function CanvasCardShell({
  card,
  embedded,
  isDragging,
  onMouseDown,
  defaultWidth,
  children,
}: {
  card: CanvasCard;
  embedded?: boolean;
  isDragging?: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
  defaultWidth?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        embedded
          ? "canvas-item group w-full cursor-pointer select-none"
          : "canvas-item group cursor-grab select-none active:cursor-grabbing"
      }
      onMouseDown={onMouseDown}
      style={getCanvasItemStyle(card, { embedded, isDragging, defaultWidth })}
    >
      {children}
    </div>
  );
}

function TagPill({ tag, color }: { tag: string; color: string }) {
  const c = tagColorMap[color] || tagColorMap.slate;
  return (
    <Badge
      variant="outline"
      className="max-w-full shrink-0 whitespace-normal rounded-full px-2 py-0.5 text-center text-xs leading-tight font-medium"
      style={{ backgroundColor: c.bg, color: c.text, borderColor: c.border }}
    >
      {tag}
    </Badge>
  );
}

function CardTag({
  tag,
  color,
  embedded,
}: {
  tag?: string;
  color: string;
  embedded?: boolean;
}) {
  const displayTag = embedded ? resolveKanbanCardTag(tag) : tag;
  if (!displayTag) return null;
  return <TagPill tag={displayTag} color={color} />;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={10}
          className={i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-stone-200 fill-stone-200'} />
      ))}
      <span className="text-xs text-stone-400 ml-1">{rating}</span>
    </div>
  );
}

// --- POLAROID ---
export function PolaroidCard({
  card,
  onMouseDown,
  isDragging,
  embedded,
}: CardRendererProps) {
  return (
    <CanvasCardShell card={card} embedded={embedded} isDragging={isDragging} onMouseDown={onMouseDown} defaultWidth={220}>
      <Card
        className={`rounded-lg bg-card transition-all duration-200 ring-0 ${
          isDragging ? "shadow-2xl ring-2 ring-amber-500/20" : "polaroid-shadow group-hover:polaroid-shadow-hover"
        }`}
        style={{ padding: "10px 10px 14px 10px" }}
      >
        {/* Image */}
        <div className="mb-3 h-[140px] w-full overflow-hidden rounded bg-muted">
          {card.image && (
            <img src={card.image} alt={card.title}
              className="w-full h-full object-cover" />
          )}
        </div>
        {/* Content */}
        <div className="px-1">
          <CardTag tag={card.tag} color={card.tagColor || "slate"} embedded={embedded} />
          <p className="mt-1.5 text-sm leading-tight font-semibold text-foreground">{card.title}</p>
          {card.subtitle && (
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{card.subtitle}</p>
          )}
        </div>
      </Card>
    </CanvasCardShell>
  );
}

// --- STICKY NOTE ---
const stickyColors: Record<string, { bg: string; border: string; fold: string }> = {
  '#fef3c7': { bg: '#fef3c7', border: '#fde68a', fold: '#fbbf24' },
  '#fce7f3': { bg: '#fce7f3', border: '#fbcfe8', fold: '#f9a8d4' },
  '#d1fae5': { bg: '#d1fae5', border: '#a7f3d0', fold: '#6ee7b7' },
  '#ffe4e6': { bg: '#ffe4e6', border: '#fecdd3', fold: '#fda4af' },
  '#dbeafe': { bg: '#dbeafe', border: '#bfdbfe', fold: '#93c5fd' },
};

export function StickyCard({
  card,
  onMouseDown,
  isDragging,
  embedded,
}: CardRendererProps) {
  const colors = stickyColors[card.color || '#fef3c7'] || stickyColors['#fef3c7'];
  return (
    <CanvasCardShell card={card} embedded={embedded} isDragging={isDragging} onMouseDown={onMouseDown} defaultWidth={200}>
      <Card className={`relative overflow-hidden rounded-lg py-0 transition-all duration-200 ring-0 ${
        isDragging ? 'shadow-2xl ring-2 ring-amber-500/20' : 'sticky-shadow group-hover:shadow-lg'
      }`}
        style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}`, padding: '14px' }}>
        {/* Fold corner */}
        <div className="absolute top-0 right-0 w-5 h-5"
          style={{
            background: `linear-gradient(225deg, white 50%, ${colors.fold} 50%)`,
          }} />
        <p className="mb-1.5 text-sm leading-tight font-semibold text-foreground">{card.title}</p>
        {card.subtitle && (
          <p className="text-xs leading-relaxed text-muted-foreground">{card.subtitle}</p>
        )}
      </Card>
    </CanvasCardShell>
  );
}

// --- ARTICLE / LINK CARD ---
export function ArticleCard({
  card,
  onMouseDown,
  isDragging,
  embedded,
}: CardRendererProps) {
  return (
    <CanvasCardShell card={card} embedded={embedded} isDragging={isDragging} onMouseDown={onMouseDown} defaultWidth={260}>
      <Card
        className={`overflow-hidden rounded-xl border border-border bg-card py-0 transition-all duration-200 ring-0 ${
          isDragging ? "shadow-2xl ring-2 ring-amber-500/20" : "polaroid-shadow group-hover:polaroid-shadow-hover"
        }`}
      >
        {/* Image strip */}
        {card.image && (
          <div className="h-[110px] w-full overflow-hidden bg-muted">
            <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-3.5">
          <CardTag tag={card.tag} color={card.tagColor || "slate"} embedded={embedded} />
          <p className="mt-2 text-sm leading-tight font-semibold text-foreground">{card.title}</p>
          {card.subtitle && (
            <p className="mt-1 text-xs leading-snug text-muted-foreground">{card.subtitle}</p>
          )}
          {card.details && card.details.length > 0 && (
            <ul className="mt-2.5 space-y-1">
              {card.details.map((d, i) => (
                <li key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="size-1 shrink-0 rounded-full bg-muted-foreground/30" />
                  {d}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </CanvasCardShell>
  );
}

// --- FLIGHT CARD ---
export function FlightCard({
  card,
  onMouseDown,
  isDragging,
  embedded,
}: CardRendererProps) {
  const displayDetails = filterRedundantCardDetails(card.details, card.price);

  return (
    <CanvasCardShell card={card} embedded={embedded} isDragging={isDragging} onMouseDown={onMouseDown} defaultWidth={280}>
      <Card
        className={`rounded-xl border border-border bg-card py-0 transition-all duration-200 ring-0 ${
          isDragging ? "shadow-2xl ring-2 ring-amber-500/20" : "polaroid-shadow group-hover:polaroid-shadow-hover"
        }`}
      >
        {/* Header strip */}
        <div className="flex items-center justify-between rounded-t-xl border-b border-amber-200 bg-amber-50 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Plane size={13} className="text-primary" />
            <span className="text-xs font-semibold text-primary">Flight</span>
          </div>
          <CardTag tag={card.tag} color={card.tagColor || "amber"} embedded={embedded} />
        </div>

        <div className="p-4">
          {/* Route */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xl font-bold text-foreground">SFO</p>
              <p className="text-xs text-muted-foreground">San Francisco</p>
            </div>
            <div className="flex flex-1 items-center justify-center gap-1 px-3">
              <div className="h-px flex-1 bg-border" />
              <Plane size={14} className="text-muted-foreground/50" />
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-foreground">KIX</p>
              <p className="text-xs text-muted-foreground">Osaka/Kyoto</p>
            </div>
          </div>

          {/* Details */}
          <p className="mb-2.5 text-xs text-muted-foreground">{card.subtitle}</p>
          {displayDetails.length > 0 && (
            <div className="space-y-1">
              {displayDetails.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="size-1 rounded-full bg-muted-foreground/30" />
                  {d}
                </div>
              ))}
            </div>
          )}
          {card.price && (
            <div className={displayDetails.length > 0 ? "mt-3 border-t border-border pt-3" : "mt-1"}>
              <span className="text-lg font-bold text-foreground">{card.price}</span>
              <span className="ml-1 text-xs text-muted-foreground">total</span>
            </div>
          )}
        </div>
      </Card>
    </CanvasCardShell>
  );
}

// --- HOTEL CARD ---
export function HotelCard({
  card,
  onMouseDown,
  isDragging,
  embedded,
}: CardRendererProps) {
  return (
    <CanvasCardShell card={card} embedded={embedded} isDragging={isDragging} onMouseDown={onMouseDown} defaultWidth={260}>
      <Card
        className={`overflow-hidden rounded-xl border border-border bg-card py-0 transition-all duration-200 ring-0 ${
          isDragging ? "shadow-2xl ring-2 ring-amber-500/20" : "polaroid-shadow group-hover:polaroid-shadow-hover"
        }`}
      >
        {/* Image */}
        {card.image && (
          <div className="h-[120px] w-full overflow-hidden bg-muted">
            <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-3.5">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm leading-tight font-semibold text-foreground">{card.title}</p>
            <CardTag tag={card.tag} color={card.tagColor || "amber"} embedded={embedded} />
          </div>
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin size={11} className="text-muted-foreground" />
            <p className="text-xs text-muted-foreground">{card.subtitle}</p>
          </div>
          {card.rating && <StarRating rating={card.rating} />}
          {card.details && (
            <ul className="mt-2.5 space-y-1">
              {card.details.map((d, i) => (
                <li key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="size-1 shrink-0 rounded-full bg-muted-foreground/30" />
                  {d}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </CanvasCardShell>
  );
}

// --- NOTE CARD ---
export function NoteCard({
  card,
  onMouseDown,
  isDragging,
  embedded,
}: CardRendererProps) {
  return (
    <CanvasCardShell card={card} embedded={embedded} isDragging={isDragging} onMouseDown={onMouseDown} defaultWidth={210}>
      <Card
        className={`rounded-xl border border-border bg-card p-3.5 transition-all duration-200 ring-0 ${
          isDragging ? "shadow-2xl ring-2 ring-amber-500/20" : "polaroid-shadow group-hover:polaroid-shadow-hover"
        }`}
      >
        <div className="mb-2 flex items-center justify-between">
          <CardTag tag={card.tag} color={card.tagColor || "slate"} embedded={embedded} />
          <Wifi size={13} className="text-muted-foreground/50" />
        </div>
        <p className="mb-1 text-sm font-semibold text-foreground">{card.title}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{card.subtitle}</p>
      </Card>
    </CanvasCardShell>
  );
}

// Main dispatcher
export function CanvasCardRenderer({ card, onMouseDown, isDragging, embedded }: CardRendererProps) {
  switch (card.type) {
    case "polaroid":
      return <PolaroidCard card={card} onMouseDown={onMouseDown} isDragging={isDragging} embedded={embedded} />;
    case "sticky":
      return <StickyCard card={card} onMouseDown={onMouseDown} isDragging={isDragging} embedded={embedded} />;
    case "article":
      return <ArticleCard card={card} onMouseDown={onMouseDown} isDragging={isDragging} embedded={embedded} />;
    case "flight":
      return <FlightCard card={card} onMouseDown={onMouseDown} isDragging={isDragging} embedded={embedded} />;
    case "hotel":
      return <HotelCard card={card} onMouseDown={onMouseDown} isDragging={isDragging} embedded={embedded} />;
    case "note":
      return <NoteCard card={card} onMouseDown={onMouseDown} isDragging={isDragging} embedded={embedded} />;
    default:
      return null;
  }
}
