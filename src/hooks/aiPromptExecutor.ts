export interface AiPromptExecutor {
  execute(complete: () => void): void;
}

export function createDelayedAiPromptExecutor(delayMs = 1200): AiPromptExecutor {
  return {
    execute: (complete) => {
      setTimeout(complete, delayMs);
    },
  };
}

export const delayedAiPromptExecutor = createDelayedAiPromptExecutor();
