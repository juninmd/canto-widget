import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { StripConfig, StripSnapshot } from "../../lib/api";

const calls: { cmd: string; args?: Record<string, unknown> }[] = [];
const emitted: string[] = [];
let remaining: { id: string; title: string; done: boolean }[] = [];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    calls.push({ cmd, args });
    if (cmd === "tasks_for_day") return Promise.resolve(remaining);
    if (cmd === "dnd_get") return Promise.resolve({ active: false, untilMs: null });
    return Promise.resolve(null);
  },
}));
mock.module("@tauri-apps/api/event", () => ({
  emit: (name: string) => {
    emitted.push(name);
    return Promise.resolve();
  },
  listen: () => Promise.resolve(() => {}),
}));

const { default: StripDetails } = await import("./StripDetails");

afterEach(() => {
  cleanup();
  calls.length = 0;
  emitted.length = 0;
  remaining = [];
});

const cfg = { items: ["tasks"], columns: 2, charts: false } as unknown as StripConfig;
const view = (snap: Partial<StripSnapshot>) =>
  render(<StripDetails cfg={cfg} snap={{ tasks: 3, ...snap } as StripSnapshot} onOpen={() => {}} onCustomize={() => {}} onHide={() => {}} />);

test("Concluir completes the first task, pushes the next real one and tells the Tarefas tab", async () => {
  remaining = [
    { id: "t1", title: "Revisar o PR", done: true },
    { id: "t2", title: "Escrever o relatório", done: false },
    { id: "t3", title: "Pagar a conta", done: false },
  ];
  view({ next_task: { id: "t1", title: "Revisar o PR" } });
  fireEvent.click(await screen.findByText("Concluir"));
  await waitFor(() => expect(emitted).toEqual(["canto://tasks-changed"]));
  expect(calls.find((c) => c.cmd === "task_complete")?.args).toEqual({ id: "t1" });
  expect(calls.find((c) => c.cmd === "badge_set_tasks")?.args).toEqual({ count: 2, next: { id: "t2", title: "Escrever o relatório" } });
});

test("the button is not offered again for the task just completed while the snapshot is stale", async () => {
  view({ next_task: { id: "t1", title: "Revisar o PR" } });
  fireEvent.click(await screen.findByText("Concluir"));
  await waitFor(() => expect(screen.queryByText("Concluir")).toBeNull());
  expect(calls.filter((c) => c.cmd === "task_complete").length).toBe(1);
});

test("without a next task there is no Concluir", () => {
  view({ next_task: null });
  expect(screen.queryByText("Concluir")).toBeNull();
});
