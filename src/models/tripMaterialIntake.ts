import {
  extractSourceUrl,
  resolveInboxItemLabel,
} from "@/models/tripWorkspaceInbox";

export type TripMaterialKind = "link" | "note";

export interface InboxItemDraft {
  type: TripMaterialKind;
  source: string;
  content: string;
  rawContent: string;
  sourceUrl?: string;
}

export interface TripMaterialClassification {
  kind: TripMaterialKind;
  destinationHint?: string;
  inboxDraft: InboxItemDraft;
}

export function classifyTripMaterial(content: string): TripMaterialClassification {
  const trimmed = content.trim();
  const sourceUrl = extractSourceUrl(trimmed);
  const kind: TripMaterialKind = sourceUrl ? "link" : "note";

  return {
    kind,
    destinationHint: undefined,
    inboxDraft: {
      type: kind,
      source: resolveInboxItemLabel(trimmed, sourceUrl),
      content: trimmed,
      rawContent: trimmed,
      sourceUrl,
    },
  };
}
