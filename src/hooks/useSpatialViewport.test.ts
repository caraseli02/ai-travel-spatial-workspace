import { describe, expect, it, vi } from 'vitest';
import {
  clampZoom,
  screenToCanvas,
  calculateCardPosition
} from './useSpatialViewport';

describe('Spatial Viewport Physics', () => {
  it('clamps zoom scale between 0.4x and 2.0x via clampZoom', () => {
    expect(clampZoom(1.0)).toBe(1.0);
    expect(clampZoom(2.5)).toBe(2.0); // max clamp
    expect(clampZoom(0.2)).toBe(0.4); // min clamp
  });

  it('translates screen coordinates to canvas space under zoom and pan via screenToCanvas', () => {
    // Zoom: 1x, No Pan
    expect(screenToCanvas(150, 0, 1)).toBe(150);

    // Zoom: 2x, No Pan
    expect(screenToCanvas(150, 0, 2)).toBe(75);

    // Zoom: 1x, Pan: 50px
    expect(screenToCanvas(150, 50, 1)).toBe(100);

    // Zoom: 0.5x, Pan: 100px
    expect(screenToCanvas(150, 100, 0.5)).toBe(100);
  });

  it('calculates the final card position after dragging dragOffset via calculateCardPosition', () => {
    expect(calculateCardPosition(120, 20)).toBe(100);
  });
});
