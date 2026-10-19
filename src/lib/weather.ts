/** Clima helpers: the condition's sentence and the labels the card shows, in the user's locale. */
import { LOCALE } from "../i18n";
import type { WeatherCondition, WeatherDay } from "./api";

/** `rain` is the catalogue's percentage; the condition is `rainy`. */
export type ConditionKey =
  | "weather.clear"
  | "weather.cloudy"
  | "weather.fog"
  | "weather.drizzle"
  | "weather.rainy"
  | "weather.snow"
  | "weather.storm";

export function conditionKey(condition: WeatherCondition): ConditionKey {
  return `weather.${condition === "rain" ? "rainy" : condition}` as ConditionKey;
}

/** Whole degrees: a tenth of a degree is noise on a card. */
export function degrees(value: number): string {
  return Math.round(value).toLocaleString(LOCALE, { maximumFractionDigits: 0 });
}

/** "2026-10-17T16:00" as the API sends it, already in the city's timezone → "16:00". */
export function clock(at: string): string {
  const time = at.slice(11, 16);
  return /^\d{2}:\d{2}$/.test(time) ? time : at;
}

/** "2026-10-18" → "dom." (the API's date is already local to the city). */
export function weekday(date: string): string {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat(LOCALE, { weekday: "short" }).format(parsed);
}

export type UvKey = "weather.uv.low" | "weather.uv.moderate" | "weather.uv.high" | "weather.uv.veryHigh" | "weather.uv.extreme";

/** WHO bands: 0-2 low, 3-5 moderate, 6-7 high, 8-10 very high, 11+ extreme. */
export function uvKey(uv: number): UvKey {
  if (uv < 3) return "weather.uv.low";
  if (uv < 6) return "weather.uv.moderate";
  if (uv < 8) return "weather.uv.high";
  if (uv < 11) return "weather.uv.veryHigh";
  return "weather.uv.extreme";
}

/** Before the sunrise or from the sunset on; the ISO local strings compare in order. Without sun times, 06h-19h is day. */
export function isNight(at: string, days: WeatherDay[]): boolean {
  const day = days.find((d) => d.date === at.slice(0, 10));
  if (day?.sunrise && day.sunset) return at < day.sunrise || at >= day.sunset;
  const hour = Number(at.slice(11, 13));
  return Number.isFinite(hour) && (hour < 6 || hour >= 19);
}

/** Where a day's min..max sits inside the window's min..max, as percentages for the range bar. */
export function rangeBar(day: WeatherDay, lo: number, hi: number): { from: number; span: number } {
  const total = Math.max(hi - lo, 1);
  const from = ((day.min - lo) / total) * 100;
  return { from, span: Math.max(((day.max - day.min) / total) * 100, 6) };
}

/** The user's local "10:30" for the instant the forecast was fetched. */
export function fetchedClock(ms: number): string {
  return new Intl.DateTimeFormat(LOCALE, { hour: "2-digit", minute: "2-digit" }).format(new Date(ms));
}
