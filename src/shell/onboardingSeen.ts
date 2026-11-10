const KEY = "canto.onboarding.visto";

export function onboardingSeen(): boolean {
  return localStorage.getItem(KEY) === "1";
}

export function markOnboardingSeen(): void {
  localStorage.setItem(KEY, "1");
}
