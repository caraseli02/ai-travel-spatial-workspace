import { useState, useCallback } from 'react';
import type { CanvasCard } from '../data/tripData';

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
}

export function useSpatialViewport({
  cards,
  onUpdateCardPosition,
  isLinkingActive = false,
  onCancelLinking,
}: UseSpatialViewportProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleCardMouseDown = useCallback((cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    const canvasMouseX = screenToCanvas(e.clientX, pan.x, zoom);
    const canvasMouseY = screenToCanvas(e.clientY, pan.y, zoom);

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

    const canvasMouseX = screenToCanvas(touch.clientX, pan.x, zoom);
    const canvasMouseY = screenToCanvas(touch.clientY, pan.y, zoom);

    setDraggingCardId(cardId);
    setDragOffset({
      x: canvasMouseX - card.x,
      y: canvasMouseY - card.y,
    });
  }, [cards, pan, zoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.canvas-item')) return;
    if (isLinkingActive) {
      if (onCancelLinking) onCancelLinking();
      return;
    }
    setIsDraggingCanvas(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan, isLinkingActive, onCancelLinking]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.canvas-item')) return;
    if (isLinkingActive) {
      if (onCancelLinking) onCancelLinking();
      return;
    }
    const touch = e.touches[0];
    if (!touch) return;
    setIsDraggingCanvas(true);
    setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
  }, [pan, isLinkingActive, onCancelLinking]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggingCardId) {
      const canvasMouseX = screenToCanvas(e.clientX, pan.x, zoom);
      const canvasMouseY = screenToCanvas(e.clientY, pan.y, zoom);

      const newX = calculateCardPosition(canvasMouseX, dragOffset.x);
      const newY = calculateCardPosition(canvasMouseY, dragOffset.y);

      onUpdateCardPosition(draggingCardId, newX, newY);
      return;
    }

    if (!isDraggingCanvas) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [isDraggingCanvas, draggingCardId, dragOffset, pan, zoom, dragStart, onUpdateCardPosition]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    if (draggingCardId) {
      if (e.cancelable) e.preventDefault();
      const canvasMouseX = screenToCanvas(touch.clientX, pan.x, zoom);
      const canvasMouseY = screenToCanvas(touch.clientY, pan.y, zoom);

      const newX = calculateCardPosition(canvasMouseX, dragOffset.x);
      const newY = calculateCardPosition(canvasMouseY, dragOffset.y);

      onUpdateCardPosition(draggingCardId, newX, newY);
      return;
    }

    if (!isDraggingCanvas) return;
    if (e.cancelable) e.preventDefault();
    setPan({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y });
  }, [isDraggingCanvas, draggingCardId, dragOffset, pan, zoom, dragStart, onUpdateCardPosition]);

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
