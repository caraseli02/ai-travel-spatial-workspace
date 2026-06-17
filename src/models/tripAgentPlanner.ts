import type { AgentCitationReference, TripAgentContext } from './tripAgentContext';
import type { CanvasCard, InboxItem } from './trip';

export interface AgentPlannerCitation {
  ref: string;
  kind: AgentCitationReference['kind'];
  label: string;
}

export type AgentPlannerOutcome =
  | {
      type: 'reply';
      message: string;
      citations: AgentPlannerCitation[];
    }
  | {
      type: 'canvas-card-draft';
      draft: AgentCanvasCardDraft;
      rationale: string;
      citations: AgentPlannerCitation[];
    }
  | {
      type: 'inbox-item-draft';
      draft: AgentInboxItemDraft;
      rationale: string;
      citations: AgentPlannerCitation[];
    }
  | {
      type: 'follow-up-question';
      question: string;
      reason: string;
      citations: AgentPlannerCitation[];
    };

export interface AgentCanvasCardDraft {
  type: CanvasCard['type'];
  title: string;
  subtitle?: string;
  day?: number;
  details?: string[];
}

export interface AgentInboxItemDraft {
  type: InboxItem['type'];
  source: string;
  content: string;
  sourceUrl?: string;
}

export interface AgentPlanner {
  plan(context: TripAgentContext, query: string): AgentPlannerOutcome;
}

export const mockAgentPlanner: AgentPlanner = {
  plan: planWithMockAgent,
};

export function planWithMockAgent(
  context: TripAgentContext,
  query: string,
): AgentPlannerOutcome {
  const captureDraft = buildInboxDraftFromQuery(query);
  if (captureDraft) {
    return {
      type: 'inbox-item-draft',
      draft: captureDraft,
      rationale: 'Captured as Trip Material for the traveler to organize later.',
      citations: [],
    };
  }

  const dayMatch = query.match(/\bday\s+(\d+)\b/i);
  if (dayMatch) {
    const day = Number(dayMatch[1]);
    const dayCards = context.canvasCards.filter((card) => card.day === day);
    if (dayCards.length > 0) {
      return {
        type: 'reply',
        message: `Day ${day} already has ${formatList(dayCards.map((card) => card.title))}.`,
        citations: dayCards.map((card) => ({
          ref: card.citationRef,
          kind: 'canvas-card',
          label: card.title,
        })),
      };
    }
  }

  if (asksForResearchSupport(query)) {
    const support = findCitationSupport(context, query);
    if (support.citations.length > 0) {
      return {
        type: 'reply',
        message: `I found saved Trip Material related to ${formatList(support.displayTerms)}.`,
        citations: support.citations,
      };
    }
  }

  const matchingCard = context.canvasCards.find((card) =>
    hasSharedSearchTerm(query, `${card.title} ${card.subtitle ?? ''}`),
  );
  if (matchingCard) {
    return {
      type: 'reply',
      message: `${matchingCard.title} is already on the Spatial Canvas.`,
      citations: [
        {
          ref: matchingCard.citationRef,
          kind: 'canvas-card',
          label: matchingCard.title,
        },
      ],
    };
  }

  const matchingInboxItem = context.inboxItems.find((item) =>
    hasSharedSearchTerm(query, `${item.content} ${item.rawContent ?? ''}`),
  );
  if (matchingInboxItem) {
    return {
      type: 'canvas-card-draft',
      draft: {
        type: draftTypeForInboxItem(matchingInboxItem.type),
        title: matchingInboxItem.content,
        subtitle: `From ${matchingInboxItem.sourceLabel}`,
        details: ['Review source material before promoting this draft to the Spatial Canvas.'],
      },
      rationale: 'Found matching Trip Material in the Inbox.',
      citations: [
        {
          ref: matchingInboxItem.citationRef,
          kind: 'inbox-item',
          label: matchingInboxItem.sourceLabel,
        },
      ],
    };
  }

  if (context.inboxItems.length === 0 && context.canvasCards.length === 0) {
    return {
      type: 'follow-up-question',
      question: 'What saved Trip Material should I use for this suggestion?',
      reason: 'The Trip has no Inbox Items or Canvas Cards to ground this AI Prompt.',
      citations: [],
    };
  }

  return {
    type: 'reply',
    message: `I can help plan ${context.trip.name}.`,
    citations: [],
  };
}

function asksForResearchSupport(query: string): boolean {
  const lower = query.toLowerCase();
  return (
    lower.includes('research') ||
    lower.includes('support') ||
    lower.includes('source') ||
    lower.includes('cite')
  );
}

function findCitationSupport(
  context: TripAgentContext,
  query: string,
): { citations: AgentPlannerCitation[]; displayTerms: string[] } {
  const queryTerms = toSearchTerms(query);
  const displayTerms = toDisplayTerms(query);
  const citations: AgentPlannerCitation[] = [];

  for (const item of context.inboxItems) {
    if (sharesAnyTerm(queryTerms, `${item.content} ${item.rawContent}`)) {
      citations.push({
        ref: item.citationRef,
        kind: 'inbox-item',
        label: item.sourceLabel,
      });
    }
  }

  for (const card of context.canvasCards) {
    if (sharesAnyTerm(queryTerms, `${card.title} ${card.subtitle ?? ''}`)) {
      citations.push({
        ref: card.citationRef,
        kind: 'canvas-card',
        label: card.title,
      });
    }
  }

  return {
    citations,
    displayTerms,
  };
}

function buildInboxDraftFromQuery(query: string): AgentInboxItemDraft | undefined {
  const captureMatch = query.match(
    /^(save|capture|remember|add)\s+(?:note:\s*)?(?<content>.+)$/i,
  );
  const content = captureMatch?.groups?.content?.trim();
  if (!content) {
    return undefined;
  }

  return {
    type: 'note',
    source: 'AI Prompt draft',
    content,
  };
}

function draftTypeForInboxItem(
  type: TripAgentContext['inboxItems'][number]['type'],
): AgentCanvasCardDraft['type'] {
  if (type === 'hotel') {
    return 'hotel';
  }

  if (type === 'flight') {
    return 'flight';
  }

  if (type === 'link') {
    return 'article';
  }

  if (type === 'note') {
    return 'note';
  }

  return 'sticky';
}

function formatList(values: string[]): string {
  if (values.length <= 1) {
    return values[0] ?? '';
  }

  if (values.length === 2) {
    return `${values[0]} and ${values[1]}`;
  }

  return `${values.slice(0, -1).join(', ')}, and ${values.at(-1)}`;
}

function hasSharedSearchTerm(query: string, target: string): boolean {
  return sharesAnyTerm(toSearchTerms(query), target);
}

function sharesAnyTerm(queryTerms: string[], target: string): boolean {
  const targetTerms = new Set(toSearchTerms(target));
  return queryTerms.some((term) => targetTerms.has(term));
}

function toSearchTerms(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length >= 4 && !STOP_WORDS.has(term));
}

function toDisplayTerms(value: string): string[] {
  const seen = new Set<string>();
  return value
    .split(/[^A-Za-z0-9]+/)
    .filter((term) => term.length >= 4 && !STOP_WORDS.has(term.toLowerCase()))
    .filter((term) => {
      const lower = term.toLowerCase();
      if (seen.has(lower)) {
        return false;
      }
      seen.add(lower);
      return true;
    });
}

const STOP_WORDS = new Set([
  'about',
  'find',
  'from',
  'near',
  'plan',
  'research',
  'show',
  'suggest',
  'support',
  'supports',
  'this',
  'trip',
  'what',
  'with',
]);
