import { LOCALE, t } from "../i18n";

/** "HH:MM" of a timestamp in ms, for the "updated at" indicators. */
export const clockLabel = (ms: number) => new Date(ms).toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" });

/** The time when `ms` is today; otherwise "qui., 27/11 · 20:57", so a moment from another day is never read as today. */
export function clockOrDay(ms: number, now = new Date()): string {
  const d = new Date(ms);
  const time = clockLabel(ms);
  if (Number.isNaN(d.getTime()) || d.toDateString() === now.toDateString()) return time;
  return `${d.toLocaleDateString(LOCALE, { weekday: "short", day: "2-digit", month: "2-digit" })} · ${time}`;
}

/** A whole hour of the day ("14h", "14:00"), for titles and tiles. */
export const hourLabel = (h: number) => t("time.hourOfDay", { h });

/** The shorter form under a chart axis, where every tick repeats the unit. */
export const hourTick = (h: number) => t("time.hourTick", { h });

/** Hours and minutes in the language's short form ("1h05"); the minutes always take two digits. */
export const hoursMinutes = (h: number, m: number) => t("time.hMin", { h, mm: String(m).padStart(2, "0") });
