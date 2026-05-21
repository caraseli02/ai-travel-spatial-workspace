import { describe, expect, it } from 'vitest';
import { canvasCards, connections, dayGroups, inboxItems } from '../data/tripData';
import {
  applyAiPromptToTripWorkspace,
  buildInboxItem,
  buildProcessedCanvasCard,
  dayLabelConfig,
  getCardCenter,
  canConnectCards,
  connectCards,
  tripWorkspaceReducer,
  type TripWorkspaceState,
} from './tripWorkspaceModel';

const zeroRandom = () => 0.5;
const fixedNow = () => 1_774_200_000_000;

describe('Trip Workspace model', () => {
  it('classifies new trip material into Inbox Items', () => {
    expect(buildInboxItem('ANA flight SFO-KIX JL69', fixedNow)).toMatchObject({
      id: 'i_spawn_1774200000000',
      type: 'flight',
      source: 'Flight Parser',
      content: 'ANA flight SFO-KIX JL69',
      timestamp: 'Just now',
      processed: false,
    });

    expect(buildInboxItem('Mom says: buy matcha kit-kats', fixedNow)).toMatchObject({
      type: 'whatsapp',
      source: 'WhatsApp Sync',
      avatar: '💬',
    });
  });

  it('turns a processed Inbox Item into a day-associated Canvas Card and dynamic connection', () => {
    const result = buildProcessedCanvasCard({
      item: inboxItems.find(item => item.id === 'i7')!,
      activeDay: null,
      dayLabels: dayLabelConfig,
      cards: canvasCards,
      now: fixedNow,
      random: zeroRandom,
    });

    expect(result.processedItem.processed).toBe(true);
    expect(result.newCard).toMatchObject({
      id: 'c_spawn_1774200000000',
      type: 'article',
      x: 218,
      y: 285,
      rotation: 0,
      title: 'Mizai Restaurant',
      subtitle: 'Michelin 3★ Kaiseki near Maruyama Park',
      tag: 'Day 4 · Fine Dining',
      tagColor: 'rose',
      day: 4,
      width: 250,
    });
    expect(result.connection).toEqual({
      from: 'c4',
      to: 'c_spawn_1774200000000',
      label: 'dynamic-link',
    });
  });

  it('applies the mocked Day 5 AI prompt without duplicating generated trip structure', () => {
    const firstResult = applyAiPromptToTripWorkspace({
      query: 'Plan Day 5',
      activeDay: null,
      days: dayGroups,
      dayLabels: dayLabelConfig,
      cards: canvasCards,
      connections,
      now: fixedNow,
      random: zeroRandom,
    });
    const secondResult = applyAiPromptToTripWorkspace({
      query: 'Plan Day 5',
      ...firstResult,
      now: fixedNow,
      random: zeroRandom,
    });

    expect(secondResult.activeDay).toBe(5);
    expect(secondResult.days.filter(day => day.day === 5)).toHaveLength(1);
    expect(secondResult.dayLabels.filter(label => label.day === 5)).toHaveLength(1);
    expect(secondResult.cards.filter(card => card.id === 'c15')).toHaveLength(1);
    expect(secondResult.connections.filter(conn => conn.from === 'c15' && conn.to === 'c14')).toEqual([
      { from: 'c15', to: 'c14', label: 'hiking to dining' },
    ]);
  });

  it('computes connection endpoints from Canvas Card dimensions', () => {
    expect(getCardCenter({ ...canvasCards[0], width: 300 })).toEqual({ x: 180, y: 162 });
    expect(getCardCenter(canvasCards[4])).toEqual({ x: 372.5, y: 350 });
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
      const initialState = {
        activeDay: null,
        days: dayGroups,
        dayLabels: dayLabelConfig,
        cards: canvasCards,
        connections: mockConnections,
      };

      const result = connectCards(initialState, 'c1', 'c3');
      expect(result.connections).toHaveLength(3);
      expect(result.connections[2]).toEqual({
        from: 'c1',
        to: 'c3',
        label: 'custom-link',
      });
    });

    it('connectCards does not duplicate an existing connection in state', () => {
      const initialState = {
        activeDay: null,
        days: dayGroups,
        dayLabels: dayLabelConfig,
        cards: canvasCards,
        connections: mockConnections,
      };

      const result = connectCards(initialState, 'c1', 'c2');
      expect(result.connections).toHaveLength(2); // no additions
    });
  });

  describe('tripWorkspaceReducer', () => {
    const createInitialState = (): TripWorkspaceState => ({
      activeDay: null,
      days: [],
      dayLabels: [],
      cards: [],
      connections: [],
      items: [],
      selectedCard: null,
      linkingFromId: null,
      isAiThinking: false,
      showCreateModal: false,
      createModalCoords: null,
      showAddDayModal: false,
      showOverflow: false,
    });

    it('can add raw items to the inbox list via ADD_INBOX_ITEM', () => {
      const state = createInitialState();
      const action = { type: 'ADD_INBOX_ITEM', content: 'ANA flight SFO-KIX' } as const;
      const newState = tripWorkspaceReducer(state, action);

      expect(newState.items).toHaveLength(1);
      expect(newState.items[0]).toMatchObject({
        type: 'flight',
        content: 'ANA flight SFO-KIX',
        processed: false,
      });
    });

    it('can process an inbox item via PROCESS_INBOX_ITEM', () => {
      const mockItem = {
        id: 'i7',
        type: 'article' as const,
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
      expect(newState.cards).toHaveLength(1);
      expect(newState.cards[0]).toMatchObject({
        type: 'article',
        title: 'Mizai Restaurant',
        tag: 'Day 4 · Fine Dining',
      });
    });

    it('can delete a card via DELETE_CARD and sweep dangling connections', () => {
      const mockCard1 = { id: 'c1', type: 'sticky' as const, x: 100, y: 100, day: 1, title: 'Card 1' };
      const mockCard2 = { id: 'c2', type: 'sticky' as const, x: 200, y: 200, day: 1, title: 'Card 2' };
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
      expect(newState.connections).toHaveLength(0); // connection swept
      expect(newState.selectedCard).toBeNull(); // selection cleared
    });

    it('can handle linking mode and establish manual connections via START/COMPLETE/CANCEL_LINKING', () => {
      const mockCard1 = { id: 'c1', type: 'sticky' as const, x: 100, y: 100, day: 1, title: 'Card 1' };
      const mockCard2 = { id: 'c2', type: 'sticky' as const, x: 200, y: 200, day: 1, title: 'Card 2' };
      const state: TripWorkspaceState = {
        ...createInitialState(),
        cards: [mockCard1, mockCard2],
        connections: [],
      };

      // 1. Start linking
      let nextState = tripWorkspaceReducer(state, { type: 'START_LINKING', id: 'c1' });
      expect(nextState.linkingFromId).toBe('c1');

      // 2. Cancel linking
      let cancelState = tripWorkspaceReducer(nextState, { type: 'CANCEL_LINKING' });
      expect(cancelState.linkingFromId).toBeNull();

      // 3. Complete linking
      nextState = tripWorkspaceReducer(nextState, { type: 'COMPLETE_LINKING', id: 'c2' });
      expect(nextState.connections).toHaveLength(1);
      expect(nextState.connections[0]).toMatchObject({ from: 'c1', to: 'c2', label: 'custom-link' });
      expect(nextState.linkingFromId).toBeNull(); // reset linking mode
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
      const mockCard = { id: 'c1', type: 'sticky' as const, x: 100, y: 100, day: 1, title: 'Original Title' };
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
      const state = {
        ...createInitialState(),
        days: [
          { day: 1, label: 'Day 1', color: 'blue' }
        ],
        isAiThinking: false,
      };

      // 1. Start AI thinking
      const thinkingState = tripWorkspaceReducer(state, { type: 'AI_PROMPT_START' });
      expect(thinkingState.isAiThinking).toBe(true);

      // 2. Complete AI thinking and apply the prompt
      const successState = tripWorkspaceReducer(thinkingState, { type: 'AI_PROMPT_SUCCESS', query: 'Plan Day 5' });
      expect(successState.isAiThinking).toBe(false);
      expect(successState.activeDay).toBe(5);
      expect(successState.days).toHaveLength(2); // Day 5 is added
    });

    it('can transition UI overlay states', () => {
      const state = createInitialState();

      // selectedCard
      const mockCard = { id: 'c1', type: 'sticky' as const, x: 100, y: 100, day: 1, title: 'Card 1' };
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
