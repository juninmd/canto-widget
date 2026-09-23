import type { AgendaItem, Repeat, Task } from "./api";

export const TASK_PREFIX = "task:";

function start(day: string, time: string): Date {
  const [y, m, d] = day.split("-").map(Number);
  const [h, min] = time.split(":").map(Number);
  return new Date(y, m - 1, d, h, min, 0);
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
