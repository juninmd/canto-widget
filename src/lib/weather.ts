/** Clima helpers: the condition's sentence and the labels the card shows, in the user's locale. */
import { LOCALE } from "../i18n";
import type { WeatherCondition } from "./api";

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
