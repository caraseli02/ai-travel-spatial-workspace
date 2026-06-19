import { useEffect, useMemo } from "react";
import L from "leaflet";
import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";
import {
  LayoutGrid,
  Map as MapIcon,
  Maximize2,
  Plus,
  Route,
  Star,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import { CanvasCardRenderer } from "./CanvasCards";
import type { CanvasCard, DayGroup } from "../models/trip";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  getKanbanCanvasColumns,
  getMappedCards,
  getRouteDay,
  getRouteTimeSlot,
  groupRouteCardsByTimeOfDay,
  mapPositions,
  spreadMapMarkerPositions,
} from "../utils/tripWorkspaceViewHelpers";

export type WorkspaceView = "canvas" | "map";

export function WorkspaceViewSwitcher({
  value,
  onValueChange,
}: {
  value: WorkspaceView;
  onValueChange: (view: WorkspaceView) => void;
}) {
  const options: { value: WorkspaceView; label: string; icon: React.ReactNode }[] = [
    { value: "canvas", label: "Canvas", icon: <LayoutGrid className="size-3.5" /> },
    { value: "map", label: "Map", icon: <MapIcon className="size-3.5" /> },
  ];

  return (
    <div
      role="group"
      aria-label="Workspace view"
      className="pointer-events-auto inline-flex items-center gap-0.5 rounded-xl border border-border bg-muted p-1 text-muted-foreground shadow-sm"
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <Button
            key={option.value}
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`${option.label} view`}
            aria-pressed={isActive}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "h-auto gap-1 rounded-lg border border-transparent px-2 py-1.5 text-xs shadow-none md:gap-1.5 md:px-3",
              isActive
                ? "bg-card font-semibold text-foreground shadow-sm"
                : "font-medium text-muted-foreground hover:text-foreground",
            )}
          >
            <span className={cn(isActive ? "text-primary" : "text-muted-foreground")}>{option.icon}</span>
            <span className="hidden md:inline">{option.label}</span>
          </Button>
        );
      })}
    </div>
  );
}

export function TripCanvasKanbanView({
  days,
  cards,
  activeDay,
  selectedCard,
  isLinkingActive,
  linkingOriginId,
  zoom,
  isMobile = false,
  onActiveDayChange,
  onSelectCard,
  onCreateCard,
  onOpenMap,
}: {
  days: DayGroup[];
  cards: CanvasCard[];
  activeDay: number | null;
  selectedCard: CanvasCard | null;
  isLinkingActive: boolean;
  linkingOriginId: string | null;
  zoom: number;
  isMobile?: boolean;
  onActiveDayChange: (day: number | null) => void;
  onSelectCard: (card: CanvasCard) => void;
  onCreateCard: () => void;
  onOpenMap: () => void;
}) {
  const columns = useMemo(() => getKanbanCanvasColumns(days, cards), [cards, days]);
  const locatedCardCount = useMemo(() => getMappedCards(cards).length, [cards]);
  const displayColumns = useMemo(() => {
    if (isMobile && activeDay !== null) {
      return columns.filter((column) => column.day === activeDay);
    }
    return columns;
  }, [activeDay, columns, isMobile]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#f5f3ef]">
      <div
        className={cn(
          "absolute inset-x-0 bottom-[calc(7rem+env(safe-area-inset-bottom))] md:bottom-14 md:top-14",
          isMobile && activeDay !== null && "top-0 overflow-x-hidden overflow-y-auto",
          isMobile && activeDay === null && "top-0 snap-x snap-mandatory scroll-pl-4 overflow-x-auto overflow-y-hidden",
          !isMobile && "top-14 overflow-x-auto overflow-y-hidden",
        )}
      >
        <div
          className={cn(
            "flex h-full min-w-max origin-top-left gap-3 p-3 pb-6 transition-[zoom] md:px-10 md:py-4",
            isMobile && activeDay === null && "[&>section]:snap-center",
            isMobile && activeDay !== null && "h-auto min-h-full w-full min-w-0 flex-col",
          )}
          style={{ zoom }}
        >
          {displayColumns.map((column) => {
            const isActive = activeDay === column.day;
            const isDimmed = activeDay !== null && !isActive;
            const cardLabel = column.cards.length === 1 ? "card" : "cards";

            return (
              <section
                key={column.day}
                className={cn(
                  "flex shrink-0 flex-col gap-2.5 rounded-xl border border-[#e7e3dc] bg-[#fefcf8] p-2.5 transition",
                  isMobile && activeDay === null && "w-[calc(100vw-2rem)] snap-center sm:w-[255px]",
                  isMobile && activeDay !== null && "w-full max-w-none",
                  !isMobile && "w-[255px]",
                  isDimmed && "opacity-40",
                )}
                aria-label={column.label}
              >
                <button
                  type="button"
                  className="flex flex-col gap-2 text-left"
                  onClick={() => onActiveDayChange(isActive ? null : column.day)}
                >
                  <span className="flex items-start gap-1.5">
                    <span className="mt-1 size-2 shrink-0 rounded-full" style={{ backgroundColor: column.color }} />
                    <span className="line-clamp-2 text-xs leading-snug font-semibold text-stone-800">{column.label}</span>
                  </span>
                  <span className="text-[11px] font-medium text-stone-400">
                    {column.cards.length} {cardLabel}
                  </span>
                </button>

                <div
                  className={cn(
                    "flex flex-col gap-2.5",
                    isMobile && activeDay !== null
                      ? "overflow-visible"
                      : "scrollbar-thin max-h-[calc(100vh-260px)] overflow-y-auto md:max-h-[696px]",
                  )}
                >
                  {column.cards.map((card) => (
                    <div
                      key={card.id}
                      role="button"
                      tabIndex={0}
                      className={cn(
                        "rounded-xl transition",
                        selectedCard?.id === card.id && "ring-4 ring-primary/10",
                        isLinkingActive && linkingOriginId !== card.id && "hover:ring-4 hover:ring-amber-500/25",
                      )}
                      onClick={() => onSelectCard(card)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onSelectCard(card);
                        }
                      }}
                    >
                      <CanvasCardRenderer card={card} embedded />
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onCreateCard}
                    className="h-auto w-full justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300/70 bg-transparent py-3 text-xs text-muted-foreground hover:border-stone-400 hover:bg-transparent hover:text-foreground"
                  >
                    <Plus className="size-3.5" />
                    Add card
                  </Button>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <div className="hidden md:block">
        <KanbanMiniMap locatedCardCount={locatedCardCount} onOpenMap={onOpenMap} />
      </div>
    </div>
  );
}

function KanbanMiniMap({
  locatedCardCount,
  onOpenMap,
}: {
  locatedCardCount: number;
  onOpenMap: () => void;
}) {
  return (
    <Card className="absolute bottom-5 right-5 z-20 h-[152px] w-[224px] overflow-hidden rounded-[14px] border-[#e7e3dc] bg-[#f2efe9] p-0 shadow-xl">
      <div className="absolute -left-6 top-[84px] h-[72px] w-24 rounded-full bg-emerald-200/70" />
      <div className="absolute -top-5 right-[-26px] h-16 w-24 rounded-full bg-emerald-200/70" />
      <div className="absolute left-[118px] top-[-22px] h-[210px] w-3 rotate-12 rounded-full bg-sky-200/90" />
      <div className="absolute left-[-4px] top-[54px] h-1 w-[232px] -rotate-3 rounded-full bg-background" />
      <div className="absolute left-[70px] top-[-4px] h-40 w-0.5 bg-background" />

      {miniMapPins.map((pin) => (
        <span
          key={`${pin.x}-${pin.y}-${pin.color}`}
          className="absolute size-2.5 rounded-full border-2 border-background shadow-sm"
          style={{ left: pin.x, top: pin.y, backgroundColor: pin.color }}
        />
      ))}

      <div className="absolute inset-x-0 bottom-0 flex h-[30px] items-center justify-between border-t border-border bg-card/90 px-2.5 text-[11px]">
        <span className="truncate text-muted-foreground">{locatedCardCount} places pinned</span>
        <button type="button" className="flex items-center gap-1 font-medium text-foreground" onClick={onOpenMap}>
          <Route className="size-3" />
          Open map
        </button>
      </div>
    </Card>
  );
}

const miniMapPins = [
  { x: 96, y: 56, color: "#f59e0b" },
  { x: 150, y: 98, color: "#f97316" },
  { x: 128, y: 80, color: "#f97316" },
  { x: 20, y: 66, color: "#10b981" },
  { x: 34, y: 84, color: "#10b981" },
  { x: 168, y: 64, color: "#f43f5e" },
];

export function TripMapView({
  days,
  cards,
  activeDay,
  selectedCard,
  onSelectCard,
}: {
  days: DayGroup[];
  cards: CanvasCard[];
  activeDay: number | null;
  selectedCard: CanvasCard | null;
  onSelectCard: (card: CanvasCard) => void;
}) {
  const mappedCards = useMemo(() => getMappedCards(cards), [cards]);
  const isOverview = activeDay === null;
  const displayPositions = useMemo(
    () => (isOverview ? spreadMapMarkerPositions(mappedCards) : null),
    [isOverview, mappedCards],
  );
  const routeDay = getRouteDay(activeDay);
  const routeCards =
    routeDay === null
      ? mappedCards.map(({ card }) => card)
      : mappedCards.filter(({ card }) => card.day === routeDay).map(({ card }) => card);
  const routePositions =
    routeDay === null
      ? mappedCards.map(({ position }) => position)
      : mappedCards.filter(({ card }) => card.day === routeDay).map(({ position }) => position);
  const visibleRoute = routePositions.length > 1 ? routePositions : mappedCards.map(({ position }) => position);

  return (
    <div className="absolute inset-0 overflow-hidden bg-muted">
      <MapContainer
        center={[35.006, 135.76]}
        zoom={13}
        scrollWheelZoom
        className="h-full w-full wayfarer-osm-map"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewportController
          positions={visibleRoute.length > 0 ? visibleRoute : mappedCards.map(({ position }) => position)}
          selectedPosition={selectedCard ? mapPositions[selectedCard.id] : undefined}
        />
        {routeDay !== null && routePositions.length > 1 && (
          <Polyline positions={routePositions} pathOptions={{ color: "#2563eb", weight: 4, opacity: 0.72 }} />
        )}
        <MapControlButtons />
        {mappedCards.map(({ card, position }) => {
          const isSelected = selectedCard?.id === card.id;
          const isDimmed = activeDay !== null && card.day !== activeDay && card.day !== 0;
          const routeIndex = routeCards.findIndex((routeCard) => routeCard.id === card.id);
          const sequence = routeIndex >= 0 ? routeIndex + 1 : undefined;
          const markerPosition = displayPositions?.get(card.id) ?? position;
          return (
            <Marker
              key={card.id}
              position={markerPosition}
              icon={createRouteStopMarkerIcon(card, sequence, isSelected, isDimmed, isOverview)}
              eventHandlers={{ click: () => onSelectCard(card) }}
            >
              <Popup>
                <div className="min-w-40">
                  <p className="font-semibold">{card.title}</p>
                  {card.subtitle && <p className="mt-1 text-xs text-neutral-600">{card.subtitle}</p>}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <RoutePanelShell>
        <RoutePanel
          activeDay={activeDay}
          day={routeDay === null ? undefined : days.find((item) => item.day === routeDay)}
          cards={routeCards}
          onSelectCard={onSelectCard}
          selectedCard={selectedCard}
        />
      </RoutePanelShell>
    </div>
  );
}

function RoutePanelShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[500] h-36 bg-gradient-to-t from-black/10 to-transparent md:hidden" />
      <Card className="absolute bottom-0 left-0 right-0 z-[500] flex max-h-[42vh] flex-col rounded-t-[28px] border-border bg-card p-0 shadow-2xl md:bottom-8 md:left-auto md:right-8 md:max-h-[512px] md:w-[min(480px,calc(100vw-4rem))] md:rounded-[24px] md:p-6">
        <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-border md:hidden" />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 pt-3 md:p-0 md:pt-0">{children}</div>
      </Card>
    </>
  );
}

function RoutePanel({
  activeDay,
  day,
  cards,
  selectedCard,
  onSelectCard,
}: {
  activeDay: number | null;
  day?: DayGroup;
  cards: CanvasCard[];
  selectedCard: CanvasCard | null;
  onSelectCard: (card: CanvasCard) => void;
}) {
  const sections = useMemo(() => groupRouteCardsByTimeOfDay(cards), [cards]);
  const cardIndexById = useMemo(
    () => new Map(cards.map((card, index) => [card.id, index])),
    [cards],
  );
  const isOverview = activeDay === null;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex shrink-0 flex-col gap-3">
        <div className="min-w-0 flex-1 pr-2">
          <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
            {isOverview ? "All days" : `Day ${day?.day ?? activeDay}`}
          </p>
          <h2 className="mt-1 text-xl font-semibold leading-tight text-foreground md:text-2xl">
            {isOverview ? "Map overview" : (day?.label ?? "Kyoto route")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isOverview
              ? "Browse every pinned place. Select a day above to focus its route."
              : "Optimized sequence across nearby places, with the active day pinned on the map."}
          </p>
        </div>
        <Button
          className="h-10 w-full rounded-xl bg-black px-4 text-white hover:bg-black/90"
          aria-label="Open route in maps"
        >
          <Route className="size-4" />
          Open route
        </Button>
      </div>

      <div className="hidden min-h-0 flex-1 flex-col gap-4 overflow-y-auto md:flex">
        {sections.map((section) => (
          <section key={section.label} className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold text-muted-foreground">{section.label}</h3>
            <div className="flex flex-col gap-2">
              {section.cards.map((card) => (
                <RouteActivityCard
                  key={card.id}
                  card={card}
                  index={cardIndexById.get(card.id) ?? 0}
                  selected={selectedCard?.id === card.id}
                  onSelect={() => onSelectCard(card)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
        {cards.map((card, index) => (
          <RouteActivityCard
            key={card.id}
            card={card}
            index={index}
            selected={selectedCard?.id === card.id}
            onSelect={() => onSelectCard(card)}
            compact
          />
        ))}
      </div>
    </div>
  );
}

function RouteActivityCard({
  card,
  index,
  selected,
  onSelect,
  compact = false,
}: {
  card: CanvasCard;
  index: number;
  selected: boolean;
  onSelect: () => void;
  compact?: boolean;
}) {
  const ratingLabel = getRouteCardRating(card);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 rounded-2xl bg-[#f5f5f5] p-2 text-left transition",
        compact ? "w-[220px] shrink-0 snap-center" : "w-full",
        selected && "ring-2 ring-primary",
      )}
    >
      <div className="relative size-[52px] shrink-0 overflow-hidden rounded-2xl bg-background md:size-[60px]">
        {card.image ? (
          <img src={card.image} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-lg text-muted-foreground">
            {card.type === "flight" ? "✈️" : "📍"}
          </div>
        )}
        <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-black text-[10px] font-semibold text-white">
          {index + 1}
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-normal text-muted-foreground">
          {getRouteTimeSlot(index)}
        </p>
        <p className="mt-1 line-clamp-2 text-sm font-semibold text-foreground">{card.title}</p>
        {!compact && ratingLabel && (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            {ratingLabel}
          </p>
        )}
        {card.subtitle && (
          <p className={cn("line-clamp-1 text-xs text-muted-foreground", compact ? "mt-1" : "mt-1")}>
            {card.subtitle}
          </p>
        )}
      </div>
    </button>
  );
}

function getRouteCardRating(card: CanvasCard) {
  return card.rating ? card.rating.toFixed(1) : null;
}

function MapControlButtons() {
  const map = useMap();
  return (
    <div className="absolute bottom-[calc(42vh+1rem)] left-4 z-[500] flex flex-col rounded-xl border border-border bg-card p-1 shadow-sm md:bottom-auto md:left-3 md:top-14">
      <Button variant="ghost" size="icon-sm" className="size-8" onClick={() => map.zoomIn()} aria-label="Zoom map in">
        <ZoomIn className="size-4" />
      </Button>
      <div className="mx-1 h-px bg-border" />
      <Button variant="ghost" size="icon-sm" className="size-8" onClick={() => map.zoomOut()} aria-label="Zoom map out">
        <ZoomOut className="size-4" />
      </Button>
      <div className="mx-1 h-px bg-border" />
      <Button variant="ghost" size="icon-sm" className="size-8" onClick={() => map.setView([35.006, 135.76], 13)} aria-label="Recenter map">
        <Maximize2 className="size-4" />
      </Button>
    </div>
  );
}

function MapViewportController({
  positions,
  selectedPosition,
}: {
  positions: LatLngExpression[];
  selectedPosition?: LatLngExpression;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedPosition) {
      map.flyTo(selectedPosition, 15, { duration: 0.45 });
      return;
    }
    if (positions.length > 1) {
      map.fitBounds(positions as LatLngBoundsExpression, { padding: [72, 28], maxZoom: 14 });
    }
  }, [map, positions, selectedPosition]);

  return null;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function createRouteStopMarkerIcon(
  card: CanvasCard,
  sequence: number | undefined,
  selected: boolean,
  dimmed: boolean,
  compact = false,
) {
  const title = escapeHtml(card.title);
  const thumb = card.image
    ? `<img src="${escapeHtml(card.image)}" alt="" class="wayfarer-route-marker__image" />`
    : `<span class="wayfarer-route-marker__fallback">${card.type === "flight" ? "✈️" : "📍"}</span>`;
  const badge = sequence ? `<span class="wayfarer-route-marker__badge">${sequence}</span>` : "";

  if (compact) {
    return L.divIcon({
      className: "wayfarer-route-marker",
      html: `<div class="wayfarer-route-marker__chip wayfarer-route-marker__chip--compact${selected ? " is-selected" : ""}${dimmed ? " is-dimmed" : ""}"><span class="wayfarer-route-marker__thumb">${thumb}${badge}</span></div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -22],
    });
  }

  return L.divIcon({
    className: "wayfarer-route-marker",
    html: `<div class="wayfarer-route-marker__chip${selected ? " is-selected" : ""}${dimmed ? " is-dimmed" : ""}"><span class="wayfarer-route-marker__thumb">${thumb}${badge}</span><span class="wayfarer-route-marker__label">${title}</span></div>`,
    iconSize: [132, 40],
    iconAnchor: [66, 20],
    popupAnchor: [0, -22],
  });
}
