import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { todayLocal } from "./lib/api";

const calls: { cmd: string; args: Record<string, unknown> }[] = [];
const emitted: string[] = [];
let failNext: string | null = null;

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: Record<string, unknown> = {}) => {
    calls.push({ cmd, args });
    if (failNext === cmd) {
      failNext = null;
      return Promise.reject("cofre trancado");
    }
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
