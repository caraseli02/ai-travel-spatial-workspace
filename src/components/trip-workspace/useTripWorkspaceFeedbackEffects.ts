import { useEffect, type MutableRefObject, type Dispatch, type SetStateAction } from "react";
import type { CanvasCard, InboxItem } from "../../models/trip";
import {
  buildAiCanvasReplyFeedback,
  buildAiPlannerInboxDraftFeedback,
  buildOrganizedInboxItemFeedback,
} from "./workspaceFeedbackMessages";
import { resolveAiPromptOutcome } from "./resolveAiPromptOutcome";
import type { WorkspaceFeedback } from "./WorkspaceActionFeedback";

interface TripWorkspaceFeedbackEffectsOptions {
  pendingOrganizedItemId: string | null;
  setPendingOrganizedItemId: (id: string | null) => void;
  pendingAiPrompt: boolean;
  setPendingAiPrompt: (pending: boolean) => void;
  isAiThinking: boolean;
  items: InboxItem[];
  cards: CanvasCard[];
  aiPromptSnapshotRef: MutableRefObject<{
    itemIds: Set<string>;
    cardIds: Set<string>;
  } | null>;
  setSelectedCard: (card: CanvasCard | null) => void;
  setWorkspaceFeedback: (feedback: WorkspaceFeedback | null) => void;
  setInboxOpen: Dispatch<SetStateAction<boolean>>;
}

export function useTripWorkspaceFeedbackEffects({
  pendingOrganizedItemId,
  setPendingOrganizedItemId,
  pendingAiPrompt,
  setPendingAiPrompt,
  isAiThinking,
  items,
  cards,
  aiPromptSnapshotRef,
  setSelectedCard,
  setWorkspaceFeedback,
  setInboxOpen,
}: TripWorkspaceFeedbackEffectsOptions) {
  useEffect(() => {
    if (!pendingOrganizedItemId) return;

    const organizedItem = items.find((item) => item.id === pendingOrganizedItemId && item.resultingCardId);
    const resultingCard = organizedItem
      ? cards.find((card) => card.id === organizedItem.resultingCardId)
      : undefined;

    if (!organizedItem || !resultingCard) return;

    setSelectedCard(resultingCard);
    setWorkspaceFeedback(
      buildOrganizedInboxItemFeedback({
        source: organizedItem.source,
        cardTitle: resultingCard.title,
        day: resultingCard.day,
      }),
    );
    setPendingOrganizedItemId(null);
  }, [cards, items, pendingOrganizedItemId, setPendingOrganizedItemId, setSelectedCard, setWorkspaceFeedback]);

  useEffect(() => {
    if (!pendingAiPrompt || isAiThinking || !aiPromptSnapshotRef.current) return;

    const snapshot = aiPromptSnapshotRef.current;
    const outcome = resolveAiPromptOutcome({
      previousItemIds: snapshot.itemIds,
      previousCardIds: snapshot.cardIds,
      items,
      cards,
    });

    if (!outcome) return;

    if (outcome.kind === "inbox-draft") {
      setWorkspaceFeedback(buildAiPlannerInboxDraftFeedback({ draftLabel: outcome.draftLabel }));
      setInboxOpen(true);
    } else {
      const newCard = cards.find((card) => !snapshot.cardIds.has(card.id));
      if (newCard) {
        setSelectedCard(newCard);
      }
      setWorkspaceFeedback(buildAiCanvasReplyFeedback({ cardTitle: outcome.cardTitle }));
    }

    setPendingAiPrompt(false);
    aiPromptSnapshotRef.current = null;
  }, [
    pendingAiPrompt,
    isAiThinking,
    items,
    cards,
    setInboxOpen,
    setSelectedCard,
    setPendingAiPrompt,
    setWorkspaceFeedback,
    aiPromptSnapshotRef,
  ]);
}
