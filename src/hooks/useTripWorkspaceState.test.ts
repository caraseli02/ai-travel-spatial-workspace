// @vitest-environment happy-dom
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { createEmptyTrip, type CanvasCard } from '@/models/trip';
import type { TripWorkspaceState } from '@/models/tripWorkspaceModel';
import { useTripWorkspaceState } from '@/hooks/useTripWorkspaceState';

const createBaseState = (overrides: Partial<TripWorkspaceState> = {}): TripWorkspaceState => ({
  activeDay: null,
  days: [],
  dayLabels: [],
  cards: [],
  connections: [],
  items: [],
  selectedCard: null,
  isAiThinking: false,
  showCreateModal: false,
  createModalCoords: null,
  showAddDayModal: false,
  showOverflow: false,
  ...overrides,
});

const stickyCard = (overrides: Partial<CanvasCard> = {}): CanvasCard => ({
  id: 'c1',
  type: 'sticky',
  x: 100,
  y: 100,
  rotation: 0,
  title: 'Card',
  ...overrides,
});

describe('useTripWorkspaceState', () => {
  describe('inbox and card actions', () => {
    it('adds Trip Material to inbox items via addInboxItem', () => {
      const { result } = renderHook(() => useTripWorkspaceState(createBaseState()));

      act(() => {
        result.current.addInboxItem('Book a tea ceremony in Gion');
      });

      expect(result.current.state.items).toHaveLength(1);
      expect(result.current.state.items[0]).toEqual(
        expect.objectContaining({
          content: 'Book a tea ceremony in Gion',
          processed: false,
        }),
      );
    });

    it('removes a Canvas Card via deleteCard', () => {
      const card = stickyCard();
      const { result } = renderHook(() =>
        useTripWorkspaceState(createBaseState({ cards: [card], selectedCard: card })),
      );

      act(() => {
        result.current.deleteCard('c1');
      });

      expect(result.current.state.cards).toEqual([]);
      expect(result.current.state.selectedCard).toBeNull();
    });

    it('updates a Canvas Card via updateCard', () => {
      const card = stickyCard({ title: 'Original title' });
      const { result } = renderHook(() =>
        useTripWorkspaceState(createBaseState({ cards: [card] })),
      );

      act(() => {
        result.current.updateCard({ ...card, title: 'Updated title' });
      });

      expect(result.current.state.cards[0].title).toBe('Updated title');
    });
  });

  describe('AI prompt timing', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('ignores blank AI prompts', () => {
      const { result } = renderHook(() => useTripWorkspaceState(createBaseState()));

      act(() => {
        result.current.sendAiQuery('   ');
      });

      expect(result.current.state.isAiThinking).toBe(false);
      expect(vi.getTimerCount()).toBe(0);
    });

    it('enters thinking state immediately then completes after the planner delay', () => {
      const trip = createEmptyTrip('Barcelona Weekend', 'Barcelona, Spain', '🇪🇸');
      const { result } = renderHook(() => useTripWorkspaceState(createBaseState(), trip));

      act(() => {
        result.current.sendAiQuery('Find a restaurant near Gion');
      });

      expect(result.current.state.isAiThinking).toBe(true);
      expect(result.current.state.cards).toEqual([]);

      act(() => {
        vi.advanceTimersByTime(1200);
      });

      expect(result.current.state.isAiThinking).toBe(false);
      expect(result.current.state.cards).toEqual([
        expect.objectContaining({
          type: 'note',
          title: 'AI Planner Follow-up',
        }),
      ]);
    });
  });
});
