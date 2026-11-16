import { invoke } from "@tauri-apps/api/core";

/** Unix seconds: the day is cut in the UI, whose timezone is the reliable one. */
export type ActivitySpan = { app: string; start: number; end: number };
export type ActivityAway = { start: number; end: number };
/** Focus-timer time on one task; `title` is null once the task is gone. */
export type ActivityFocus = { task: string; title: string | null; secs: number };
export type ActivitySummary = {
  spans: ActivitySpan[];
  apps: { app: string; secs: number }[];
  total_secs: number;
  /** Stretches with the computer on and no keyboard or mouse input. */
  idle: ActivityAway[];
  idle_secs: number;
  focus: ActivityFocus[];
};
export type ActivityStatus = { supported: boolean; enabled: boolean };

export const activityApi = {
  activityStatus: () => invoke<ActivityStatus>("activity_status"),
  activitySetEnabled: (enabled: boolean) => invoke<void>("activity_set_enabled", { enabled }),
  activitySummary: (fromMs: number, toMs: number) => invoke<ActivitySummary>("activity_summary", { fromMs, toMs }),
  activityClear: () => invoke<void>("activity_clear"),
};
