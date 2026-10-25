import { afterEach, expect, mock, test } from "bun:test";
import { act, Profiler } from "react";
import { cleanup, render, screen } from "@testing-library/react";

const mk = (id: string, title: string, extra: Record<string, unknown> = {}) => ({
  id,
  title,
  done: false,
  day: "2026-09-09",
  created_at: 1,
  updated_at: 1,
  subtasks: [{ id: `${id}-s`, title: "passo", done: false }],
  ...extra,
});
let list = [mk("t1", "aberta"), mk("t2", "feita", { done: true })];
const calls: string[] = [];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string) => {
    calls.push(cmd);
    // The IPC hands back a fresh copy on every call, even when nothing changed.
    if (cmd === "tasks_for_day") return Promise.resolve(structuredClone(list));
    return Promise.resolve(null);
  },
}));

const { default: TasksTab } = await import("./TasksTab");
const { ToastProvider } = await import("../lib/toast");

let commits = 0;
const tree = (version: number) => (
  <Profiler id="tasks" onRender={() => commits++}>
    <ToastProvider>
      <TasksTab today="2026-09-09" version={version} onError={() => {}} />
    </ToastProvider>
  </Profiler>
);

async function settle() {
  await act(async () => {
    await new Promise((ok) => setTimeout(ok, 10));
  });
}

afterEach(cleanup);

test("a reload that brings back the same day keeps the list and does not re-render the rows", async () => {
  const view = render(tree(0));
  await settle();
  const badges = () => calls.filter((c) => c === "badge_set_tasks").length;
  const badgesBefore = badges();

  commits = 0;
  view.rerender(tree(1));
  await settle();
  // One commit for the new `version` prop; the identical answer adds none, nor another badge push.
  expect(calls.filter((c) => c === "tasks_for_day").length).toBe(2);
  expect(commits).toBe(1);
  expect(badges()).toBe(badgesBefore);

  // A real change still shows up.
  list = [mk("t1", "aberta renomeada"), mk("t2", "feita", { done: true })];
  view.rerender(tree(2));
  await settle();
  expect(screen.getAllByText("aberta renomeada").length).toBeGreaterThan(0);
});
