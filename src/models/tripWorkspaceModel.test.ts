import { describe, expect, it } from 'vitest';
import { canvasCards, createDemoTrip, dayGroups } from '@/data/tripData';
import { createEmptyTrip, type CanvasCard } from '@/models/trip';
import {
  deleteCanvasCardFromWorkspace,
  dayLabelConfig,
  canConnectCards,
  connectCards,
  tripWorkspaceReducer,
  type TripWorkspaceState,
} from '@/models/tripWorkspaceModel';
import { resolveInboxItemDisplayState } from '@/models/tripMaterialMemory';

const createBaseWorkspaceState = (overrides: Partial<TripWorkspaceState> = {}): TripWorkspaceState => ({
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

const createStickyCard = (overrides: Partial<CanvasCard> = {}): CanvasCard => ({
  id: 'c1',
  type: 'sticky',
  x: 100,
  y: 100,
  rotation: 0,
  title: 'Card',
  ...overrides,
});

describe('Trip Workspace model', () => {
  it('deletes a source-backed Canvas Card without deleting its source Inbox Item memory', () => {
    const sourceItem = {
      id: 'i_source',
      type: 'link' as const,
      source: 'Web Parser',
      content: 'https://example.com/tea-house',
      timestamp: 'Just now',
      processed: true,
      resultingCardId: 'c_source',
    };
    const sourceBackedCard = {
      id: 'c_source',
      type: 'article' as const,
      x: 100,
      y: 100,
      rotation: 0,
      title: 'Tea house guide',
      promotedFromInboxId: 'i_source',
    };
    const remainingCard = {
      id: 'c_remaining',
      type: 'sticky' as const,
      x: 300,
      y: 100,
      rotation: 0,
      title: 'Book dinner',
    };
    const state: TripWorkspaceState = {
      activeDay: null,
      days: [],
      dayLabels: [],
      cards: [sourceBackedCard, remainingCard],
      connections: [
        { from: 'c_source', to: 'c_remaining', label: 'related' },
        { from: 'c_remaining', to: 'c_other', label: 'keep' },
      ],
      items: [sourceItem],
      selectedCard: sourceBackedCard,
      isAiThinking: false,
      showCreateModal: false,
      createModalCoords: null,
      showAddDayModal: false,
      showOverflow: false,
    };

    const nextState = deleteCanvasCardFromWorkspace(state, 'c_source');

    expect(nextState.cards).toEqual([remainingCard]);
    expect(nextState.connections).toEqual([{ from: 'c_remaining', to: 'c_other', label: 'keep' }]);
    expect(
      nextState.items,
      'Deleting a source-backed Canvas Card also dropped its source Inbox Item. deleteCanvasCardFromWorkspace in src/models/tripWorkspaceModel.ts must preserve Trip Material memory so the item becomes "previously-organized" rather than disappearing.',
    ).toEqual([sourceItem]);
    expect(nextState.selectedCard).toBeNull();
    expect(resolveInboxItemDisplayState(nextState.items[0], nextState.cards)).toEqual({
      kind: 'previously-organized',
      label: 'Previously organized',
      description: 'The linked Canvas Card is no longer on the Spatial Canvas.',
    });
  });

  describe('Connection validation and creation', () => {
    const mockConnections = [
      { from: 'c1', to: 'c2', label: 'custom-link' },
      { from: 'c2', to: 'c3', label: 'custom-link' },
    ];

    it('canConnectCards identifies valid connections', () => {
      // Normal valid link between two unconnected cards
      expect(canConnectCards(mockConnections, 'c1', 'c3')).toBe(true);
      expect(canConnectCards(mockConnections, 'c3', 'c4')).toBe(true);

      // Self connection is invalid
      expect(canConnectCards(mockConnections, 'c1', 'c1')).toBe(false);

      // Duplicate connection is invalid (same direction)
      expect(canConnectCards(mockConnections, 'c1', 'c2')).toBe(false);

      // Duplicate connection is invalid (reverse direction)
      expect(canConnectCards(mockConnections, 'c2', 'c1')).toBe(false);
    });

    it('connectCards adds a valid connection to state', () => {
      const initialState = createBaseWorkspaceState({
        activeDay: null,
        days: dayGroups,
        dayLabels: dayLabelConfig,
        cards: canvasCards,
        connections: mockConnections,
      });

      const result = connectCards(initialState, 'c1', 'c3');
      expect(result.connections).toHaveLength(3);
      expect(result.connections[2]).toEqual({
        from: 'c1',
        to: 'c3',
        label: 'custom-link',
      });
    });

    it('connectCards does not duplicate an existing connection in state', () => {
      const initialState = createBaseWorkspaceState({
        activeDay: null,
        days: dayGroups,
        dayLabels: dayLabelConfig,
        cards: canvasCards,
        connections: mockConnections,
      });

      const result = connectCards(initialState, 'c1', 'c2');
      expect(result.connections).toHaveLength(2); // no additions
    });
  });

  describe('tripWorkspaceReducer', () => {
    const createInitialState = (): TripWorkspaceState => createBaseWorkspaceState();

    it('can add raw items to the inbox list via ADD_INBOX_ITEM', () => {
      const state = createInitialState();
      const action = { type: 'ADD_INBOX_ITEM', content: 'ANA flight SFO-KIX' } as const;
      const newState = tripWorkspaceReducer(state, action);

      expect(newState.items).toHaveLength(1);
      expect(newState.items[0]).toMatchObject({
        type: 'note',
        content: 'ANA flight SFO-KIX',
        rawContent: 'ANA flight SFO-KIX',
        processed: false,
      });
    });

    it('can process an inbox item via PROCESS_INBOX_ITEM', () => {
      const mockItem = {
        id: 'i7',
        type: 'link' as const,
        source: 'Web Parser',
        content: 'Mizai Restaurant',
        timestamp: 'Just now',
        processed: false,
      };
      const state: TripWorkspaceState = {
        ...createInitialState(),
        items: [mockItem],
        dayLabels: dayLabelConfig,
        cards: [],
      };

      const newState = tripWorkspaceReducer(state, { type: 'PROCESS_INBOX_ITEM', id: 'i7' });

      expect(newState.items[0].processed).toBe(true);
      expect(newState.items[0].resultingCardId).toBe(newState.cards[0].id);
      expect(newState.cards).toHaveLength(1);
      expect(newState.cards[0]).toMatchObject({
        type: 'article',
        promotedFromInboxId: 'i7',
        title: 'Mizai Restaurant',
        tag: 'Day 4 · Fine Dining',
      });
    });

    it('preserves source relationship when updating a promoted Canvas Card', () => {
      const promotedCard = createStickyCard({
        id: 'c1',
        x: 100,
        y: 100,
        day: 1,
        title: 'Original Title',
        promotedFromInboxId: 'i1',
      });
      const state = {
        ...createInitialState(),
        cards: [promotedCard],
        selectedCard: promotedCard,
      };

      const editedCard = { ...promotedCard, title: 'Updated Title', promotedFromInboxId: undefined };
      const nextState = tripWorkspaceReducer(state, { type: 'UPDATE_CARD', card: editedCard });

      expect(
        nextState.cards[0],
        'UPDATE_CARD let an edit erase promotedFromInboxId. The reducer in src/models/tripWorkspaceModel.ts must preserve the source relationship even when the incoming edited card omits it.',
      ).toMatchObject({
        title: 'Updated Title',
        promotedFromInboxId: 'i1',
      });
      expect(nextState.selectedCard).toMatchObject({
        title: 'Updated Title',
        promotedFromInboxId: 'i1',
      });
    });

    it('can delete a card via DELETE_CARD and sweep dangling connections', () => {
      const mockCard1 = createStickyCard({ id: 'c1', x: 100, y: 100, day: 1, title: 'Card 1' });
      const mockCard2 = createStickyCard({ id: 'c2', x: 200, y: 200, day: 1, title: 'Card 2' });
      const mockConnection = { from: 'c1', to: 'c2', label: 'custom-link' };
      const state: TripWorkspaceState = {
        ...createInitialState(),
        cards: [mockCard1, mockCard2],
        connections: [mockConnection],
        selectedCard: mockCard1,
      };

      const newState = tripWorkspaceReducer(state, { type: 'DELETE_CARD', id: 'c1' });

      expect(newState.cards).toHaveLength(1);
      expect(newState.cards[0].id).toBe('c2');
      expect(
        newState.connections,
        'DELETE_CARD left a dangling connection referencing the deleted card. The reducer in src/models/tripWorkspaceModel.ts must sweep every connection whose from/to is the deleted card id.',
      ).toHaveLength(0); // connection swept
      expect(newState.selectedCard).toBeNull(); // selection cleared
    });

    it('can establish manual connections via ADD_CONNECTION', () => {
      const mockCard1 = createStickyCard({ id: 'c1', x: 100, y: 100, day: 1, title: 'Card 1' });
      const mockCard2 = createStickyCard({ id: 'c2', x: 200, y: 200, day: 1, title: 'Card 2' });
      const state: TripWorkspaceState = {
        ...createInitialState(),
        cards: [mockCard1, mockCard2],
        connections: [],
      };

      const nextState = tripWorkspaceReducer(state, { type: 'ADD_CONNECTION', fromId: 'c1', toId: 'c2' });
      expect(nextState.connections).toHaveLength(1);
      expect(nextState.connections[0]).toMatchObject({ from: 'c1', to: 'c2', label: 'custom-link' });
    });

    it('can add a custom day group and position a new day label via ADD_CUSTOM_DAY', () => {
      const state = {
        ...createInitialState(),
        days: [
          { day: 1, label: 'Day 1 — Arrival', color: '#8b5cf6' }
        ],
        dayLabels: [
          { day: 1, x: 38, y: 46, color: '#8b5cf6', bg: '#8b5cf612', border: '#8b5cf630' }
        ],
        showAddDayModal: true,
      };

      const action = { type: 'ADD_CUSTOM_DAY', dayNum: 2, label: 'Arashiyama' } as const;
      const newState = tripWorkspaceReducer(state, action);

      expect(newState.days).toHaveLength(2);
      expect(newState.days[1]).toMatchObject({
        day: 2,
        label: 'Day 2 — Arashiyama',
      });
      expect(newState.dayLabels).toHaveLength(2);
      expect(newState.dayLabels[1].day).toBe(2);
      expect(newState.showAddDayModal).toBe(false);

      // Verify idempotency (should not add duplicate day)
      const duplicateAction = { type: 'ADD_CUSTOM_DAY', dayNum: 2, label: 'Arashiyama Again' } as const;
      const idempotentState = tripWorkspaceReducer(newState, duplicateAction);
      expect(idempotentState.days).toHaveLength(2);
    });

    it('can update card details and position via UPDATE_CARD and UPDATE_CARD_POSITION', () => {
      const mockCard = createStickyCard({ id: 'c1', x: 100, y: 100, day: 1, title: 'Original Title' });
      const state = {
        ...createInitialState(),
        cards: [mockCard],
        selectedCard: mockCard,
      };

      // 1. Test UPDATE_CARD
      const updatedCard = { ...mockCard, title: 'Updated Title', x: 150 };
      const updateState = tripWorkspaceReducer(state, { type: 'UPDATE_CARD', card: updatedCard });
      expect(updateState.cards[0].title).toBe('Updated Title');
      expect(updateState.cards[0].x).toBe(150);
      expect(updateState.selectedCard?.title).toBe('Updated Title');
      expect(updateState.selectedCard?.x).toBe(150);

      // 2. Test UPDATE_CARD_POSITION
      const positionState = tripWorkspaceReducer(state, { type: 'UPDATE_CARD_POSITION', id: 'c1', x: 300, y: 400 });
      expect(positionState.cards[0].x).toBe(300);
      expect(positionState.cards[0].y).toBe(400);
      expect(positionState.selectedCard?.x).toBe(300);
      expect(positionState.selectedCard?.y).toBe(400);
    });

    it('can transition AI prompt states via AI_PROMPT_START and AI_PROMPT_SUCCESS', () => {
      const mockItem = {
        id: 'i7',
        type: 'link' as const,
        source: 'Web Parser',
        content: 'Mizai Restaurant',
        timestamp: 'Just now',
        processed: false,
      };
      const state = {
        ...createInitialState(),
        days: [
          { day: 1, label: 'Day 1', color: 'blue' }
        ],
        items: [mockItem],
        showOverflow: true,
        isAiThinking: false,
      };

      // 1. Start AI thinking
      const thinkingState = tripWorkspaceReducer(state, { type: 'AI_PROMPT_START' });
      expect(thinkingState.isAiThinking).toBe(true);
      expect(thinkingState.items).toEqual([mockItem]);

      // 2. Complete AI thinking and apply the prompt
      const successState = tripWorkspaceReducer(thinkingState, { type: 'AI_PROMPT_SUCCESS', query: 'Plan Day 5' });
      expect(successState.isAiThinking).toBe(false);
      expect(successState.activeDay).toBe(null);
      expect(successState.days).toHaveLength(1);
      expect(successState.cards).toEqual([
        expect.objectContaining({
          type: 'note',
          title: 'AI Planner Reply',
          subtitle: 'I can help plan Current Trip.',
        }),
      ]);
      expect(successState.items).toEqual([mockItem]); // Items are preserved
      expect(successState.showOverflow).toBe(true); // Other fields are preserved
    });

    it('routes non-demo AI prompts through grounded planner outcomes instead of Kyoto-specific card mutations', () => {
      const trip = createEmptyTrip('Barcelona Weekend', 'Barcelona, Spain', '🇪🇸');
      const state = {
        ...createInitialState(),
        showOverflow: true,
        isAiThinking: true,
      };

      const successState = tripWorkspaceReducer(state, {
        type: 'AI_PROMPT_SUCCESS',
        query: 'Find a restaurant near Gion',
        trip,
      });

      expect(successState.isAiThinking).toBe(false);
      expect(successState.showOverflow).toBe(true);
      expect(successState.cards).toEqual([
        expect.objectContaining({
          type: 'note',
          title: 'AI Planner Follow-up',
          subtitle: 'What saved Trip Material should I use for this suggestion?',
        }),
      ]);
      expect(successState.cards.some(card => card.title === 'Gion Sasaki')).toBe(false);
      expect(successState.connections).toEqual([]);
    });

    it('captures Demo Trip restaurant suggestions as cited planner drafts instead of final Canvas Cards', () => {
      const trip = createDemoTrip();
      const state: TripWorkspaceState = {
        ...createInitialState(),
        days: trip.days,
        dayLabels: trip.dayLabels,
        cards: trip.cards,
        connections: trip.connections,
        items: trip.inboxItems,
        isAiThinking: true,
      };

      const successState = tripWorkspaceReducer(state, {
        type: 'AI_PROMPT_SUCCESS',
        query: 'Find a restaurant near Gion',
        trip,
      });

      expect(successState.isAiThinking).toBe(false);
      expect(successState.cards.some(card => card.id === 'c17' || card.title === 'Gion Sasaki')).toBe(false);
      expect(successState.items[0]).toMatchObject({
        type: 'link',
        source: 'AI Planner Draft',
        content: expect.stringContaining('Draft Canvas Card: Gion Sasaki'),
        rawContent: 'Suggested from saved Trip Material near Gion.\nCitations: Eater Japan, Gion at Dusk',
        processed: false,
      });
      expect(successState.items.slice(1)).toEqual(trip.inboxItems);
    });

    it('captures Demo Trip ryokan suggestions as planner drafts for the traveler to organize', () => {
      const trip = createDemoTrip();
      const state: TripWorkspaceState = {
        ...createInitialState(),
        days: trip.days,
        dayLabels: trip.dayLabels,
        cards: trip.cards,
        connections: trip.connections,
        items: trip.inboxItems,
        isAiThinking: true,
      };

      const successState = tripWorkspaceReducer(state, {
        type: 'AI_PROMPT_SUCCESS',
        query: 'Suggest a ryokan in Arashiyama',
        trip,
      });

      expect(successState.isAiThinking).toBe(false);
      expect(successState.cards.some(card => card.id === 'c16' || card.title === 'Hoshinoya Kyoto')).toBe(false);
      expect(successState.items[0]).toMatchObject({
        type: 'hotel',
        source: 'AI Planner Draft',
        content: expect.stringContaining('Draft Canvas Card: Hoshinoya Kyoto'),
        rawContent: 'Suggested from saved Arashiyama and stay context.\nCitations: Hiiragiya Ryokan, Arashiyama Bamboo',
        processed: false,
      });
      expect(successState.items.slice(1)).toEqual(trip.inboxItems);
    });

    it('can transition UI overlay states', () => {
      const state = createInitialState();

      // selectedCard
      const mockCard = createStickyCard({ id: 'c1', x: 100, y: 100, day: 1, title: 'Card 1' });
      let newState = tripWorkspaceReducer(state, { type: 'SET_SELECTED_CARD', card: mockCard });
      expect(newState.selectedCard).toEqual(mockCard);

      // createModal
      newState = tripWorkspaceReducer(newState, { type: 'OPEN_CREATE_MODAL', coords: { x: 50, y: 60 } });
      expect(newState.showCreateModal).toBe(true);
      expect(newState.createModalCoords).toEqual({ x: 50, y: 60 });

      newState = tripWorkspaceReducer(newState, { type: 'CLOSE_CREATE_MODAL' });
      expect(newState.showCreateModal).toBe(false);
      expect(newState.createModalCoords).toBeNull();

      // addDayModal
      newState = tripWorkspaceReducer(newState, { type: 'OPEN_ADD_DAY_MODAL' });
      expect(newState.showAddDayModal).toBe(true);

      newState = tripWorkspaceReducer(newState, { type: 'CLOSE_ADD_DAY_MODAL' });
      expect(newState.showAddDayModal).toBe(false);

      // toggleOverflow
      newState = tripWorkspaceReducer(newState, { type: 'TOGGLE_OVERFLOW' });
      expect(newState.showOverflow).toBe(true);

      newState = tripWorkspaceReducer(newState, { type: 'TOGGLE_OVERFLOW', show: false });
      expect(newState.showOverflow).toBe(false);
    });
  });
});
