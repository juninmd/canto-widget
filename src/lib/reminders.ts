import type { AgendaItem, Repeat, Task } from "./api";

/** Window during which the reminder still counts: the watcher runs every 30s and can run late. */
const TOLERANCE_MIN = 2;
export const TASK_PREFIX = "task:";

function start(day: string, time: string): Date {
  const [y, m, d] = day.split("-").map(Number);
  const [h, min] = time.split(":").map(Number);
  return new Date(y, m - 1, d, h, min, 0);
}

/** Key includes day and time: rescheduling the task produces a new reminder. */
export const reminderKey = (t: Task) => `${t.id}@${t.day}T${t.hora}`;

/** Open tasks whose time arrived less than 2 min ago and haven't reminded yet. */
export function dueReminders(tasks: Task[], alreadyNotified: Set<string>, now = new Date()): Task[] {
  return tasks.filter((t) => {
    if (t.done || !t.hora || alreadyNotified.has(reminderKey(t))) return false;
    const elapsed = (now.getTime() - start(t.day, t.hora).getTime()) / 60_000;
    return elapsed >= 0 && elapsed < TOLERANCE_MIN;
  });
}

/** The alert overlay speaks the agenda's language; the task becomes an event with a tagged id. */
export function toEvent(t: Task): AgendaItem {
  const when = start(t.day, t.hora ?? "00:00").toISOString();
  return { id: TASK_PREFIX + t.id, title: t.title, start: when, end: when, all_day: false, location: "", meet: "", link: "" };
}

export const REPEAT_LABEL: Record<Repeat["tipo"], string> = {
  diaria: "todo dia",
  dias_uteis: "dias úteis",
  semanal: "toda semana",
};

/** 0 = Sunday, same as Rust. */
export function dayOfWeek(day: string): number {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}
