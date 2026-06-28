const ONBOARDING_COMPLETED_KEY = "wayfarer_onboarding_completed";

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (err) {
    console.warn(`Failed to get item "${key}" from localStorage:`, err);
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`Failed to set item "${key}" in localStorage:`, err);
  }
}

export function getOnboardingCompleted(): boolean {
  return safeGetItem(ONBOARDING_COMPLETED_KEY) === "true";
}

export function setOnboardingCompleted(completed: boolean): void {
  safeSetItem(ONBOARDING_COMPLETED_KEY, completed ? "true" : "false");
}
