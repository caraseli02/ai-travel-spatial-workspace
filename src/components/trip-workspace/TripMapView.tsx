import { useMemo, useState } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import type { CanvasCard, DayGroup } from "@/models/trip";
import { cn } from "@/lib/utils";
import {
  getMappedCards,
  getRouteDay,
  mapPositions,
  spreadMapMarkerPositions,
} from "@/utils/tripWorkspaceViewHelpers";
import { MapControlButtons, MapViewportController } from "./MapControls";
import { createRouteStopMarkerIcon } from "./mapMarkerIcon";
import { RoutePanelOverlay } from "./RoutePanel";

export function TripMapView({
  days,
  cards,
  activeDay,
  selectedCard,
  onSelectCard,
  showRoutePanel = true,
  interactive = true,
}: {
  days: DayGroup[];
  cards: CanvasCard[];
  activeDay: number | null;
  selectedCard: CanvasCard | null;
  onSelectCard: (card: CanvasCard) => void;
  showRoutePanel?: boolean;
  interactive?: boolean;
}) {
  const [sheetExpanded, setSheetExpanded] = useState(false);
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
    <div
      className={cn(
        "absolute inset-0 overflow-hidden bg-muted",
        !interactive && "pointer-events-none",
      )}
    >
      <MapContainer
        center={[35.006, 135.76]}
        zoom={13}
        scrollWheelZoom={interactive}
        dragging={interactive}
        doubleClickZoom={interactive}
        touchZoom={interactive}
        boxZoom={interactive}
        keyboard={interactive}
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
        {interactive && <MapControlButtons sheetExpanded={sheetExpanded} />}
        {mappedCards.map(({ card, position }) => {
          const isSelected = interactive && selectedCard?.id === card.id;
          const isDimmed = activeDay !== null && card.day !== activeDay && card.day !== 0;
          const routeIndex = routeCards.findIndex((routeCard) => routeCard.id === card.id);
          const sequence = routeIndex >= 0 ? routeIndex + 1 : undefined;
          const markerPosition = displayPositions?.get(card.id) ?? position;
          return (
            <Marker
              key={card.id}
              position={markerPosition}
              icon={createRouteStopMarkerIcon(card, sequence, isSelected, isDimmed, isOverview)}
              interactive={interactive}
              eventHandlers={interactive ? { click: () => onSelectCard(card) } : undefined}
            >
              {interactive && (
                <Popup>
                  <div className="min-w-40">
                    <p className="font-semibold">{card.title}</p>
                    {card.subtitle && <p className="mt-1 text-xs text-neutral-600">{card.subtitle}</p>}
                  </div>
                </Popup>
              )}
            </Marker>
          );
        })}
      </MapContainer>

      {showRoutePanel && (
        <RoutePanelOverlay
          activeDay={activeDay}
          day={routeDay === null ? undefined : days.find((item) => item.day === routeDay)}
          cards={routeCards}
          onSelectCard={onSelectCard}
          selectedCard={selectedCard}
          onExpandedChange={setSheetExpanded}
        />
      )}
    </div>
  );
}
