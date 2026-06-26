import type { CanvasCard, InboxItem } from '@/models/trip';

export type CardSourceMemory =
  | {
      kind: 'source-backed';
      sourceType: InboxItem['type'];
      sourceLabel: string;
      rawContent: string;
      sourceUrl?: string;
      inboxItemId: string;
      resultingCardId?: string;
    }
  | {
      kind: 'manual';
      title: 'Manual Canvas Card';
      description: string;
    };

export type InboxItemDisplayState =
  | {
      kind: 'unprocessed';
      label: 'Ready to organize';
    }
  | {
      kind: 'linked-card';
      label: 'Linked to Canvas Card';
      cardTitle: string;
      cardId: string;
    }
  | {
      kind: 'previously-organized';
      label: 'Previously organized';
      description: string;
    };

const urlPattern = /https?:\/\/[^\s"')]+/;

export function resolveCardSourceMemory(
  card: CanvasCard,
  inboxItems: InboxItem[],
): CardSourceMemory {
  if (!card.promotedFromInboxId) {
    return {
      kind: 'manual',
      title: 'Manual Canvas Card',
      description: 'Created directly in the Trip Workspace without a source Inbox Item.',
    };
  }

  const sourceItem = inboxItems.find((item) => item.id === card.promotedFromInboxId);
  if (!sourceItem) {
    return {
      kind: 'manual',
      title: 'Manual Canvas Card',
      description: 'Created directly in the Trip Workspace without a source Inbox Item.',
    };
  }

  return {
    kind: 'source-backed',
    sourceType: sourceItem.type,
    sourceLabel: sourceItem.source,
    rawContent: sourceItem.rawContent ?? sourceItem.content,
    sourceUrl: sourceItem.sourceUrl ?? sourceItem.content.match(urlPattern)?.[0],
    inboxItemId: sourceItem.id,
    resultingCardId: sourceItem.resultingCardId,
  };
}

export function resolveInboxItemDisplayState(
  item: InboxItem,
  cards: CanvasCard[],
): InboxItemDisplayState {
  if (!item.processed) {
    return {
      kind: 'unprocessed',
      label: 'Ready to organize',
    };
  }

  const linkedCard = item.resultingCardId
    ? cards.find((card) => card.id === item.resultingCardId)
    : undefined;

  if (linkedCard) {
    return {
      kind: 'linked-card',
      label: 'Linked to Canvas Card',
      cardTitle: linkedCard.title,
      cardId: linkedCard.id,
    };
  }

  return {
    kind: 'previously-organized',
    label: 'Previously organized',
    description: 'The linked Canvas Card is no longer on the Spatial Canvas.',
  };
}
