export interface AiPromptExecutor {
  execute(complete: () => void): () => void;
}

export function createDelayedAiPromptExecutor(delayMs = 1200): AiPromptExecutor {
  return {
    execute: (complete) => {
      const timeoutId = setTimeout(complete, delayMs);
      return () => clearTimeout(timeoutId);
    },
  };
}

export const delayedAiPromptExecutor = createDelayedAiPromptExecutor();
