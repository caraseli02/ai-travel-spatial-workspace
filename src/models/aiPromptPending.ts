const AI_PENDING_PREFIX = "wayfarer_ai_pending_";

function pendingKey(tripId: string): string {
  return `${AI_PENDING_PREFIX}${tripId}`;
}

export function markAiPromptPending(tripId: string, query: string): void {
  sessionStorage.setItem(
    pendingKey(tripId),
    JSON.stringify({ query, startedAt: Date.now() }),
  );
}

export function clearAiPromptPending(tripId: string): void {
  sessionStorage.removeItem(pendingKey(tripId));
}

/** Returns true when a reload interrupted an in-flight AI prompt for this trip. */
export function consumeAbandonedAiPrompt(tripId: string): boolean {
  const key = pendingKey(tripId);
  const raw = sessionStorage.getItem(key);
  if (!raw) return false;
  sessionStorage.removeItem(key);
  return true;
}
