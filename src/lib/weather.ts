/** Clima helpers: the condition's sentence and the labels the card shows, in the user's locale. */
import { LOCALE } from "../i18n";
import type { WeatherCondition, WeatherDay, WeatherForecast, WeatherHour } from "./api";

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

/** The hours a day card opens: the next 24 from now for today, the calendar day for the others. */
export function dayHours(hours: WeatherHour[], days: WeatherDay[], index: number): WeatherHour[] {
  if (index === 0) return hours.slice(0, 24);
  const date = days[index]?.date;
  return date ? hours.filter((hour) => hour.at.startsWith(date)) : [];
}

/** Below this many mm in a quarter of an hour the ground stays dry. */
const WET_MM = 0.1;

export type Nowcast =
  | { key: "weather.nowcast.dry" | "weather.nowcast.raining" }
  | { key: "weather.nowcast.stops" | "weather.nowcast.starts"; min: number };

/** The "next 2 hours" sentence from the quarters' mm: when the rain starts, when it stops, or that nothing changes. */
export function nowcast(quarters: number[]): Nowcast {
  const wet = quarters.map((mm) => mm >= WET_MM);
  const first = wet.indexOf(true);
  if (first < 0) return { key: "weather.nowcast.dry" };
  if (first > 0) return { key: "weather.nowcast.starts", min: first * 15 };
  const dry = wet.indexOf(false);
  return dry < 0 ? { key: "weather.nowcast.raining" } : { key: "weather.nowcast.stops", min: dry * 15 };
}

export type AirKey = "weather.air.good" | "weather.air.moderate" | "weather.air.sensitive" | "weather.air.bad" | "weather.air.veryBad";

/** US AQI bands and the colour of each one's dot. */
export function airLevel(aqi: number): { key: AirKey; color: string } {
  if (aqi <= 50) return { key: "weather.air.good", color: "#4ade80" };
  if (aqi <= 100) return { key: "weather.air.moderate", color: "#fbbf24" };
  if (aqi <= 150) return { key: "weather.air.sensitive", color: "#fb923c" };
  if (aqi <= 200) return { key: "weather.air.bad", color: "#f87171" };
  return { key: "weather.air.veryBad", color: "#c084fc" };
}

/** Gusts from this speed on knock things over: worth a warning on the card. */
const STRONG_GUSTS = 60;

export type Alert =
  | { level: "danger"; key: "weather.alert.storm" }
  | { level: "warn"; key: "weather.alert.stormAt"; time: string }
  | { level: "warn"; key: "weather.alert.gusts"; n: number }
  | { level: "warn"; key: "weather.alert.uv"; uv: UvKey };

/** The one warning worth a pill on the sky, the most urgent first: a storm now, a storm coming, strong gusts, harsh sun. */
export function weatherAlert(forecast: WeatherForecast): Alert | null {
  const { now, hours, days } = forecast;
  if (now.condition === "storm") return { level: "danger", key: "weather.alert.storm" };
  const storm = hours.slice(0, 12).find((hour) => hour.condition === "storm");
  if (storm) return { level: "warn", key: "weather.alert.stormAt", time: clock(storm.at) };
  if ((now.gusts ?? 0) >= STRONG_GUSTS) return { level: "warn", key: "weather.alert.gusts", n: Math.round(now.gusts!) };
  const uv = days[0]?.uv ?? 0;
  if (now.is_day && uv >= 8) return { level: "warn", key: "weather.alert.uv", uv: uvKey(uv) };
  return null;
}

/** "2026-10-17T13:45" → 13.75, the hour of the day as a number; NaN when the text is not a timestamp. */
export function hourOf(at: string): number {
  const match = /T(\d{2}):(\d{2})/.exec(at);
  return match ? Number(match[1]) + Number(match[2]) / 60 : Number.NaN;
}
