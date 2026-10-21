import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";

type Call = { cmd: string; args?: Record<string, unknown> };
const calls: Call[] = [];
const mk = (id: string, title: string, extra: Record<string, unknown> = {}) => ({
  id,
  title,
  done: false,
  day: "2026-09-09",
  created_at: 1,
  updated_at: 1,
  ...extra,
});
let list: ReturnType<typeof mk>[] = [];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    calls.push({ cmd, args });
    if (cmd === "tasks_for_day") return Promise.resolve(list);
    if (cmd === "task_add") return Promise.resolve(mk("t9", String(args?.title)));
    return Promise.resolve(null);
  },
}));

const { default: TasksTab } = await import("./TasksTab");
const { ToastProvider } = await import("../lib/toast");

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

const filter = () => within(screen.getByRole("group", { name: "filtrar por prioridade" }));
const field = () => screen.getByPlaceholderText(/nova tarefa/) as HTMLInputElement;
// The "now" card repeats the first open task; the row is the last match.
const row = (title: string) => screen.getAllByText(title).at(-1)!.closest("li")!;
const chips = () => within(screen.getByRole("group", { name: "atalhos de digitação" }));

beforeEach(() => {
  calls.length = 0;
  list = [];
});
afterEach(cleanup);

test("progress is a ring with the count beside it, readable as a progressbar", async () => {
  list = [mk("t1", "aberta"), mk("t2", "feita", { done: true }), mk("t3", "outra feita", { done: true })];
  await mount();
  const bar = screen.getByRole("progressbar", { name: "2/3 concluídas" });
  expect(bar.getAttribute("aria-valuenow")).toBe("2");
  expect(bar.getAttribute("aria-valuemax")).toBe("3");
  expect(bar.querySelector("svg")).not.toBeNull();
  expect(screen.getByText("2 de 3")).toBeTruthy();
});

test("the priority filter is a segmented control, not a select", async () => {
  list = [mk("t1", "pagar conta", { priority: "low" }), mk("t2", "ligar pro banco", { priority: "high" })];
  await mount();
  expect(screen.queryByRole("combobox", { name: "filtrar por prioridade" })).toBeNull();
  expect(filter().getByRole("button", { name: "todas" }).getAttribute("aria-pressed")).toBe("true");

  await act(async () => {
    fireEvent.click(filter().getByRole("button", { name: "alta" }));
  });
  expect(filter().getByRole("button", { name: "alta" }).getAttribute("aria-pressed")).toBe("true");
  expect(filter().getByRole("button", { name: "todas" }).getAttribute("aria-pressed")).toBe("false");
  expect(screen.queryAllByText("pagar conta")).toHaveLength(0);
  expect(screen.queryAllByText("ligar pro banco").length).toBeGreaterThan(0);

  await act(async () => {
    fireEvent.click(filter().getByRole("button", { name: "todas" }));
  });
  expect(screen.queryAllByText("pagar conta").length).toBeGreaterThan(0);
});

test("the day summary and carry-over live in a menu that opens on the first item and closes with Esc", async () => {
  await mount();
  expect(screen.queryByRole("button", { name: "resumo do dia" })).toBeNull();
  const trigger = screen.getByRole("button", { name: "ações da lista" });
  expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
  expect(trigger.getAttribute("aria-expanded")).toBe("false");

  await act(async () => {
    fireEvent.click(trigger);
  });
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  const items = screen.getAllByRole("menuitem");
  expect(items.map((i) => i.textContent)).toEqual(["resumo do dia", "puxar pendências"]);
  expect(document.activeElement).toBe(items[0]);

  await act(async () => {
    fireEvent.keyDown(items[0]!, { key: "ArrowDown" });
  });
  expect(document.activeElement).toBe(items[1]);
  await act(async () => {
    fireEvent.keyDown(items[1]!, { key: "ArrowDown" });
  });
  expect(document.activeElement).toBe(items[0]);

  await act(async () => {
    fireEvent.keyDown(items[0]!, { key: "Escape" });
  });
  expect(screen.queryByRole("menu")).toBeNull();
  expect(document.activeElement).toBe(trigger);
});

test("the quick-add chips put the parser's tokens into the field and the task is created with them", async () => {
  await mount();
  await act(async () => {
    fireEvent.change(field(), { target: { value: "Daily" } });
  });
  await act(async () => {
    fireEvent.click(chips().getByRole("button", { name: "!alta" }));
  });
  expect(field().value).toBe("Daily !alta");
  expect(document.activeElement).toBe(field());

  await act(async () => {
    fireEvent.click(chips().getByRole("button", { name: "!baixa" }));
  });
  expect(field().value).toBe("Daily !baixa");

  await act(async () => {
    fireEvent.click(chips().getByRole("button", { name: "hora" }));
  });
  expect(field().value).toBe("Daily !baixa 9:00");
  expect(field().value.slice(field().selectionStart ?? 0, field().selectionEnd ?? 0)).toBe("9:00");

  await act(async () => {
    fireEvent.submit(field().closest("form")!);
  });
  expect(calls.find((c) => c.cmd === "task_add")?.args).toEqual({ title: "Daily", day: "2026-09-09" });
  expect(calls.find((c) => c.cmd === "task_set_priority")?.args).toEqual({ id: "t9", priority: "low" });
  expect(calls.find((c) => c.cmd === "task_set_schedule")?.args).toMatchObject({ id: "t9", time: "09:00" });
});

test("a row shows its priority as a pill next to the bar", async () => {
  list = [mk("t1", "ligar pro banco", { priority: "high" }), mk("t2", "sem prioridade")];
  await mount();
  const pill = within(row("ligar pro banco")).getByText("alta");
  expect(pill.className).toContain("text-danger");
  expect(within(row("sem prioridade")).queryByText("alta")).toBeNull();
});

test("finished tasks stay folded behind a counted header until it is opened", async () => {
  list = [mk("t1", "aberta"), mk("t2", "feita um", { done: true }), mk("t3", "feita dois", { done: true })];
  await mount();
  const header = screen.getByRole("button", { name: "concluídas · 2" });
  expect(header.getAttribute("aria-expanded")).toBe("false");
  expect(screen.queryByText("feita um")).toBeNull();
  expect(screen.queryAllByText("aberta").length).toBeGreaterThan(0);

  await act(async () => {
    fireEvent.click(header);
  });
  expect(header.getAttribute("aria-expanded")).toBe("true");
  expect(screen.getByText("feita um")).toBeTruthy();
  expect(screen.getByText("feita dois")).toBeTruthy();

  await act(async () => {
    fireEvent.click(header);
  });
  expect(screen.queryByText("feita um")).toBeNull();
});

test("ticking a task folds it into the done group and focus moves to the next row", async () => {
  list = [mk("t1", "primeira"), mk("t2", "segunda")];
  await mount();
  const check = screen.getAllByLabelText("primeira").find((el) => (el as HTMLInputElement).type === "checkbox")!;
  (check as HTMLElement).focus();
  list = [mk("t1", "primeira", { done: true }), mk("t2", "segunda")];
  await act(async () => {
    fireEvent.click(check);
  });
  await act(async () => {
    await new Promise((r) => setTimeout(r, 5));
  });
  expect(screen.queryByText("primeira")).toBeNull();
  expect(screen.getByRole("button", { name: "concluídas · 1" })).toBeTruthy();
  expect(document.activeElement?.getAttribute("aria-label")).toBe("segunda");
});

test("row actions are reachable by keyboard even while hidden until hover", async () => {
  list = [mk("t1", "primeira")];
  await mount();
  const remove = screen.getByRole("button", { name: "excluir primeira" });
  expect(remove.parentElement!.className).toContain("focus-within:opacity-100");
  expect(remove.parentElement!.className).toContain("[@media(hover:none)]:opacity-100");
  expect(remove.tabIndex).toBe(0);
});
