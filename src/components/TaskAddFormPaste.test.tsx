import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

type Call = { cmd: string; args?: Record<string, unknown> };
const calls: Call[] = [];
let next = 0;
let failing = "";
let failOn = "";
let hold: Promise<void> | null = null;

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    calls.push({ cmd, args });
    if (cmd === failing || (cmd === "task_add" && args?.title === failOn)) return Promise.reject("falhou");
    if (cmd === "task_add") {
      const task = { id: `t${++next}`, title: args?.title, done: false };
      return hold ? hold.then(() => task) : Promise.resolve(task);
    }
    return Promise.resolve(null);
  },
}));

const { default: TaskAddForm } = await import("./TaskAddForm");
const { ToastProvider } = await import("../lib/toast");
const { PASTE_TASK_LIMIT } = await import("../lib/pasteTasks");

const errors: string[] = [];
let reloads = 0;
function mount() {
  render(
    <ToastProvider>
      <TaskAddForm today="2026-09-09" reload={async () => void reloads++} onError={(m) => errors.push(m)} />
    </ToastProvider>,
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
  failOn = "";
  hold = null;
});
const added = () => calls.filter((c) => c.cmd === "task_add").map((c) => c.args?.title);
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

test("when the first line fails nothing is created or reloaded and the list waits in the field", async () => {
  const field = mount();
  failing = "task_add";
  await paste(field, "um\ndois\ntrês");
  expect(calls.filter((c) => c.cmd === "task_add")).toHaveLength(1);
  expect(reloads).toBe(0);
  expect(field.value).toBe("um");
  expect(errors).toEqual(["falhou"]);
});

test("a line that fails comes back to the field with the rest queued, and Enter retries them in order", async () => {
  const field = mount();
  failOn = "dois";
  await paste(field, "um\ndois\ntrês");
  expect(added()).toEqual(["um", "dois"]);
  expect(field.value).toBe("dois");
  expect(errors).toEqual(["falhou"]);
  expect(screen.getByText("2 linhas não entraram; tecle Enter para tentar de novo")).toBeTruthy();
  failOn = "";
  await act(async () => {
    fireEvent.submit(field.closest("form")!);
  });
  expect(added()).toEqual(["um", "dois", "dois", "três"]);
  expect(field.value).toBe("");
});

test("clearing the field drops the queued lines", async () => {
  const field = mount();
  failOn = "um";
  await paste(field, "um\ndois");
  await act(async () => {
    fireEvent.change(field, { target: { value: "" } });
  });
  await act(async () => {
    fireEvent.change(field, { target: { value: "outra" } });
    fireEvent.submit(field.closest("form")!);
  });
  expect(added()).toEqual(["um", "outra"]);
});

test("a paste past the limit creates the first lines and says how many were left out", async () => {
  const field = mount();
  await paste(field, Array.from({ length: PASTE_TASK_LIMIT + 3 }, (_, i) => `t${i}`).join("\n"));
  expect(added()).toHaveLength(PASTE_TASK_LIMIT);
  expect(screen.getByText(`só as primeiras ${PASTE_TASK_LIMIT} linhas viraram tarefas (3 ficaram de fora)`)).toBeTruthy();
});

test("Enter or a second paste while a list is still being created adds nothing out of order", async () => {
  const field = mount();
  let release: () => void = () => {};
  hold = new Promise((r) => (release = r));
  await paste(field, "um\ndois");
  await act(async () => {
    fireEvent.change(field, { target: { value: "no meio" } });
    fireEvent.submit(field.closest("form")!);
    fireEvent.change(field, { target: { value: "" } });
  });
  await paste(field, "x\ny");
  hold = null;
  await act(async () => release());
  expect(added()).toEqual(["um", "dois"]);
  expect(reloads).toBe(1);
});

test("typing a different task over the failed line drops the queued lines", async () => {
  const field = mount();
  failOn = "um";
  await paste(field, "um\ndois");
  failOn = "";
  await act(async () => {
    fireEvent.change(field, { target: { value: "outra coisa" } });
  });
  await act(async () => {
    fireEvent.change(field, { target: { value: "um" } });
    fireEvent.submit(field.closest("form")!);
  });
  expect(added()).toEqual(["um", "um"]);
});
