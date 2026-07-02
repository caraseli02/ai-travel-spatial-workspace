import L from "leaflet";
import type { CanvasCard } from "@/models/trip";
import { escapeHtml } from "./mapMarkerHtml";

export function createRouteStopMarkerIcon(
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
