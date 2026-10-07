import { dayWindow } from "./agenda";
import type { AgendaItem } from "./api";

const parts = (day: string) => day.split("-").map(Number) as [number, number, number];
export const dateOf = (day: string) => {
  const [y, m, d] = parts(day);
  return new Date(y, m - 1, d);
};

export function shiftDay(day: string, delta: number): string {
  const d = dateOf(day);
  d.setDate(d.getDate() + delta);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function relativeDay(day: string, today: string): "yesterday" | "today" | "tomorrow" | null {
  if (day === today) return "today";
  if (day === shiftDay(today, -1)) return "yesterday";
  if (day === shiftDay(today, 1)) return "tomorrow";
  return null;
}

const FUTURE_START_HOUR = 8;

/**
 * What "now" means for the views: the real clock today, the end of a past day, and the start of the workday on a
 * future one (earlier if something is booked before it), so the hours before work don't count as free time.
 */
export function clockFor(day: string, today: string, real: Date, items: AgendaItem[] = []): Date {
  if (day === today) return real;
  const d = dateOf(day);
  if (day < today) d.setHours(23, 59, 0, 0);
  else {
    const first = items.filter((e) => !e.all_day).map((e) => new Date(e.start).getHours());
    d.setHours(Math.min(FUTURE_START_HOUR, ...first), 0, 0, 0);
  }
  return d;
}

export const windowOf = (day: string) => dayWindow(dateOf(day));
