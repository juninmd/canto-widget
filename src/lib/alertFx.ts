import type { AgendaItem } from "./api";
import { minutesUntil } from "./agenda";
import { kindOf, toneOf, type Tone } from "./alerts";
import { weatherEnter, weatherSky } from "./weatherFx";

/** The animated backdrop of each alert family: expanding rings, floating ticks, sparkles, glitches, branches, bubbles, sun rays, a heartbeat. */
export type FxScene = "rings" | "ticks" | "sparks" | "bugs" | "branches" | "bubbles" | "rays" | "pulse";

export type AlertFxSpec = { scene: FxScene | "weather"; enter: string; sky: string; tone: Tone; intense: boolean };

/** Rows of `r,g,b` for the canvas, per tone. */
export const TONE_RGB: Record<Tone, string> = { danger: "251,113,133", warn: "251,191,36", accent: "106,168,255", muted: "148,163,184" };

const PR: Record<string, [FxScene, string, string]> = {
  ci: ["bugs", "shake", "#4a1d2a"],
  conflict: ["branches", "gust", "#4a1d2a"],
  changes: ["branches", "gust", "#4a3418"],
  stalled: ["pulse", "rise", "#4a3418"],
  approved: ["sparks", "glow", "#14532d"],
  ready: ["sparks", "glow", "#14532d"],
};

/** What an alert looks like when it arrives and while it waits. Weather has its own sky (`WeatherAlertFx`). */
export function alertFx(e: AgendaItem, now = new Date()): AlertFxSpec {
  const tone = toneOf(e);
  const danger = tone === "danger";
  const kind = kindOf(e);
  if (kind === "weather") return { scene: "weather", enter: weatherEnter(e.id), sky: weatherSky(e.id), tone, intense: danger };
  const spec = (scene: FxScene, enter: string, sky: string, intense = danger): AlertFxSpec => ({ scene, enter: `wx-enter-${enter}`, sky, tone, intense });
  switch (kind) {
    case "meeting":
      // The closer the start, the faster the rings.
      return spec("rings", "rise", "#1e3a5f", minutesUntil(e, now) <= 2);
    case "task":
      return spec("ticks", "drop", "#14532d");
    case "pr": {
      const [scene, enter, sky] = PR[e.tag ?? ""] ?? ["bubbles", "rise", "#1e3a5f"];
      return spec(scene, enter, sky);
    }
    case "mention":
      return spec("bubbles", "rise", "#25384f");
    case "status":
      return spec("pulse", danger ? "shake" : "drop", danger ? "#4a1d2a" : e.tag === "maintenance" ? "#2a3340" : "#4a3418");
    case "model":
      return spec("sparks", "glow", "#4a2a5e");
    case "system":
      return spec("pulse", danger ? "shake" : "rise", danger ? "#4a1d2a" : "#4a3418");
    default:
      return spec("rays", "mist", "#5a3a12");
  }
}
