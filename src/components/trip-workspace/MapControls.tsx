import { useEffect } from "react";
import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";
import { Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import { useMap } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MapControlButtons({ sheetExpanded = false }: { sheetExpanded?: boolean }) {
  const map = useMap();
  return (
    <div
      className={cn(
        "absolute left-4 z-[500] flex flex-col rounded-xl border border-border bg-card p-1 shadow-sm md:bottom-auto md:left-3 md:top-14",
        sheetExpanded ? "bottom-[calc(42vh+1rem)]" : "bottom-[192px]",
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="size-11 md:size-8"
        onClick={() => map.zoomIn()}
        aria-label="Zoom map in"
      >
        <ZoomIn className="size-5 md:size-4" />
      </Button>
      <div className="mx-1 h-px bg-border" />
      <Button
        variant="ghost"
        size="icon"
        className="size-11 md:size-8"
        onClick={() => map.zoomOut()}
        aria-label="Zoom map out"
      >
        <ZoomOut className="size-5 md:size-4" />
      </Button>
      <div className="mx-1 h-px bg-border" />
      <Button
        variant="ghost"
        size="icon"
        className="size-11 md:size-8"
        onClick={() => map.setView([35.006, 135.76], 13)}
        aria-label="Recenter map"
      >
        <Maximize2 className="size-5 md:size-4" />
      </Button>
    </div>
  );
}

export function MapViewportController({
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
