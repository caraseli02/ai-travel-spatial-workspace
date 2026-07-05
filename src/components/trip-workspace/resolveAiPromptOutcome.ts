import type { CanvasCard, InboxItem } from "@/models/trip";

export type AiPromptOutcome =
  | {
      kind: "inbox-draft";
      draftLabel: string;
    }
  | {
      kind: "canvas-reply";
      cardTitle: string;
    };

export function resolveAiPromptOutcome({
  previousItemIds,
  previousCardIds,
  items,
  cards,
}: {
  previousItemIds: Set<string>;
  previousCardIds: Set<string>;
  items: InboxItem[];
  cards: Pick<CanvasCard, "id" | "title">[];
}): AiPromptOutcome | null {
  const newItems = items.filter((item) => !previousItemIds.has(item.id));
  const plannerDraft = newItems.find((item) => item.source === "AI Planner Draft");

  if (plannerDraft) {
    return {
      kind: "inbox-draft",
      draftLabel: extractPlannerDraftLabel(plannerDraft.content),
    };
  }

  const newCards = cards.filter((card) => !previousCardIds.has(card.id));
  const aiReplyCard = newCards.find((card) => card.id.startsWith("c_ai_response_"));

  if (aiReplyCard) {
    return {
      kind: "canvas-reply",
      cardTitle: aiReplyCard.title,
    };
  }

  return null;
}

function extractPlannerDraftLabel(content: string): string {
  const draftMatch = content.match(/Draft Canvas Card:\s*(.+)/);
  return draftMatch?.[1]?.split("\n")[0]?.trim() || content;
}
