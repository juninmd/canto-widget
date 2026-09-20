import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

type Call = { cmd: string; args?: Record<string, unknown> };
const calls: Call[] = [];

const task = {
  id: "t1",
  title: "comprar leite",
  done: false,
  day: "2026-09-09",
  created_at: 1,
  updated_at: 1,
};

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    calls.push({ cmd, args });
    if (cmd === "tasks_for_day") return Promise.resolve([task]);
    if (cmd === "task_add") return Promise.resolve({ ...task, id: "t2", title: args?.title });
    if (cmd === "item_delete") return Promise.resolve("chave-1");
    if (cmd === "trash_undo") return Promise.resolve(true);
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
