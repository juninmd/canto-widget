import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

type Call = { cmd: string; args?: Record<string, unknown> };
const calls: Call[] = [];
const mk = (id: string, title: string, done = false) => ({ id, title, done, day: "2026-09-09", created_at: 1, updated_at: 1 });
let list = [mk("t1", "comprar leite")];
let pending: Promise<unknown> | null = null;
let failing = "";
let carried = 0;

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    calls.push({ cmd, args });
    if (cmd === failing) return Promise.reject("falhou");
    if (cmd === "tasks_for_day") return pending ?? Promise.resolve(list);
    if (cmd === "task_add") return Promise.resolve(mk("t9", String(args?.title)));
    if (cmd === "item_delete") return Promise.resolve(`chave-${args?.id}`);
    if (cmd === "trash_undo") return Promise.resolve(true);
    if (cmd === "tasks_carry_over") return Promise.resolve(carried);
    return Promise.resolve(null);
  },
}));

const { default: TasksTab } = await import("./TasksTab");
const { ToastProvider } = await import("../lib/toast");

const errors: string[] = [];
async function mount() {
  render(
    <ToastProvider>
      <TasksTab today="2026-09-09" onError={(m) => errors.push(m)} />
    </ToastProvider>,
  );
  await act(async () => {
    await Promise.resolve();
  });
}

beforeEach(() => {
  calls.length = 0;
  errors.length = 0;
  list = [mk("t1", "comprar leite")];
  pending = null;
  failing = "";
  carried = 0;
});
afterEach(cleanup);

test("a skeleton shows instead of the empty state until the first load answers", async () => {
  let release: (v: unknown) => void = () => {};
  pending = new Promise((r) => (release = r));
  list = [];
  await mount();
  expect(screen.getByRole("status", { name: "carregando as tarefas" })).toBeTruthy();
  expect(screen.queryByText(/nada para hoje/)).toBeNull();
  pending = null;
  await act(async () => release([]));
  expect(screen.queryByRole("status", { name: "carregando as tarefas" })).toBeNull();
  expect(screen.getByText(/nada para hoje/)).toBeTruthy();
  expect(screen.getByText(/"!alta" a prioridade/)).toBeTruthy();
});

test("a failed priority after the task was created clears the field and reloads, so a retry cannot duplicate", async () => {
  await mount();
  failing = "task_set_priority";
  const field = screen.getByPlaceholderText(/nova tarefa/) as HTMLInputElement;
  await act(async () => {
    fireEvent.change(field, { target: { value: "relatorio !alta" } });
    fireEvent.submit(field.closest("form")!);
  });
  expect(field.value).toBe("");
  expect(calls.filter((c) => c.cmd === "task_add")).toHaveLength(1);
  expect(calls.at(-1)?.cmd).toBe("tasks_for_day");
  expect(errors).toEqual(["falhou"]);
});

test("carry over reports how many tasks came to today", async () => {
  carried = 2;
  await mount();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "ações da lista" }));
  });
  await act(async () => {
    fireEvent.click(screen.getByRole("menuitem", { name: "puxar pendências" }));
  });
  expect(await screen.findByText("2 pendências trazidas para hoje")).toBeTruthy();
});

test("Delete on a focused row removes it with undo; typing in a field does not", async () => {
  await mount();
  const check = screen.getAllByLabelText("comprar leite").find((el) => (el as HTMLInputElement).type === "checkbox")!;
  await act(async () => {
    fireEvent.keyDown(check, { key: "Delete" });
  });
  expect(calls.filter((c) => c.cmd === "item_delete")).toEqual([{ cmd: "item_delete", args: { id: "t1" } }]);
  expect(await screen.findByText('tarefa "comprar leite" excluída')).toBeTruthy();
});

test("Backspace inside the rename field edits text instead of deleting the task", async () => {
  await mount();
  await act(async () => {
    fireEvent.doubleClick(screen.getAllByText("comprar leite").at(-1)!);
  });
  const input = screen.getByLabelText("novo título de comprar leite") as HTMLInputElement;
  expect(input.maxLength).toBe(300);
  await act(async () => {
    fireEvent.keyDown(input, { key: "Backspace" });
  });
  expect(calls.some((c) => c.cmd === "item_delete")).toBe(false);
});

test("renaming to an empty title says why nothing was saved", async () => {
  await mount();
  await act(async () => {
    fireEvent.doubleClick(screen.getAllByText("comprar leite").at(-1)!);
  });
  const input = screen.getByLabelText("novo título de comprar leite");
  await act(async () => {
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter" });
  });
  expect(errors).toEqual(["o título não pode ficar vazio"]);
  expect(calls.some((c) => c.cmd === "task_rename")).toBe(false);
});

test("clearing the done tasks deletes them all and one undo brings them back", async () => {
  list = [mk("t1", "aberta"), mk("t2", "feita um", true), mk("t3", "feita dois", true)];
  await mount();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "ações da lista" }));
  });
  await act(async () => {
    fireEvent.click(screen.getByRole("menuitem", { name: "limpar concluídas" }));
  });
  expect(calls.filter((c) => c.cmd === "item_delete").map((c) => c.args?.id)).toEqual(["t2", "t3"]);
  expect(await screen.findByText("2 tarefas concluídas excluídas")).toBeTruthy();

  calls.length = 0;
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "desfazer" }));
  });
  expect(calls.filter((c) => c.cmd === "trash_undo").map((c) => c.args?.key)).toEqual(["chave-t2", "chave-t3"]);
  expect(calls.at(-1)?.cmd).toBe("tasks_for_day");
});

test("the clear button only exists when something is done", async () => {
  await mount();
  fireEvent.click(screen.getByRole("button", { name: "ações da lista" }));
  expect(screen.getByRole("menuitem", { name: "puxar pendências" })).toBeTruthy();
  expect(screen.queryByRole("menuitem", { name: "limpar concluídas" })).toBeNull();
});
