import type { InboxItem } from "@/models/trip";

const urlPattern = /https?:\/\/[^\s"')]+/i;

export function extractSourceUrl(content: string): string | undefined {
  return content.match(urlPattern)?.[0];
}

export function extractSourceDomain(sourceUrl: string): string {
  try {
    return new URL(sourceUrl).hostname.replace(/^www\./, "");
  } catch {
    return sourceUrl;
  }
}

function truncateLabel(value: string, maxLength = 60): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength - 3)}...`;
}

export function resolveInboxItemLabel(content: string, sourceUrl?: string): string {
  if (!sourceUrl) {
    return truncateLabel(content.split("\n")[0] ?? content);
  }

  const travelerNote = content.replace(sourceUrl, "").trim();
  if (travelerNote) {
    return truncateLabel(travelerNote.split("\n")[0] ?? travelerNote);
  }

  return extractSourceDomain(sourceUrl);
}

export function formatInboxCaptureTime(capturedAtIso: string, now = Date.now()): string {
  const capturedMs = new Date(capturedAtIso).getTime();
  const diffMs = now - capturedMs;

  if (diffMs < 60_000) {
    return "Just now";
  }

  if (diffMs < 3_600_000) {
    const minutes = Math.floor(diffMs / 60_000);
    return `${minutes} min ago`;
  }

  const capturedDate = new Date(capturedAtIso);
  const nowDate = new Date(now);
  if (capturedDate.toDateString() === nowDate.toDateString()) {
    return `Today at ${capturedDate.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  }

  return capturedDate.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatInboxItemCaptureTime(item: InboxItem, now = Date.now()): string {
  if (item.capturedAt) {
    return formatInboxCaptureTime(item.capturedAt, now);
  }
  return item.timestamp;
}

export function buildInboxItem(content: string, now = Date.now): InboxItem {
  const trimmed = content.trim();
  const sourceUrl = extractSourceUrl(trimmed);
  const capturedAt = new Date(now()).toISOString();

  return {
    id: `i_spawn_${now()}`,
    type: sourceUrl ? "link" : "note",
    source: resolveInboxItemLabel(trimmed, sourceUrl),
    content: trimmed,
    rawContent: trimmed,
    sourceUrl,
    timestamp: formatInboxCaptureTime(capturedAt, now()),
    capturedAt,
    processed: false,
  };
}
