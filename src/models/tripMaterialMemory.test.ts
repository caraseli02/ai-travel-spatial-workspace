import { describe, expect, it } from 'vitest';
import { createDemoTrip } from '@/data/tripData';
import type { CanvasCard, InboxItem } from '@/models/trip';
import {
  resolveCardSourceMemory,
  resolveInboxItemDisplayState,
} from '@/models/tripMaterialMemory';

describe('Trip Material memory display helpers', () => {
  it('resolves source memory for a source-backed Canvas Card with an original URL', () => {
    const item: InboxItem = {
      id: 'i_link',
      type: 'link',
      source: 'Travel blog',
      content: 'https://example.com/kyoto-guide Hidden temples near Kyoto station',
      timestamp: 'Just now',
      processed: true,
      resultingCardId: 'c_link',
    };
    const card: CanvasCard = {
      id: 'c_link',
      type: 'article',
      x: 0,
      y: 0,
      rotation: 0,
      title: 'Hidden temples',
      promotedFromInboxId: 'i_link',
    };

    expect(resolveCardSourceMemory(card, [item])).toEqual({
      kind: 'source-backed',
      sourceType: 'link',
      sourceLabel: 'Travel blog',
      rawContent: 'https://example.com/kyoto-guide Hidden temples near Kyoto station',
      sourceUrl: 'https://example.com/kyoto-guide',
      inboxItemId: 'i_link',
      resultingCardId: 'c_link',
    });
  });

  it('describes a Canvas Card without source memory as manually created', () => {
    const card: CanvasCard = {
      id: 'c_manual',
      type: 'sticky',
      x: 0,
      y: 0,
      rotation: 0,
      title: 'Book tea ceremony',
    };

    expect(resolveCardSourceMemory(card, [])).toEqual({
      kind: 'manual',
      title: 'Manual Canvas Card',
      description: 'Created directly in the Trip Workspace without a source Inbox Item.',
    });
  });

  it('describes whether Inbox Items are unprocessed, linked, or previously organized', () => {
    const card: CanvasCard = {
      id: 'c_linked',
      type: 'hotel',
      x: 0,
      y: 0,
      rotation: 0,
      title: 'Hiiragiya Ryokan',
    };
    const unprocessed: InboxItem = {
      id: 'i_new',
      type: 'note',
      source: 'My notes',
      content: 'Book tea ceremony',
      timestamp: 'Just now',
      processed: false,
    };
    const linked: InboxItem = {
      ...unprocessed,
      id: 'i_linked',
      processed: true,
      resultingCardId: 'c_linked',
    };
    const missingCard: InboxItem = {
      ...unprocessed,
      id: 'i_missing',
      processed: true,
      resultingCardId: 'c_missing',
    };

    expect(resolveInboxItemDisplayState(unprocessed, [card])).toEqual({
      kind: 'unprocessed',
      label: 'Ready to organize',
    });
    expect(resolveInboxItemDisplayState(linked, [card])).toEqual({
      kind: 'linked-card',
      label: 'Linked to Canvas Card',
      cardTitle: 'Hiiragiya Ryokan',
      cardId: 'c_linked',
    });
    expect(resolveInboxItemDisplayState(missingCard, [card])).toEqual({
      kind: 'previously-organized',
      label: 'Previously organized',
      description: 'The linked Canvas Card is no longer on the Spatial Canvas.',
    });
  });

  it('ships the Demo Trip with visible source-backed Canvas Card memory', () => {
    const demoTrip = createDemoTrip();
    const sourceBackedCards = demoTrip.cards.filter((card) => card.promotedFromInboxId);

    expect(
      sourceBackedCards.length,
      'The Demo Trip shipped with no source-backed Canvas Cards. createDemoTrip in src/data/tripData.ts must include cards with promotedFromInboxId so source memory is visible on first run.',
    ).toBeGreaterThan(0);
    expect(
      sourceBackedCards.every((card) =>
        demoTrip.inboxItems.some(
          (item) => item.id === card.promotedFromInboxId && item.resultingCardId === card.id,
        ),
      ),
      'A source-backed Demo Trip card points to a missing/mismatched Inbox Item. In src/data/tripData.ts each card.promotedFromInboxId must reference an inbox item whose resultingCardId points back to that card.',
    ).toBe(true);
  });
});
