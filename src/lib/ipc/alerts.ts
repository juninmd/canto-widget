import { invoke } from "@tauri-apps/api/core";
import type { AgendaItem } from "./agenda";

/** Do not disturb; `untilMs: null` while active means until turned off. */
export type DndState = { active: boolean; untilMs: number | null };
/** Focus mode: a daily window and/or running meetings turn do-not-disturb on by themselves. Minutes count from local midnight. */
export type FocusConfig = { schedule: boolean; start_min: number; end_min: number; weekdays_only: boolean; in_meeting: boolean; offset_min: number };
/** An alert the silence held back; `at` is Unix ms. */
export type FocusHeld = { title: string; at: number };
/** What was done with an alert: the main action, snoozed, closed or (a service) muted. */
export type AlertOutcome = "done" | "snoozed" | "closed" | "muted";
export type ResolvedAlert = { item: AgendaItem; outcome: AlertOutcome; at: number };

export const alertsApi = {
  alertOpen: (event: AgendaItem) => invoke<void>("alert_open", { event }),
  alertPayload: () => invoke<AgendaItem[]>("alert_payload"),
  /** No outcome means plain "closed"; Rust records it for the notifications column. */
  alertClose: (id: string, outcome?: AlertOutcome) => invoke<void>("alert_close", { id, outcome }),
  /** The overlay has no card left: Rust hides its window, or returns what is still pending. */
  alertSettle: () => invoke<AgendaItem[]>("alert_settle"),
  /** The pop-up's card height: its window shrinks or grows to it, anchored to the screen corner. */
  alertResize: (height: number) => invoke<void>("alert_resize", { height }),
  /** "Fechar todos" on the overlay: the whole queue goes in one call, and each one is still logged. */
  alertCloseAll: (outcome?: AlertOutcome) => invoke<void>("alert_close_all", { outcome }),
  alertLog: () => invoke<ResolvedAlert[]>("alert_log"),
  mainShow: () => invoke<void>("main_show"),
  alertSnooze: (id: string, minutes: number) => invoke<void>("alert_snooze", { id, minutes }),
  openLink: (url: string) => invoke<void>("open_link", { url }),
  dndGet: () => invoke<DndState>("dnd_get"),
  /** `untilMs: null` keeps it on until turned off; the UI computes the end (local timezone). */
  dndSet: (untilMs: number | null) => invoke<DndState>("dnd_set", { untilMs }),
  dndClear: () => invoke<DndState>("dnd_clear"),
  focusGet: () => invoke<FocusConfig>("focus_get"),
  focusSet: (config: FocusConfig) => invoke<FocusConfig>("focus_set", { config }),
  /** Rust can't trust its timezone: the UI says how far from UTC the local clock is (minutes east). */
  focusOffset: (offsetMin: number) => invoke<FocusConfig>("focus_offset", { offsetMin }),
  /** What the silence held back since the last call; asking empties the list. */
  focusSummary: () => invoke<FocusHeld[]>("focus_summary"),
};
