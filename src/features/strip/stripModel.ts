import { t, LOCALE } from "../../i18n";
import { degrees } from "../weather/weather";
import { rate } from "../system/system";
import { signedPercent } from "../market/market";
import type { StripItem, StripSnapshot } from "../../lib/api";

export type Level = "" | "warn" | "danger";

const by = (v: number, warn: number, danger: number): Level => (v >= danger ? "danger" : v >= warn ? "warn" : "");

/** Colour only means something is wrong: a calm pill stays neutral. */
export function levelOf(item: StripItem, s: StripSnapshot): Level {
  switch (item) {
    case "cpu":
      return by(s.cpu, 65, 85);
    case "memory":
      return by(s.memory, 80, 90);
    case "gpu":
      return s.gpu === null ? "" : by(s.gpu, 80, 95);
    case "temp":
      return s.temp === null ? "" : by(s.temp, 75, 85);
    case "disk":
      return s.disk === null ? "" : by(s.disk, 85, 95);
    case "battery":
      return !s.battery || s.battery[1] ? "" : s.battery[0] <= 10 ? "danger" : s.battery[0] <= 20 ? "warn" : "";
    case "event":
      return !s.event ? "" : s.event.in_min <= 5 ? "danger" : s.event.in_min <= 15 ? "warn" : "";
    case "reviews":
      return s.reviews > 0 ? "warn" : "";
    case "health":
      return s.health.down > 0 ? "danger" : "";
    default:
      return "";
  }
}

/** In minutes up to two hours, then the hour count: "14 min" reads at a glance, "135 min" does not. */
export function inLabel(min: number): string {
  if (min <= 0) return t("strip.now");
  return min < 120 ? t("strip.in", { min: String(min) }) : t("strip.inHours", { h: String(Math.round(min / 60)) });
}

export function clock(now: Date): string {
  return now.toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" });
}

const pct = (v: number) => `${Math.round(v)}%`;

/** The few characters each item takes on the pill; `null` when there is nothing to show (no city, no sensor). */
export function pillText(item: StripItem, s: StripSnapshot, now = new Date()): string | null {
  switch (item) {
    case "clock":
      return clock(now);
    case "cpu":
      return pct(s.cpu);
    case "memory":
      return pct(s.memory);
    case "gpu":
      return s.gpu === null ? null : pct(s.gpu);
    case "temp":
      return s.temp === null ? null : `${Math.round(s.temp)}°C`;
    case "disk":
      return s.disk === null ? null : pct(s.disk);
    case "network":
      return `↓ ${rate(s.network[0])}`;
    case "battery":
      return s.battery ? pct(s.battery[0]) : null;
    case "tasks":
      return String(s.tasks);
    case "weather":
      return s.weather ? `${degrees(s.weather.temp)}°` : null;
    case "event":
      return s.event ? inLabel(s.event.in_min) : null;
    case "reviews":
      return String(s.reviews);
    case "notices":
      return String(s.notices);
    case "health":
      return s.health.total ? `${s.health.total - s.health.down}/${s.health.total}` : null;
    case "market":
      return s.market ? `${signedPercent(s.market.change)}%` : null;
  }
}

/** Where a click on an item leads in the widget. */
export const ITEM_TAB: Record<StripItem, string> = {
  clock: "agenda",
  cpu: "system",
  memory: "system",
  gpu: "system",
  temp: "system",
  disk: "system",
  network: "system",
  battery: "system",
  tasks: "tasks",
  weather: "weather",
  event: "agenda",
  reviews: "github",
  notices: "agenda",
  health: "status",
  market: "market",
};

/** Each card's badge colour, so a glance tells the system from the agenda from the market. */
export const TINT: Record<StripItem, string> = {
  clock: "var(--color-cat-other)",
  cpu: "var(--color-accent)",
  memory: "var(--color-cat-docs)",
  gpu: "var(--color-cat-games)",
  temp: "var(--color-warn)",
  disk: "var(--color-cat-web)",
  network: "var(--color-cat-meet)",
  battery: "var(--color-ok)",
  tasks: "var(--color-accent)",
  weather: "var(--color-cat-web)",
  event: "var(--color-cat-meet)",
  reviews: "var(--color-cat-chat)",
  notices: "var(--color-warn)",
  health: "var(--color-ok)",
  market: "var(--color-cat-games)",
};

/** Cards that need the full width: a title or a price doesn't fit half of 320 px. */
export const WIDE: ReadonlySet<StripItem> = new Set(["event", "market"]);
