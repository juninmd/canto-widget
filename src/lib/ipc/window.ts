import { invoke } from "@tauri-apps/api/core";
import type { WeatherCondition } from "./weather";

export type StripItem =
  | "clock" | "cpu" | "memory" | "gpu" | "temp" | "disk" | "network" | "battery" | "tasks" | "weather" | "event"
  | "reviews" | "notices" | "health" | "market";
export const STRIP_ITEMS: readonly StripItem[] = [
  "clock", "cpu", "memory", "gpu", "temp", "disk", "network", "battery", "tasks", "weather", "event", "reviews", "notices", "health", "market",
];
export type StripConfig = {
  enabled: boolean;
  edge: "top" | "bottom";
  /** In the user's order. */
  items: StripItem[];
  monitor?: string | null;
  density: "compact" | "comfortable";
  labels: boolean;
  icons: boolean;
  /** 40 to 100. */
  opacity: number;
  charts: boolean;
  /** Where along the edge the pill sits. */
  align: "start" | "center" | "end";
  /** Where the user dragged the pill: its center as 0 to 1 of the screen width; wins over `align`. */
  pos?: number | null;
  /** Pixels between the pill and the edge, 0 to 64. */
  gap: number;
  /** Zoom in %, 80 to 140. */
  scale: number;
  surface: "solid" | "glass" | "outline";
  dividers: boolean;
  /** Seconds between readings, 1 to 30. */
  refresh: number;
  /** Details open on hover; off means a click only. */
  hover: boolean;
  /** Off keeps the pill over full-screen apps. */
  hide_fullscreen: boolean;
  /** Columns of cards in the details. */
  columns: 1 | 2;
};
export type NextTask = { id: string; title: string };
export type StripSnapshot = {
  cpu: number;
  memory: number;
  disk: number | null;
  /** Bytes per second, down and up. */
  network: [number, number];
  gpu: number | null;
  temp: number | null;
  market: { symbol: string; price: number; change: number; currency: string | null } | null;
  health: { down: number; total: number };
  history: { cpu: number[]; memory: number[]; net_down: number[] } | null;
  weather: { temp: number; condition: WeatherCondition } | null;
  event: { title: string; in_min: number; meet: boolean } | null;
  reviews: number;
  battery: [number, boolean] | null;
  tasks: number;
  /** First open task, offered as "Concluir" on the Tarefas card; absent in older backends and mocks. */
  next_task?: NextTask | null;
  notices: number;
};
export type WindowConfig = { position: [number, number] | null; size: [number, number] | null; always_on_top: boolean; mini: boolean; sidebar: boolean };

export const windowApi = {
  windowConfig: () => invoke<WindowConfig>("window_config"),
  windowSetAlwaysOnTop: (enabled: boolean) => invoke<void>("window_set_always_on_top", { enabled }),
  windowReset: () => invoke<void>("window_reset"),
  windowMiniSet: (enabled: boolean) => invoke<void>("window_mini_set", { enabled }),
  windowSidebarSet: (enabled: boolean) => invoke<void>("window_sidebar_set", { enabled }),
  windowMaxSet: (enabled: boolean) => invoke<void>("window_max_set", { enabled }),
  windowMaxGet: () => invoke<boolean>("window_max_get"),
  windowMiniResize: (width: number, height: number) => invoke<void>("window_mini_resize", { width, height }),
  stripConfigGet: () => invoke<StripConfig>("strip_config_get"),
  stripConfigSet: (config: StripConfig) => invoke<StripConfig>("strip_config_set", { config }),
  stripSnapshot: () => invoke<StripSnapshot>("strip_snapshot"),
  stripResize: (width: number, height: number) => invoke<void>("strip_resize", { width, height }),
  stripJoin: () => invoke<void>("strip_join"),
  /** `grab`: where the pill was held, in px from its center. The drop (`commit`) saves the place. */
  stripDrag: (grab: number, commit: boolean) => invoke<void>("strip_drag", { grab, commit }),
  stripFocus: (on: boolean) => invoke<void>("strip_focus", { on }),
  stripMonitors: () => invoke<string[]>("strip_monitors"),
  fullscreenHoldGet: () => invoke<boolean>("fullscreen_hold_get"),
  fullscreenHoldSet: (enabled: boolean) => invoke<boolean>("fullscreen_hold_set", { enabled }),
};
