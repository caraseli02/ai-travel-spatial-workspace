import type { CanvasCard, Connection, DayGroup, DayLabel, InboxItem, Trip } from "@/models/trip";
import { buildTripAgentContext } from "@/models/tripAgentContext";
import { mockAgentPlanner, type AgentPlannerOutcome } from "@/models/tripAgentPlanner";
import type { TripWorkspaceState } from "@/models/tripWorkspaceTypes";

export function applyAiPromptToTripWorkspace({
  query,
  activeDay,
  days,
  dayLabels,
  cards,
  connections,
  items = [],
  trip,
  now = Date.now,
  random = Math.random,
  ...rest
}: TripWorkspaceState & {
  query: string;
  trip?: Trip;
  now?: () => number;
  random?: () => number;
}): TripWorkspaceState {
  const plannerTrip = buildPlannerTrip({
    trip,
    cards,
    connections,
    items,
    days,
    dayLabels,
  });
  const context = buildTripAgentContext(plannerTrip);
  const outcome = mockAgentPlanner.plan(context, query);

  return applyAgentPlannerOutcomeToTripWorkspace({
    outcome,
    query,
    activeDay,
    days,
    dayLabels,
    cards,
    connections,
    items,
    now,
    random,
    ...rest,
  });
}

function buildPlannerTrip({
  trip,
  cards,
  connections,
  items,
  days,
  dayLabels,
}: {
  trip?: Trip;
  cards: CanvasCard[];
  connections: Connection[];
  items: InboxItem[];
  days: DayGroup[];
  dayLabels: DayLabel[];
}): Trip {
  const now = new Date().toISOString();

  return {
    id: trip?.id ?? "current-trip",
    name: trip?.name ?? "Current Trip",
    destination: trip?.destination ?? "Current destination",
    emoji: trip?.emoji ?? "🧭",
    dates: trip?.dates,
    createdAt: trip?.createdAt ?? now,
    updatedAt: trip?.updatedAt ?? now,
    country: trip?.country,
    status: trip?.status,
    image: trip?.image,
    travelers: trip?.travelers,
    budget: trip?.budget,
    activities: trip?.activities,
    cards,
    connections,
    inboxItems: items,
    days,
    dayLabels,
  };
}

function applyAgentPlannerOutcomeToTripWorkspace({
  outcome,
  query,
  activeDay,
  days,
  dayLabels,
  cards,
  connections,
  items,
  now,
  random,
  ...rest
}: Omit<TripWorkspaceState, "isAiThinking"> & {
  outcome: AgentPlannerOutcome;
  query: string;
  now: () => number;
  random: () => number;
}): TripWorkspaceState {
  if (outcome.type === "inbox-item-draft") {
    return {
      ...rest,
      activeDay,
      days,
      dayLabels,
      cards,
      connections,
      items: [
        {
          id: `i_ai_draft_${now()}`,
          type: outcome.draft.type,
          source: outcome.draft.source,
          content: outcome.draft.content,
          sourceUrl: outcome.draft.sourceUrl,
          rawContent: buildPlannerDraftRawContent(outcome.rationale, outcome.citations),
          timestamp: "Just now",
          processed: false,
        },
        ...items,
      ],
      isAiThinking: false,
    };
  }

  if (outcome.type === "canvas-card-draft") {
    return {
      ...rest,
      activeDay,
      days,
      dayLabels,
      cards,
      connections,
      items: [
        {
          id: `i_ai_card_draft_${now()}`,
          type: inboxTypeForCanvasDraft(outcome.draft.type),
          source: "AI Planner Draft",
          content: formatCanvasDraftContent(outcome),
          rawContent: buildPlannerDraftRawContent(outcome.rationale, outcome.citations),
          timestamp: "Just now",
          processed: false,
        },
        ...items,
      ],
      isAiThinking: false,
    };
  }

  const requestedDay = extractRequestedDay(query);
  const responseDay =
    requestedDay && days.some((day) => day.day === requestedDay) ? requestedDay : activeDay || 0;
  const message = outcome.type === "reply" ? outcome.message : outcome.question;
  const responseCard: CanvasCard = {
    id: `c_ai_response_${now()}`,
    type: "note",
    x: 480 + (random() * 60 - 30),
    y: 350 + (random() * 60 - 30),
    rotation: random() * 4 - 2,
    title: outcome.type === "reply" ? "AI Planner Reply" : "AI Planner Follow-up",
    subtitle: message,
    tag: outcome.type === "reply" ? "AI reply" : "AI follow-up",
    tagColor: "slate",
    day: responseDay,
    details: formatPlannerCitations(outcome.citations),
    width: 240,
  };

  return {
    ...rest,
    activeDay:
      requestedDay && days.some((day) => day.day === requestedDay) ? requestedDay : activeDay,
    days,
    dayLabels,
    cards: [...cards, responseCard],
    connections,
    items,
    isAiThinking: false,
  };
}

function buildPlannerDraftRawContent(
  rationale: string,
  citations: AgentPlannerOutcome["citations"],
): string {
  const citationLabels = citations.map((citation) => citation.label);
  return [rationale, citationLabels.length > 0 ? `Citations: ${citationLabels.join(", ")}` : undefined]
    .filter(Boolean)
    .join("\n");
}

function formatCanvasDraftContent(
  outcome: Extract<AgentPlannerOutcome, { type: "canvas-card-draft" }>,
): string {
  return [
    `Draft Canvas Card: ${outcome.draft.title}`,
    outcome.draft.subtitle,
    outcome.draft.day ? `Day ${outcome.draft.day}` : undefined,
    ...(outcome.draft.details ?? []),
  ]
    .filter(Boolean)
    .join("\n");
}

function formatPlannerCitations(
  citations: AgentPlannerOutcome["citations"],
): string[] | undefined {
  if (citations.length === 0) {
    return undefined;
  }

  return [`Citations: ${citations.map((citation) => citation.label).join(", ")}`];
}

function inboxTypeForCanvasDraft(type: CanvasCard["type"]): InboxItem["type"] {
  if (type === "hotel" || type === "flight") {
    return type;
  }

  if (type === "article") {
    return "link";
  }

  return "note";
}

function extractRequestedDay(query: string): number | undefined {
  const dayMatch = query.match(/\bday\s+(\d+)\b/i);
  return dayMatch ? Number(dayMatch[1]) : undefined;
}
