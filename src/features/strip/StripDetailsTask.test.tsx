import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { StripConfig, StripSnapshot } from "../../lib/api";

const calls: { cmd: string; args?: Record<string, unknown> }[] = [];
const emitted: string[] = [];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    calls.push({ cmd, args });
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
});

const cfg = { items: ["tasks"], columns: 2, charts: false } as unknown as StripConfig;
const view = (snap: Partial<StripSnapshot>) =>
  render(<StripDetails cfg={cfg} snap={{ tasks: 3, ...snap } as StripSnapshot} onOpen={() => {}} onCustomize={() => {}} onHide={() => {}} />);

test("Concluir completes the first open task, lowers the count and tells the Tarefas tab", async () => {
  view({ next_task: { id: "t1", title: "Revisar o PR" } });
  fireEvent.click(await screen.findByText("Concluir"));
  await screen.findByText("Concluir");
  await Promise.resolve();
  expect(calls.find((c) => c.cmd === "task_complete")?.args).toEqual({ id: "t1" });
  expect(calls.find((c) => c.cmd === "badge_set_tasks")?.args).toEqual({ count: 2, next: null });
  expect(emitted).toEqual(["canto://tasks-changed"]);
});

test("without a next task there is no Concluir", () => {
  view({ next_task: null });
  expect(screen.queryByText("Concluir")).toBeNull();
});
