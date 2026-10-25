import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { todayLocal } from "./lib/api";

const calls: { cmd: string; args: Record<string, unknown> }[] = [];
const emitted: string[] = [];
let failNext: string | null = null;
/** When set, `task_add` waits for this promise, so a test can press again while the first save is running. */
let hold: Promise<void> | null = null;

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: Record<string, unknown> = {}) => {
    calls.push({ cmd, args });
    if (failNext === cmd) {
      failNext = null;
      return Promise.reject("cofre trancado");
    }
    if (cmd === "task_add" && hold) return hold.then(() => ({ id: "t1" }));
    return Promise.resolve(cmd === "task_add" ? { id: "t1" } : null);
  },
}));
mock.module("@tauri-apps/api/event", () => ({
  listen: () => Promise.resolve(() => {}),
  emit: (event: string) => {
    emitted.push(event);
    return Promise.resolve();
  },
}));

const { default: CaptureWindow } = await import("./CaptureWindow");

const input = () => screen.getByRole("textbox") as HTMLInputElement;
const cmds = () => calls.map((c) => c.cmd);
const settle = () => act(() => new Promise((r) => setTimeout(r, 0)));

/** Keys go to the window's root, as in the app; the save runs async, so wait for its commands. */
async function press(init: { key: string; ctrlKey?: boolean }) {
  fireEvent.keyDown(input().parentElement!, init);
  await settle();
}

beforeEach(() => {
  calls.length = 0;
  emitted.length = 0;
  failNext = null;
  hold = null;
  render(<CaptureWindow />);
});

afterEach(cleanup);

test("Enter saves a task for today and closes the window", async () => {
  fireEvent.change(input(), { target: { value: "  comprar pão  " } });
  await press({ key: "Enter" });
  expect(calls[0]).toEqual({ cmd: "task_add", args: { title: "comprar pão", day: todayLocal() } });
  expect(emitted).toEqual(["canto://tasks-changed"]);
  expect(cmds()).toContain("capture_close");
});

test("Ctrl+Enter saves a note instead of a task", async () => {
  fireEvent.change(input(), { target: { value: "ideia da semana" } });
  await press({ key: "Enter", ctrlKey: true });
  expect(cmds()).toContain("note_save");
  expect(cmds()).not.toContain("task_add");
});

test("the quick-add syntax sets the time and priority, as in the task list", async () => {
  fireEvent.change(input(), { target: { value: "Daily às 9h30 !alta" } });
  await press({ key: "Enter" });
  expect(calls[0].args.title).toBe("Daily");
  expect(cmds()).toContain("task_set_schedule");
  expect(cmds()).toContain("task_set_priority");
});

test("an empty field saves nothing", async () => {
  fireEvent.change(input(), { target: { value: "   " } });
  await press({ key: "Enter" });
  expect(calls).toEqual([]);
});

test("Esc closes without saving", async () => {
  fireEvent.change(input(), { target: { value: "rascunho" } });
  await press({ key: "Escape" });
  expect(cmds()).toEqual(["capture_close"]);
});

test("a failed save keeps the text and shows the reason", async () => {
  failNext = "task_add";
  fireEvent.change(input(), { target: { value: "importante" } });
  await press({ key: "Enter" });
  expect(input().value).toBe("importante");
  expect(screen.getByRole("alert").textContent).toContain("cofre trancado");
  expect(cmds()).not.toContain("capture_close");
});

test("a second Enter while the first save runs does not add the task twice", async () => {
  let release!: () => void;
  hold = new Promise((r) => (release = r));
  fireEvent.change(input(), { target: { value: "comprar pão" } });
  fireEvent.keyDown(input().parentElement!, { key: "Enter" });
  fireEvent.keyDown(input().parentElement!, { key: "Enter" });
  await settle();
  const task = screen.getByText("tarefa de hoje").closest("button")!;
  expect(task.disabled).toBe(true);
  expect(task.getAttribute("aria-busy")).toBe("true");
  fireEvent.click(task);
  await act(async () => release());
  await settle();
  expect(cmds().filter((c) => c === "task_add")).toHaveLength(1);
  expect(task.disabled).toBe(false);
});
