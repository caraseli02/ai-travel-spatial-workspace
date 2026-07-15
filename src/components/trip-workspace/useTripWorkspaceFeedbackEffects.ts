import { useEffect, type Dispatch, type SetStateAction } from "react";
import type { AiPromptEffect } from "@/models/tripWorkspaceModel";
import type { CanvasCard, InboxItem } from "../../models/trip";
import {
  buildAiCanvasReplyFeedback,
  buildAiPlannerInboxDraftFeedback,
  buildOrganizedInboxItemFeedback,
} from "./workspaceFeedbackMessages";
import type { WorkspaceFeedback } from "./WorkspaceActionFeedback";

interface TripWorkspaceFeedbackEffectsOptions {
  pendingOrganizedItemId: string | null;
  setPendingOrganizedItemId: (id: string | null) => void;
  isAiThinking: boolean;
  aiPromptEffect: AiPromptEffect | null;
  clearAiPromptEffect: () => void;
  items: InboxItem[];
  cards: CanvasCard[];
  setSelectedCard: (card: CanvasCard | null) => void;
  setWorkspaceFeedback: (feedback: WorkspaceFeedback | null) => void;
  setInboxOpen: Dispatch<SetStateAction<boolean>>;
}

export function useTripWorkspaceFeedbackEffects({
  pendingOrganizedItemId,
  setPendingOrganizedItemId,
  isAiThinking,
  aiPromptEffect,
  clearAiPromptEffect,
  items,
  cards,
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
    if (isAiThinking || !aiPromptEffect) return;

    if (aiPromptEffect.kind === "inbox-draft") {
      setWorkspaceFeedback(buildAiPlannerInboxDraftFeedback({ draftLabel: aiPromptEffect.draftLabel }));
      setInboxOpen(true);
    } else {
      const newCard = cards.find((card) => card.id === aiPromptEffect.cardId);
      if (newCard) {
        setSelectedCard(newCard);
      }
      setWorkspaceFeedback(buildAiCanvasReplyFeedback({ cardTitle: aiPromptEffect.cardTitle }));
    }
    clearAiPromptEffect();
  }, [
    aiPromptEffect,
    isAiThinking,
    cards,
    setInboxOpen,
    setSelectedCard,
    clearAiPromptEffect,
    setWorkspaceFeedback,
  ]);
}
