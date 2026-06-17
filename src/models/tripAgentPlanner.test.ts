import { describe, expect, it } from 'vitest';
import { createDemoTrip } from '../data/tripData';
import { createEmptyTrip } from './trip';
import { buildTripAgentContext } from './tripAgentContext';
import { planWithMockAgent } from './tripAgentPlanner';

describe('mock agent planner', () => {
  it('returns a cited typed reply for a Demo Trip AI Prompt without mutating context', () => {
    const trip = createDemoTrip();
    const context = buildTripAgentContext(trip);
    const before = JSON.stringify(context);

    const outcome = planWithMockAgent(context, 'Plan Day 5');

    expect(outcome).toMatchObject({
      type: 'reply',
      message: expect.stringContaining('Day 5'),
      citations: [
        {
          ref: 'card:c14',
          kind: 'canvas-card',
          label: 'Kikunoi Honten',
        },
      ],
    });
    expect(JSON.stringify(context)).toBe(before);
  });

  it('suggests a Canvas Card draft for a non-demo Trip from matching Trip Material', () => {
    const trip = {
      ...createEmptyTrip('Barcelona Weekend', 'Barcelona, Spain', '🇪🇸'),
      inboxItems: [
        {
          id: 'i_tapas',
          type: 'link' as const,
          source: 'Eater Barcelona',
          content: 'Cal Pep tapas restaurant near the Gothic Quarter',
          rawContent: 'https://example.com/cal-pep Cal Pep tapas restaurant near the Gothic Quarter',
          sourceUrl: 'https://example.com/cal-pep',
          timestamp: 'Today',
          processed: false,
        },
      ],
    };

    const outcome = planWithMockAgent(
      buildTripAgentContext(trip),
      'Find a restaurant near the Gothic Quarter',
    );

    expect(outcome).toEqual({
      type: 'canvas-card-draft',
      draft: {
        type: 'article',
        title: 'Cal Pep tapas restaurant near the Gothic Quarter',
        subtitle: 'From Eater Barcelona',
        details: ['Review source material before promoting this draft to the Spatial Canvas.'],
      },
      rationale: 'Found matching Trip Material in the Inbox.',
      citations: [
        {
          ref: 'inbox:i_tapas',
          kind: 'inbox-item',
          label: 'Eater Barcelona',
        },
      ],
    });
  });

  it('suggests an Inbox Item draft for capture-oriented AI Prompts', () => {
    const trip = createEmptyTrip('Barcelona Weekend', 'Barcelona, Spain', '🇪🇸');

    const outcome = planWithMockAgent(
      buildTripAgentContext(trip),
      'Save note: Book Sagrada Familia tickets when May dates open',
    );

    expect(outcome).toEqual({
      type: 'inbox-item-draft',
      draft: {
        type: 'note',
        source: 'AI Prompt draft',
        content: 'Book Sagrada Familia tickets when May dates open',
      },
      rationale: 'Captured as Trip Material for the traveler to organize later.',
      citations: [],
    });
  });

  it('asks a follow-up question when the Trip context is insufficient', () => {
    const trip = createEmptyTrip('Oslo Winter', 'Oslo, Norway', '🇳🇴');

    const outcome = planWithMockAgent(buildTripAgentContext(trip), 'Suggest a ryokan');

    expect(outcome).toEqual({
      type: 'follow-up-question',
      question: 'What saved Trip Material should I use for this suggestion?',
      reason: 'The Trip has no Inbox Items or Canvas Cards to ground this AI Prompt.',
      citations: [],
    });
  });

  it('returns a cited duplicate reply when a similar Canvas Card already exists', () => {
    const trip = {
      ...createEmptyTrip('Paris Spring', 'Paris, France', '🇫🇷'),
      cards: [
        {
          id: 'c_cafe',
          type: 'sticky' as const,
          x: 10,
          y: 20,
          rotation: 0,
          title: 'Cafe de Flore',
          subtitle: 'Saint-Germain breakfast idea',
        },
      ],
    };

    const outcome = planWithMockAgent(
      buildTripAgentContext(trip),
      'Suggest Cafe de Flore for breakfast',
    );

    expect(outcome).toEqual({
      type: 'reply',
      message: 'Cafe de Flore is already on the Spatial Canvas.',
      citations: [
        {
          ref: 'card:c_cafe',
          kind: 'canvas-card',
          label: 'Cafe de Flore',
        },
      ],
    });
  });

  it('answers research-support prompts with Inbox Item and Canvas Card citations', () => {
    const trip = {
      ...createEmptyTrip('Kyoto Research', 'Kyoto, Japan', '🇯🇵'),
      inboxItems: [
        {
          id: 'i_dinner',
          type: 'link' as const,
          source: 'Eater Japan',
          content: 'Nakamura-ro is a classic dinner near Yasaka Shrine',
          timestamp: 'Today',
          processed: false,
        },
      ],
      cards: [
        {
          id: 'c_gion',
          type: 'polaroid' as const,
          x: 20,
          y: 30,
          rotation: 0,
          title: 'Gion at Dusk',
          subtitle: 'Traditional machiya district near Yasaka Shrine',
        },
      ],
    };

    const outcome = planWithMockAgent(
      buildTripAgentContext(trip),
      'What research supports dinner near Yasaka Shrine?',
    );

    expect(outcome).toEqual({
      type: 'reply',
      message: 'I found saved Trip Material related to dinner, Yasaka, and Shrine.',
      citations: [
        {
          ref: 'inbox:i_dinner',
          kind: 'inbox-item',
          label: 'Eater Japan',
        },
        {
          ref: 'card:c_gion',
          kind: 'canvas-card',
          label: 'Gion at Dusk',
        },
      ],
    });
  });
});
