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
});
