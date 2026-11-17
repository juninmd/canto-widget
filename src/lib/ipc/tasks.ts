import { invoke } from "@tauri-apps/api/core";

/** `dia` of `semanal`: 0 = Sunday ... 6 = Saturday. */
export type Repeat = { tipo: "diaria" } | { tipo: "dias_uteis" } | { tipo: "semanal"; dia: number };
export type Subtask = { id: string; title: string; done: boolean };
export type Priority = "low" | "medium" | "high";
/** `day`: 1-31, matched exactly. `days`: 0 = Sunday ... 6 = Saturday, same as `Repeat`'s `dia`. */
export type ExtendedRepeat = { tipo: "monthly"; day: number } | { tipo: "specific_days"; days: number[] };
export type Task = {
  id: string;
  title: string;
  done: boolean;
  day: string;
  created_at: number;
  updated_at: number;
  /** Local "HH:MM" reminder time. */
  hora?: string | null;
  repetir?: Repeat | null;
  serie?: string | null;
  pr_url?: string | null;
  subtasks?: Subtask[];
  priority?: Priority | null;
  /** Mutually exclusive with `repetir`: monthly or specific-weekdays recurrence. */
  extended_repeat?: ExtendedRepeat | null;
  /** Planned effort in minutes. */
  estimate_min?: number | null;
  /** Seconds spent in focus. */
  tracked_secs?: number;
  /** Rings when this app comes to the front or this Wi-Fi is joined, instead of at a clock time. */
  context?: TaskContext | null;
};
export type TaskContext = { kind: "app" | "wifi"; name: string };

export const tasksApi = {
  tasksForDay: (day: string) => invoke<Task[]>("tasks_for_day", { day }),
  taskAdd: (title: string, day: string) => invoke<Task>("task_add", { title, day }),
  taskToggle: (id: string) => invoke<void>("task_toggle", { id }),
  /** Marks as done without toggling: a repeating task doesn't reopen. */
  taskComplete: (id: string) => invoke<void>("task_complete", { id }),
  taskRename: (id: string, title: string) => invoke<void>("task_rename", { id, title }),
  carryOver: (day: string) => invoke<number>("tasks_carry_over", { day }),
  taskSetSchedule: (id: string, time: string | null, repeat: Repeat | null) =>
    invoke<void>("task_set_schedule", { id, time, repeat }),
  /** `url: null` clears the link. */
  taskLinkPr: (id: string, url: string | null) => invoke<void>("task_link_pr", { id, url }),
  subtaskAdd: (id: string, title: string) => invoke<Subtask>("subtask_add", { id, title }),
  subtaskToggle: (id: string, subtaskId: string) => invoke<void>("subtask_toggle", { id, subtaskId }),
  subtaskRemove: (id: string, subtaskId: string) => invoke<void>("subtask_remove", { id, subtaskId }),
  taskSetPriority: (id: string, priority: Priority | null) => invoke<void>("task_set_priority", { id, priority }),
  /** Hides the quick-capture window (Esc or after saving). */
  captureClose: () => invoke<void>("capture_close"),
  taskSetEstimate: (id: string, minutes: number | null) => invoke<void>("task_set_estimate", { id, minutes }),
  taskSetContext: (id: string, context: TaskContext | null) => invoke<void>("task_set_context", { id, context }),
  taskAddTime: (id: string, secs: number) => invoke<void>("task_add_time", { id, secs }),
  tasksReorder: (day: string, ids: string[]) => invoke<void>("tasks_reorder", { day, ids }),
  taskSetExtendedRepeat: (id: string, repeat: ExtendedRepeat | null) =>
    invoke<void>("task_set_extended_repeat", { id, repeat }),
  /** Background watcher: doesn't postpone auto-lock; locked returns an empty list. */
  reminderLeadSet: (minutes: number) => invoke<void>("reminder_lead_set", { minutes }),
  languageSet: (lang: string) => invoke<void>("language_set", { lang }),
  /** Feeds the taskbar badge: Rust can't compute "today" reliably itself (see AGENTS.md), so the UI pushes it. */
  badgeSetTasks: (count: number) => invoke<void>("badge_set_tasks", { count }),
};
