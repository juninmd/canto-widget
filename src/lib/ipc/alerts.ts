import { invoke } from "@tauri-apps/api/core";
import type { AgendaItem } from "./agenda";

/** Do not disturb; `untilMs: null` while active means until turned off. */
export type DndState = { active: boolean; untilMs: number | null };
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
};
