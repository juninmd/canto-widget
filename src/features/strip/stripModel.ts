import { t } from "../../i18n";
import { degrees } from "../weather/weather";
import type { StripItem, StripSnapshot } from "../../lib/api";

export type Level = "" | "warn" | "danger";

/** Colour only means something is wrong: a calm pill stays neutral. */
export function levelOf(item: StripItem, s: StripSnapshot): Level {
  if (item === "cpu") return s.cpu >= 85 ? "danger" : s.cpu >= 65 ? "warn" : "";
  if (item === "memory") return s.memory >= 90 ? "danger" : s.memory >= 80 ? "warn" : "";
  if (item === "battery" && s.battery) return s.battery[1] ? "" : s.battery[0] <= 10 ? "danger" : s.battery[0] <= 20 ? "warn" : "";
  if (item === "event" && s.event) return s.event.in_min <= 5 ? "danger" : s.event.in_min <= 15 ? "warn" : "";
  if (item === "reviews") return s.reviews > 0 ? "warn" : "";
  return "";
}

/** In minutes up to two hours, then the hour count: "14 min" reads at a glance, "135 min" does not. */
export function inLabel(min: number): string {
  if (min <= 0) return t("strip.now");
  return min < 120 ? t("strip.in", { min: String(min) }) : t("strip.inHours", { h: String(Math.round(min / 60)) });
}

/** The few characters each item takes on the pill; `null` when there is nothing to show (no city, no event). */
export function pillText(item: StripItem, s: StripSnapshot): string | null {
  switch (item) {
    case "cpu":
      return `${Math.round(s.cpu)}%`;
    case "memory":
      return `${Math.round(s.memory)}%`;
    case "battery":
      return s.battery ? `${Math.round(s.battery[0])}%` : null;
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
  }
}

/** Where a click on an item leads in the widget. */
export const ITEM_TAB: Record<StripItem, string> = {
  cpu: "system",
  memory: "system",
  battery: "system",
  tasks: "tasks",
  weather: "weather",
  event: "agenda",
  reviews: "github",
  notices: "agenda",
};
