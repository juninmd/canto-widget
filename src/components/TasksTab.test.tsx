import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

type Call = { cmd: string; args?: Record<string, unknown> };
const calls: Call[] = [];

const baseTask = {
  id: "t1",
  title: "comprar leite",
  done: false,
  day: "2026-09-09",
  created_at: 1,
  updated_at: 1,
};
type Subtask = { id: string; title: string; done: boolean };
type Priority = "low" | "medium" | "high";
type ExtendedRepeat = { tipo: "monthly"; day: number } | { tipo: "specific_days"; days: number[] };
type MockTask = typeof baseTask & {
  pr_url?: string | null;
  subtasks?: Subtask[];
  priority?: Priority | null;
  extended_repeat?: ExtendedRepeat | null;
};
let task: MockTask = { ...baseTask };
let extraTask: MockTask | null = null;
let nextSubtaskId = 0;

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    calls.push({ cmd, args });
    if (cmd === "tasks_for_day") return Promise.resolve(extraTask ? [task, extraTask] : [task]);
    if (cmd === "task_add") return Promise.resolve({ ...task, id: "t2", title: args?.title });
    if (cmd === "item_delete") return Promise.resolve("chave-1");
    if (cmd === "trash_undo") return Promise.resolve(true);
    if (cmd === "task_link_pr") {
      task = { ...task, pr_url: args?.url as string | null };
      return Promise.resolve(null);
    }
    if (cmd === "subtask_add") {
      const sub = { id: `s${nextSubtaskId++}`, title: args?.title as string, done: false };
      task = { ...task, subtasks: [...(task.subtasks ?? []), sub] };
      return Promise.resolve(sub);
    }
    if (cmd === "subtask_toggle") {
      task = {
        ...task,
        subtasks: (task.subtasks ?? []).map((s) => (s.id === args?.subtaskId ? { ...s, done: !s.done } : s)),
      };
      return Promise.resolve(null);
    }
    if (cmd === "subtask_remove") {
      task = { ...task, subtasks: (task.subtasks ?? []).filter((s) => s.id !== args?.subtaskId) };
      return Promise.resolve(null);
    }
    if (cmd === "task_set_priority") {
      task = { ...task, priority: args?.priority as Priority | null };
      return Promise.resolve(null);
    }
    if (cmd === "task_set_extended_repeat") {
      task = { ...task, extended_repeat: args?.repeat as ExtendedRepeat | null };
      return Promise.resolve(null);
    }
    return Promise.resolve(null);
  },
}));

const { default: TasksTab } = await import("./TasksTab");
const { ToastProvider } = await import("../lib/toast");

async function openEditing() {
  render(
    <ToastProvider>
      <TasksTab today="2026-09-09" onError={() => {}} />
    </ToastProvider>,
  );
  await act(async () => {
    await Promise.resolve();
  });
  const target = screen.getByText("comprar leite");
  await act(async () => {
    fireEvent.doubleClick(target);
  });
  return screen.getByDisplayValue("comprar leite") as HTMLInputElement;
}

beforeEach(() => {
  calls.length = 0;
  task = { ...baseTask };
  extraTask = null;
  nextSubtaskId = 0;
});

afterEach(cleanup);

test("Enter confirms the task's new title only once", async () => {
  const input = await openEditing();
  await act(async () => {
    fireEvent.change(input, { target: { value: "comprar cafe" } });
    fireEvent.keyDown(input, { key: "Enter" });
    // The webview fires blur on the input as it leaves the DOM; happy-dom doesn't,
    // so it's simulated here. Without the guard this would write to the vault twice.
    fireEvent.blur(input);
  });

  const renames = calls.filter((c) => c.cmd === "task_rename");
  expect(renames).toHaveLength(1);
  expect(renames[0]?.args).toEqual({ id: "t1", title: "comprar cafe" });
});

test("Esc discards the edit even with the unmount's blur", async () => {
  const input = await openEditing();
  await act(async () => {
    fireEvent.change(input, { target: { value: "titulo descartado" } });
    // Esc swaps the input for the text; the leaving element's blur arrives after and
    // must not save what the user just discarded.
    fireEvent.keyDown(input, { key: "Escape" });
    fireEvent.blur(input);
  });

  expect(calls.some((c) => c.cmd === "task_rename")).toBe(false);
  expect(screen.getByText("comprar leite")).toBeDefined();
});

test("renaming works again after an Esc", async () => {
  const input = await openEditing();
  await act(async () => {
    fireEvent.keyDown(input, { key: "Escape" });
    fireEvent.blur(input);
  });

  const second = screen.getByText("comprar leite");
  await act(async () => {
    fireEvent.doubleClick(second);
  });
  const field = screen.getByDisplayValue("comprar leite");
  await act(async () => {
    fireEvent.change(field, { target: { value: "comprar cha" } });
    fireEvent.keyDown(field, { key: "Enter" });
  });

  expect(calls.find((c) => c.cmd === "task_rename")?.args).toEqual({
    id: "t1",
    title: "comprar cha",
  });
});

test("deleting offers undo with the key returned by the vault", async () => {
  await openEditing();
  fireEvent.keyDown(screen.getByDisplayValue("comprar leite"), { key: "Escape" });
  await act(async () => {
    fireEvent.click(screen.getByLabelText("excluir comprar leite"));
  });
  const toast = await screen.findByText('tarefa "comprar leite" excluída');
  expect(toast).toBeTruthy();

  calls.length = 0;
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "desfazer" }));
  });

  expect(calls).toContainEqual({ cmd: "trash_undo", args: { key: "chave-1" } });
  expect(calls.some((c) => c.cmd === "tasks_for_day"), "the list did not reload after undo").toBe(true);
  expect(screen.queryByText('tarefa "comprar leite" excluída')).toBeNull();
});

async function mount() {
  render(
    <ToastProvider>
      <TasksTab today="2026-09-09" onError={() => {}} />
    </ToastProvider>,
  );
  await act(async () => {
    await Promise.resolve();
  });
}

test("time and repeat save immediately; weekly uses the task's day of week", async () => {
  await mount();
  await act(async () => {
    fireEvent.click(screen.getByLabelText("horário e repetição de comprar leite"));
  });
  await act(async () => {
    fireEvent.change(screen.getByLabelText("horário do lembrete de comprar leite"), { target: { value: "14:30" } });
  });
  expect(calls.find((c) => c.cmd === "task_set_schedule")?.args).toEqual({ id: "t1", time: "14:30", repeat: null });

  calls.length = 0;
  const repeat = screen.getByLabelText("repetir comprar leite") as HTMLSelectElement;
  // 2026-09-09 is a Wednesday: the weekly option must say so and send day 3.
  expect(repeat.textContent).toContain("toda quarta");
  await act(async () => {
    fireEvent.change(repeat, { target: { value: "semanal" } });
  });
  expect(calls.find((c) => c.cmd === "task_set_schedule")?.args?.repeat).toEqual({ tipo: "semanal", dia: 3 });
});

test("monthly recurrence defaults to the task's day of month and can be edited", async () => {
  await mount();
  await act(async () => {
    fireEvent.click(screen.getByLabelText("horário e repetição de comprar leite"));
  });
  const repeat = screen.getByLabelText("repetir comprar leite");
  await act(async () => {
    fireEvent.change(repeat, { target: { value: "mensal" } });
  });
  // 2026-09-09: day of month is 9.
  expect(calls.find((c) => c.cmd === "task_set_extended_repeat")?.args).toEqual({
    id: "t1",
    repeat: { tipo: "monthly", day: 9 },
  });

  calls.length = 0;
  const dayInput = screen.getByLabelText("dia do mês de comprar leite");
  await act(async () => {
    fireEvent.change(dayInput, { target: { value: "31" } });
  });
  expect(calls.find((c) => c.cmd === "task_set_extended_repeat")?.args).toEqual({
    id: "t1",
    repeat: { tipo: "monthly", day: 31 },
  });
});

test("specific weekdays start with today's weekday and toggle, keeping at least one", async () => {
  await mount();
  await act(async () => {
    fireEvent.click(screen.getByLabelText("horário e repetição de comprar leite"));
  });
  await act(async () => {
    fireEvent.change(screen.getByLabelText("repetir comprar leite"), { target: { value: "dias_especificos" } });
  });
  // 2026-09-09 is a Wednesday (3).
  expect(calls.find((c) => c.cmd === "task_set_extended_repeat")?.args).toEqual({
    id: "t1",
    repeat: { tipo: "specific_days", days: [3] },
  });

  calls.length = 0;
  await act(async () => {
    fireEvent.click(screen.getByLabelText("sexta"));
  });
  expect(calls.find((c) => c.cmd === "task_set_extended_repeat")?.args).toEqual({
    id: "t1",
    repeat: { tipo: "specific_days", days: [3, 5] },
  });

  // Removing back down to one day is fine, but the last remaining day can't be toggled off.
  await act(async () => {
    fireEvent.click(screen.getByLabelText("quarta"));
  });
  expect((screen.getByLabelText("sexta") as HTMLButtonElement).disabled).toBe(true);
});

test("picking a legacy repeat option clears any extended repeat, and 'não repete' clears both", async () => {
  task = { ...task, extended_repeat: { tipo: "monthly", day: 9 } };
  await mount();
  await act(async () => {
    fireEvent.click(screen.getByLabelText("horário e repetição de comprar leite"));
  });
  const repeat = screen.getByLabelText("repetir comprar leite") as HTMLSelectElement;
  expect(repeat.value).toBe("mensal");

  await act(async () => {
    fireEvent.change(repeat, { target: { value: "diaria" } });
  });
  expect(calls.find((c) => c.cmd === "task_set_schedule")?.args?.repeat).toEqual({ tipo: "diaria" });

  calls.length = 0;
  await act(async () => {
    fireEvent.change(repeat, { target: { value: "" } });
  });
  expect(calls.find((c) => c.cmd === "task_set_schedule")?.args?.repeat).toBeNull();
  expect(calls.find((c) => c.cmd === "task_set_extended_repeat")?.args?.repeat).toBeNull();
});

test("a PR link is saved on Enter and opens from the badge chip", async () => {
  await mount();
  await act(async () => {
    fireEvent.click(screen.getByLabelText("horário e repetição de comprar leite"));
  });
  const field = screen.getByLabelText("link do PR ou MR de comprar leite");
  await act(async () => {
    fireEvent.change(field, { target: { value: "https://github.com/o/r/pull/1" } });
    fireEvent.keyDown(field, { key: "Enter" });
  });
  expect(calls.find((c) => c.cmd === "task_link_pr")?.args).toEqual({ id: "t1", url: "https://github.com/o/r/pull/1" });

  calls.length = 0;
  await act(async () => {
    fireEvent.click(screen.getByLabelText("abrir PR/MR de comprar leite"));
  });
  expect(calls.find((c) => c.cmd === "open_link")?.args).toEqual({ url: "https://github.com/o/r/pull/1" });
});

test("setting a priority saves it and shows a dot with its label", async () => {
  await mount();
  await act(async () => {
    fireEvent.click(screen.getByLabelText("horário e repetição de comprar leite"));
  });
  const select = screen.getByLabelText("prioridade de comprar leite");
  await act(async () => {
    fireEvent.change(select, { target: { value: "high" } });
  });
  expect(calls.find((c) => c.cmd === "task_set_priority")?.args).toEqual({ id: "t1", priority: "high" });
  expect(screen.getByTitle("prioridade alta")).toBeTruthy();
});

test("filtering by priority hides tasks that don't match", async () => {
  extraTask = { ...baseTask, id: "t3", title: "pagar conta", priority: "low" };
  await mount();
  expect(screen.getByText("pagar conta")).toBeTruthy();

  const filter = screen.getByLabelText("filtrar por prioridade");
  await act(async () => {
    fireEvent.change(filter, { target: { value: "low" } });
  });
  expect(screen.queryByText("comprar leite")).toBeNull();
  expect(screen.getByText("pagar conta")).toBeTruthy();
});

test("dragging a task's grip onto another reorders them", async () => {
  extraTask = { ...baseTask, id: "t3", title: "pagar conta", created_at: 2, updated_at: 2 };
  await mount();
  const grip = screen.getByLabelText("arrastar comprar leite para reordenar");
  const targetRow = screen.getByText("pagar conta").closest("li")!;
  await act(async () => {
    fireEvent.dragStart(grip);
    fireEvent.dragOver(targetRow);
    fireEvent.drop(targetRow);
  });
  expect(calls.find((c) => c.cmd === "tasks_reorder")?.args).toEqual({ day: "2026-09-09", ids: ["t3", "t1"] });
});

test("the drag handle is hidden while a priority filter is active", async () => {
  task = { ...task, priority: "low" };
  await mount();
  expect(screen.queryByLabelText("arrastar comprar leite para reordenar")).toBeTruthy();
  await act(async () => {
    fireEvent.change(screen.getByLabelText("filtrar por prioridade"), { target: { value: "low" } });
  });
  expect(screen.getByText("comprar leite")).toBeTruthy();
  expect(screen.queryByLabelText("arrastar comprar leite para reordenar")).toBeNull();
});

test("clearing the PR field sends null", async () => {
  await mount();
  await act(async () => {
    fireEvent.click(screen.getByLabelText("horário e repetição de comprar leite"));
  });
  const field = screen.getByLabelText("link do PR ou MR de comprar leite") as HTMLInputElement;
  await act(async () => {
    fireEvent.change(field, { target: { value: "https://github.com/o/r/pull/1" } });
    fireEvent.keyDown(field, { key: "Enter" });
  });
  await act(async () => {
    fireEvent.change(field, { target: { value: "" } });
    fireEvent.blur(field);
  });
  expect(calls.filter((c) => c.cmd === "task_link_pr").at(-1)?.args).toEqual({ id: "t1", url: null });
});

test("a subtask is added, toggled and removed from the checklist", async () => {
  await mount();
  await act(async () => {
    fireEvent.click(screen.getByLabelText("horário e repetição de comprar leite"));
  });
  const field = screen.getByLabelText("nova subtarefa");
  await act(async () => {
    fireEvent.change(field, { target: { value: "levar sacola" } });
    fireEvent.submit(field.closest("form")!);
  });
  expect(calls.find((c) => c.cmd === "subtask_add")?.args).toEqual({ id: "t1", title: "levar sacola" });
  expect(screen.getByText("0/1 subtarefas")).toBeTruthy();

  const checkbox = screen.getByLabelText("levar sacola") as HTMLInputElement;
  await act(async () => {
    fireEvent.click(checkbox);
  });
  expect(calls.find((c) => c.cmd === "subtask_toggle")?.args).toEqual({ id: "t1", subtaskId: "s0" });
  expect(screen.getByText("1/1 subtarefas")).toBeTruthy();

  await act(async () => {
    fireEvent.click(screen.getByLabelText("excluir subtarefa levar sacola"));
  });
  expect(calls.find((c) => c.cmd === "subtask_remove")?.args).toEqual({ id: "t1", subtaskId: "s0" });
  expect(screen.queryByText("levar sacola")).toBeNull();
});

test("day summary shows the text and returns with Esc", async () => {
  await mount();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "resumo do dia" }));
  });
  const summary = screen.getByRole("region", { name: "resumo do dia" });
  expect(summary.textContent).toContain("Pendente (1)");
  expect(summary.textContent).toContain("comprar leite");
  await act(async () => {
    fireEvent.keyDown(screen.getByRole("button", { name: "copiar resumo" }), { key: "Escape" });
  });
  expect(screen.queryByRole("region", { name: "resumo do dia" })).toBeNull();
});

test("a time typed in the new task becomes its reminder", async () => {
  render(
    <ToastProvider>
      <TasksTab today="2026-09-09" onError={() => {}} />
    </ToastProvider>,
  );
  const input = screen.getByPlaceholderText(/nova tarefa/);
  await act(async () => {
    fireEvent.change(input, { target: { value: "Daily às 9h30" } });
    fireEvent.submit(input.closest("form")!);
  });
  expect(calls.find((c) => c.cmd === "task_add")?.args).toEqual({ title: "Daily", day: "2026-09-09" });
  expect(calls.find((c) => c.cmd === "task_set_schedule")?.args).toEqual({ id: "t2", time: "09:30", repeat: null });
});

test("a task without a time gets no reminder", async () => {
  render(
    <ToastProvider>
      <TasksTab today="2026-09-09" onError={() => {}} />
    </ToastProvider>,
  );
  const input = screen.getByPlaceholderText(/nova tarefa/);
  await act(async () => {
    fireEvent.change(input, { target: { value: "Estudar 2h de Rust" } });
    fireEvent.submit(input.closest("form")!);
  });
  expect(calls.find((c) => c.cmd === "task_add")?.args?.title).toBe("Estudar 2h de Rust");
  expect(calls.some((c) => c.cmd === "task_set_schedule")).toBe(false);
});

test("the open task pushes its count to the tray badge", async () => {
  render(
    <ToastProvider>
      <TasksTab today="2026-09-09" onError={() => {}} />
    </ToastProvider>,
  );
  await act(async () => {
    await Promise.resolve();
  });
  expect(calls.filter((c) => c.cmd === "badge_set_tasks").at(-1)?.args).toEqual({ count: 1 });
});
