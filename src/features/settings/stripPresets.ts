import type { StripConfig } from "../../lib/api";

/** Looks worth one click: they change what is shown and how, never where the pill sits or whether it is on. */
export type PresetId = "minimal" | "monitor" | "day";

export const PRESETS: Record<PresetId, Partial<StripConfig>> = {
  minimal: { items: ["clock", "event"], density: "compact", icons: false, labels: false, surface: "glass", opacity: 70, charts: false, dividers: false, scale: 100 },
  monitor: { items: ["cpu", "memory", "gpu", "temp", "network"], density: "comfortable", icons: true, labels: true, surface: "solid", opacity: 100, charts: true, dividers: true, columns: 2 },
  day: { items: ["clock", "tasks", "event", "reviews", "notices", "weather"], density: "comfortable", icons: true, labels: false, surface: "solid", opacity: 90, charts: true, dividers: true },
};

export const apply = (cfg: StripConfig, id: PresetId): StripConfig => ({ ...cfg, ...PRESETS[id] });
