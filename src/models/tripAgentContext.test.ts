import { describe, expect, it } from 'vitest';
import { createDemoTrip } from '../data/tripData';
import { createEmptyTrip } from './trip';
import { buildTripAgentContext } from './tripAgentContext';

describe('Trip agent context builder', () => {
  it('builds a serializable context with Trip identity and destination metadata for an empty Trip', () => {
    const trip = createEmptyTrip('Lisbon Spring', 'Lisbon, Portugal', '🇵🇹', {
      start: '2026-04-01',
      end: '2026-04-07',
    });

    const context = buildTripAgentContext(trip);

    expect(context.trip).toEqual({
      id: trip.id,
      name: 'Lisbon Spring',
      destination: 'Lisbon, Portugal',
      emoji: '🇵🇹',
      dates: {
        start: '2026-04-01',
        end: '2026-04-07',
      },
    });
    expect(context.inboxItems).toEqual([]);
    expect(context.canvasCards).toEqual([]);
    expect(context.dayGroups).toEqual([]);
    expect(context.connections).toEqual([]);
    expect(JSON.parse(JSON.stringify(context))).toEqual(context);
  });

  it('summarizes Inbox Items with source and provenance fields for planner citations', () => {
    const trip = {
      ...createEmptyTrip('Kyoto Research', 'Kyoto, Japan', '🇯🇵'),
      inboxItems: [
        {
          id: 'i_guide',
          type: 'link' as const,
          source: 'Travel blog',
          content: 'Hidden temples near Kyoto station',
          rawContent: 'https://example.com/kyoto-guide Hidden temples near Kyoto station',
          sourceUrl: 'https://example.com/kyoto-guide',
          timestamp: 'Yesterday',
          processed: true,
          resultingCardId: 'c_guide',
        },
      ],
    };

    const context = buildTripAgentContext(trip);

    expect(context.inboxItems).toEqual([
      {
        id: 'i_guide',
        type: 'link',
        sourceLabel: 'Travel blog',
        content: 'Hidden temples near Kyoto station',
        rawContent: 'https://example.com/kyoto-guide Hidden temples near Kyoto station',
        sourceUrl: 'https://example.com/kyoto-guide',
        timestamp: 'Yesterday',
        processed: true,
        resultingCardId: 'c_guide',
        citationRef: 'inbox:i_guide',
      },
    ]);
  });

  it('summarizes Canvas Cards with Day Group labels and source references', () => {
    const trip = {
      ...createEmptyTrip('Kyoto Research', 'Kyoto, Japan', '🇯🇵'),
      days: [{ day: 2, label: 'Day 2 — Fushimi Inari + Gion', color: '#f97316' }],
      inboxItems: [
        {
          id: 'i_tip',
          type: 'whatsapp' as const,
          source: 'Yuki',
          content: 'Go to Fushimi Inari at 5am.',
          timestamp: '2 hours ago',
          processed: true,
          resultingCardId: 'c_tip',
        },
      ],
      cards: [
        {
          id: 'c_tip',
          type: 'sticky' as const,
          x: 275,
          y: 290,
          rotation: 1.5,
          title: 'Yuki says',
          subtitle: 'Go at 5am',
          day: 2,
          promotedFromInboxId: 'i_tip',
        },
        {
          id: 'c_manual',
          type: 'note' as const,
          x: 790,
          y: 72,
          rotation: -0.5,
          title: 'Pocket WiFi',
          subtitle: 'Pick up at KIX airport',
          day: 0,
        },
      ],
    };

    const context = buildTripAgentContext(trip);

    expect(context.canvasCards).toEqual([
      {
        id: 'c_tip',
        type: 'sticky',
        title: 'Yuki says',
        subtitle: 'Go at 5am',
        day: 2,
        dayGroupLabel: 'Day 2 — Fushimi Inari + Gion',
        source: {
          kind: 'source-backed',
          inboxItemId: 'i_tip',
          sourceType: 'whatsapp',
          sourceLabel: 'Yuki',
          rawContent: 'Go to Fushimi Inari at 5am.',
          resultingCardId: 'c_tip',
          citationRef: 'inbox:i_tip',
        },
        citationRef: 'card:c_tip',
      },
      {
        id: 'c_manual',
        type: 'note',
        title: 'Pocket WiFi',
        subtitle: 'Pick up at KIX airport',
        day: 0,
        source: {
          kind: 'manual',
        },
        citationRef: 'card:c_manual',
      },
    ]);
  });

  it('summarizes Day Groups and Connections with enough card context to reason about the Trip Workspace', () => {
    const trip = {
      ...createEmptyTrip('Kyoto Research', 'Kyoto, Japan', '🇯🇵'),
      days: [{ day: 3, label: 'Day 3 — Arashiyama', color: '#10b981' }],
      cards: [
        {
          id: 'c_bamboo',
          type: 'polaroid' as const,
          x: 30,
          y: 580,
          rotation: 1.8,
          title: 'Arashiyama Bamboo',
          day: 3,
        },
        {
          id: 'c_ryokan',
          type: 'hotel' as const,
          x: 290,
          y: 690,
          rotation: -1.2,
          title: 'Hoshinoya Kyoto',
          day: 3,
        },
      ],
      connections: [{ from: 'c_bamboo', to: 'c_ryokan', label: 'stay option' }],
    };

    const context = buildTripAgentContext(trip);

    expect(context.dayGroups).toEqual([
      {
        day: 3,
        label: 'Day 3 — Arashiyama',
        color: '#10b981',
        cardIds: ['c_bamboo', 'c_ryokan'],
      },
    ]);
    expect(context.connections).toEqual([
      {
        from: 'c_bamboo',
        to: 'c_ryokan',
        label: 'stay option',
        fromTitle: 'Arashiyama Bamboo',
        toTitle: 'Hoshinoya Kyoto',
      },
    ]);
  });

  it('covers the Demo Trip with citation references without mutating Trip state', () => {
    const trip = createDemoTrip();
    const before = JSON.stringify(trip);

    const context = buildTripAgentContext(trip);
    const yukiCard = context.canvasCards.find((card) => card.id === 'c5');

    expect(context.inboxItems).toHaveLength(trip.inboxItems.length);
    expect(context.canvasCards).toHaveLength(trip.cards.length);
    expect(yukiCard?.source).toMatchObject({
      kind: 'source-backed',
      inboxItemId: 'i1',
      sourceLabel: 'Yuki (local friend)',
      citationRef: 'inbox:i1',
    });
    expect(context.citationReferences).toEqual(
      expect.arrayContaining([
        {
          id: 'inbox:i1',
          kind: 'inbox-item',
          label: 'Yuki (local friend)',
        },
        {
          id: 'card:c5',
          kind: 'canvas-card',
          label: 'Yuki says:',
        },
      ]),
    );
    expect(JSON.stringify(trip)).toBe(before);
  });
});
