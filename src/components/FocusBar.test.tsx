import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const calls: { cmd: string; args?: Record<string, unknown> }[] = [];
mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    calls.push({ cmd, args });
    return Promise.resolve(null);
  },
}));

const { default: FocusBar } = await import("./FocusBar");
const { FocusBadge, FocusButton } = await import("./FocusControls");
const { focusStore } = await import("../lib/focus");
const { ToastProvider } = await import("../lib/toast");

const task = { id: "t1", title: "revisar PR", done: false, day: "2026-09-09", created_at: 1, updated_at: 1, estimate_min: 45, tracked_secs: 120 };

function mount() {
  render(
    <ToastProvider>
      <FocusButton task={task} />
      <FocusBadge task={task} />
      <FocusBar onDone={() => {}} onError={() => {}} />
    </ToastProvider>,
  );
}

beforeEach(() => (calls.length = 0));
afterEach(async () => {
  cleanup();
  focusStore.discard();
});

test("nothing is pinned until a task runs, and the row badge shows time against the estimate", () => {
  mount();
  expect(screen.queryByRole("region", { name: "tarefa em foco" })).toBeNull();
  expect(screen.getByText("2/45 min")).toBeTruthy();
});

test("starting a task pins the bar with its clock and estimate, and pausing hides it", async () => {
  mount();
  await act(async () => {
    fireEvent.click(screen.getByLabelText("iniciar foco em revisar PR"));
  });
  const bar = screen.getByRole("region", { name: "tarefa em foco" });
  expect(bar.textContent).toContain("revisar PR");
  expect(screen.getByRole("timer").textContent).toBe("02:00 / 45 min");
  await act(async () => {
    fireEvent.click(screen.getByText("Pausar"));
  });
  expect(screen.queryByRole("region", { name: "tarefa em foco" })).toBeNull();
});

test("finishing from the bar marks the task done", async () => {
  mount();
  await act(async () => {
    fireEvent.click(screen.getByLabelText("iniciar foco em revisar PR"));
  });
  await act(async () => {
    fireEvent.click(screen.getByText("Concluir"));
  });
  expect(calls.some((c) => c.cmd === "task_complete" && c.args?.id === "t1")).toBe(true);
  expect(screen.queryByRole("region", { name: "tarefa em foco" })).toBeNull();
});
