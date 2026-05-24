import { useState, useCallback } from 'react';
import type { CanvasCard } from '../models/trip';
import mapboxgl from 'mapbox-gl';

// Pure Math/Physics Helpers for Testability
export function clampZoom(zoom: number): number {
  return Math.min(Math.max(zoom, 0.4), 2.0);
}

export function screenToCanvas(screenCoord: number, panOffset: number, zoom: number): number {
  return (screenCoord - panOffset) / zoom;
}

export function calculateCardPosition(canvasMouse: number, dragOffset: number): number {
  return canvasMouse - dragOffset;
}

interface UseSpatialViewportProps {
  cards: CanvasCard[];
  onUpdateCardPosition: (id: string, x: number, y: number) => void;
  isLinkingActive?: boolean;
  onCancelLinking?: () => void;
  variant?: string;
  map?: mapboxgl.Map | null;
  canvasRef?: React.RefObject<HTMLDivElement | null>;
}

export function useSpatialViewport({
  cards,
  onUpdateCardPosition,
  isLinkingActive = false,
  onCancelLinking,
  variant,
  map,
  canvasRef,
}: UseSpatialViewportProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    if (variant === 'D' && map && canvasRef?.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const localX = clientX - rect.left;
      const localY = clientY - rect.top;
      const lngLat = map.unproject([localX, localY]);
      const x = ((lngLat.lng - 135.63) / 0.19) * 1200;
      const y = ((35.04 - lngLat.lat) / 0.10) * 900;
      return { x, y };
    }
    return {
      x: screenToCanvas(clientX, pan.x, zoom),
      y: screenToCanvas(clientY, pan.y, zoom),
    };
  }, [variant, map, pan, zoom, canvasRef]);

  const handleCardMouseDown = useCallback((cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    const coords = getCanvasCoords(e.clientX, e.clientY);

    setDraggingCardId(cardId);
    setDragOffset({
      x: coords.x - card.x,
      y: coords.y - card.y,
    });
  }, [cards, getCanvasCoords]);

  const handleCardTouchStart = useCallback((cardId: string, e: React.TouchEvent) => {
    e.stopPropagation();
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    const touch = e.touches[0];
    if (!touch) return;

    const coords = getCanvasCoords(touch.clientX, touch.clientY);

    setDraggingCardId(cardId);
    setDragOffset({
      x: coords.x - card.x,
      y: coords.y - card.y,
    });
  }, [cards, getCanvasCoords]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.canvas-item')) return;
    if (isLinkingActive) {
      if (onCancelLinking) onCancelLinking();
      return;
    }
    if (variant === 'D') return; // Let Mapbox GL handle background panning natively!
    setIsDraggingCanvas(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan, isLinkingActive, onCancelLinking, variant]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.canvas-item')) return;
    if (isLinkingActive) {
      if (onCancelLinking) onCancelLinking();
      return;
    }
    if (variant === 'D') return; // Let Mapbox GL handle background panning natively!
    const touch = e.touches[0];
    if (!touch) return;
    setIsDraggingCanvas(true);
    setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
  }, [pan, isLinkingActive, onCancelLinking, variant]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggingCardId) {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      const newX = calculateCardPosition(coords.x, dragOffset.x);
      const newY = calculateCardPosition(coords.y, dragOffset.y);

      onUpdateCardPosition(draggingCardId, newX, newY);
      return;
    }

    if (!isDraggingCanvas) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [isDraggingCanvas, draggingCardId, dragOffset, dragStart, onUpdateCardPosition, getCanvasCoords]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    if (draggingCardId) {
      if (e.cancelable) e.preventDefault();
      const coords = getCanvasCoords(touch.clientX, touch.clientY);
      const newX = calculateCardPosition(coords.x, dragOffset.x);
      const newY = calculateCardPosition(coords.y, dragOffset.y);

      onUpdateCardPosition(draggingCardId, newX, newY);
      return;
    }

    if (!isDraggingCanvas) return;
    if (e.cancelable) e.preventDefault();
    setPan({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y });
  }, [isDraggingCanvas, draggingCardId, dragOffset, dragStart, onUpdateCardPosition, getCanvasCoords]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingCanvas(false);
    setDraggingCardId(null);
  }, []);

  const handleZoom = useCallback((dir: 'in' | 'out') => {
    setZoom(z => clampZoom(dir === 'in' ? z + 0.1 : z - 0.1));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  return {
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
  };
}

