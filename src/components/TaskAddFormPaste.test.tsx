import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

type Call = { cmd: string; args?: Record<string, unknown> };
const calls: Call[] = [];
let next = 0;
let failing = "";

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    calls.push({ cmd, args });
    if (cmd === failing) return Promise.reject("falhou");
    if (cmd === "task_add") return Promise.resolve({ id: `t${++next}`, title: args?.title, done: false });
    return Promise.resolve(null);
  },
}));

const { default: TaskAddForm } = await import("./TaskAddForm");

const errors: string[] = [];
let reloads = 0;
function mount() {
  render(
    <TaskAddForm
      today="2026-09-09"
      reload={async () => void reloads++}
      onError={(m) => errors.push(m)}
    />,
  );
  return screen.getByPlaceholderText(/nova tarefa/) as HTMLInputElement;
}

async function paste(field: HTMLInputElement, text: string) {
  await act(async () => {
    fireEvent.paste(field, { clipboardData: { getData: () => text } });
  });
}

beforeEach(() => {
  calls.length = 0;
  errors.length = 0;
  reloads = 0;
  next = 0;
  failing = "";
});
afterEach(cleanup);

test("pasting a list into the empty field creates one task per line, with its time and priority", async () => {
  const field = mount();
  await paste(field, "- comprar leite\n\n- [ ] Daily às 9h30\n1. relatório !alta\n");
  expect(calls.filter((c) => c.cmd === "task_add").map((c) => c.args?.title)).toEqual([
    "comprar leite",
    "Daily",
    "relatório",
  ]);
  expect(calls.find((c) => c.cmd === "task_set_schedule")?.args).toEqual({ id: "t2", time: "09:30", repeat: null });
  expect(calls.find((c) => c.cmd === "task_set_priority")?.args).toEqual({ id: "t3", priority: "high" });
  expect(reloads).toBe(1);
  expect(field.value).toBe("");
});

test("a single line, or a paste into a field already being typed, is left to the input", async () => {
  const field = mount();
  await paste(field, "só uma linha");
  await act(async () => {
    fireEvent.change(field, { target: { value: "comprar " } });
  });
  await paste(field, "leite\npão");
  expect(calls).toHaveLength(0);
  expect(reloads).toBe(0);
});

test("a task that fails to be created stops the batch and reports it, after reloading what landed", async () => {
  const field = mount();
  failing = "task_add";
  await paste(field, "um\ndois\ntrês");
  expect(calls.filter((c) => c.cmd === "task_add")).toHaveLength(1);
  expect(reloads).toBe(1);
  expect(errors).toEqual(["falhou"]);
});
