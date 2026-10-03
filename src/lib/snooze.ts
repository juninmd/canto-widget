export const SNOOZE_OPTIONS = [1, 5, 10];
const DEFAULT_MINUTES = 10;
const KEY = "canto.snoozeMinutes";

/** What the main snooze button uses: the last value picked on this machine. */
export function loadSnooze(): number {
  try {
    const saved = Number(localStorage.getItem(KEY));
    return SNOOZE_OPTIONS.includes(saved) ? saved : DEFAULT_MINUTES;
  } catch {
    return DEFAULT_MINUTES;
  }
}

export function saveSnooze(minutes: number): void {
  try {
    localStorage.setItem(KEY, String(minutes));
  } catch {
    // Private windows and blocked storage just forget the choice.
  }
}
