import type { Task } from "./api";

/** The task in focus if it is still open, else the first open one of the day. */
export function pickNow(tasks: Task[], runningId: string | null): Task | null {
  return tasks.find((task) => task.id === runningId && !task.done) ?? tasks.find((task) => !task.done) ?? null;
}
