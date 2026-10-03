/** The four ways the widget can sit on screen. `hidden` is an action, never a state a visible window renders. */
export type Mode = "mini" | "hidden" | "normal" | "max";

export const MODE_EVENT = "canto://window-mode";
export const MODES: readonly Mode[] = ["mini", "hidden", "normal", "max"];

/** Mini and fullscreen are two independent window facts; the mode the user sees is derived from them. */
export function modeOf(mini: boolean, fullscreen: boolean): Exclude<Mode, "hidden"> {
  return mini ? "mini" : fullscreen ? "max" : "normal";
}

/** How much of the dock the window shows: only the bars, the icons, one label, or the mode menu. */
export type MiniView = "bars" | "icons" | "label" | "menu";

const WIDTH: Record<MiniView, number> = { bars: 24, icons: 56, label: 300, menu: 300 };
const BUTTON = 28;
const ITEM = 40;
const GAP = 8;
const PAD = 12;
/** Room for the four options of the mode menu, which opens beside the buttons. */
const MENU_HEIGHT = 250;

/** Window size for the dock: one row per alert (at least the empty handle) under the mode button. */
export function miniSize(view: MiniView, alerts: number): { width: number; height: number } {
  const rows = Math.max(alerts, 1);
  const list = BUTTON + GAP + rows * ITEM + (rows - 1) * GAP + PAD * 2;
  return { width: WIDTH[view], height: view === "menu" ? Math.max(list, MENU_HEIGHT) : list };
}
