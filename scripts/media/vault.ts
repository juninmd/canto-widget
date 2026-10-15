import type { Page } from "@playwright/test";
import type { Note, Task } from "../../src/lib/api";

export type VaultSeed = { tasks: Task[]; notes: Note[] };

/** Wraps the e2e mock's `invoke` so tasks and notes behave like a vault for the length of one page. */
export async function seedVault(page: Page, seed: VaultSeed) {
  await page.addInitScript((s: VaultSeed) => {
    type Row = Record<string, unknown> & { id: string };
    const w = window as unknown as { __TAURI_INTERNALS__: { invoke: (cmd: string, args?: Record<string, unknown>) => Promise<unknown> } };
    const base = w.__TAURI_INTERNALS__.invoke;
    const tasks = structuredClone(s.tasks) as unknown as Row[];
    const notes = structuredClone(s.notes) as unknown as Row[];
    const find = (id: unknown) => tasks.find((t) => t.id === id);
    let seq = 100;
    const now = () => Date.now();
    w.__TAURI_INTERNALS__.invoke = async (cmd, args = {}) => {
      const task = find(args.id);
      switch (cmd) {
        case "tasks_for_day":
          return tasks.filter((t) => t.day === args.day);
        case "task_add": {
          const row = { id: `n${seq++}`, title: args.title, done: false, day: args.day, created_at: now(), updated_at: now() };
          tasks.push(row);
          return row;
        }
        case "task_toggle":
          if (task) task.done = !task.done;
          return null;
        case "task_complete":
          if (task) task.done = true;
          return null;
        case "task_rename":
          if (task) task.title = args.title;
          return null;
        case "task_set_schedule":
          if (task) Object.assign(task, { hora: args.time, repetir: args.repeat });
          return null;
        case "task_set_priority":
          if (task) task.priority = args.priority;
          return null;
        case "task_set_estimate":
          if (task) task.estimate_min = args.minutes;
          return null;
        case "task_add_time":
          if (task) task.tracked_secs = Number(task.tracked_secs ?? 0) + Number(args.secs);
          return null;
        case "task_link_pr":
          if (task) task.pr_url = args.url;
          return null;
        case "subtask_add": {
          const sub = { id: `s${seq++}`, title: args.title, done: false };
          if (task) task.subtasks = [...((task.subtasks as unknown[]) ?? []), sub];
          return sub;
        }
        case "subtask_toggle": {
          const sub = ((task?.subtasks as { id: string; done: boolean }[]) ?? []).find((x) => x.id === args.subtaskId);
          if (sub) sub.done = !sub.done;
          return null;
        }
        case "notes_search": {
          const q = String(args.query ?? "").toLowerCase();
          const hit = notes.filter((n) => !q || JSON.stringify(n).toLowerCase().includes(q));
          return { total: hit.length, items: hit.slice(0, Number(args.limit ?? 50)) };
        }
        case "note_save": {
          const existing = notes.find((n) => n.id === args.id);
          const row = { ...(existing ?? { id: `m${seq++}`, created_at: now() }), title: args.title, body: args.body, tags: args.tags, updated_at: now() };
          if (existing) Object.assign(existing, row);
          else notes.unshift(row);
          return row;
        }
        case "note_pin": {
          const n = notes.find((x) => x.id === args.id);
          if (n) n.fixada = !n.fixada;
          return Boolean(n?.fixada);
        }
        default:
          return base(cmd, args);
      }
    };
  }, seed);
}
