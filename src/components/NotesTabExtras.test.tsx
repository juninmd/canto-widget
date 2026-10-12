import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

type Call = { cmd: string; args?: Record<string, unknown> };
const calls: Call[] = [];
let notes: unknown[] = [];
let search: Promise<unknown> | null = null;

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    calls.push({ cmd, args });
    if (cmd === "notes_search" && search) return search;
    if (cmd === "notes_search") return Promise.resolve({ total: notes.length, items: notes });
    if (cmd === "note_pin") return Promise.resolve(true);
    return Promise.resolve(null);
  },
}));

const { default: NotesTab } = await import("./NotesTab");
const { ToastProvider } = await import("../lib/toast");

const note = {
  id: "n1",
  title: "wifi",
  body: "senha",
  tags: ["casa"],
  created_at: 1,
  updated_at: 1,
  fixada: false,
  link: { kind: "task", id: "t1", label: "pagar conta" },
};

async function mount(privacy = false) {
  render(
    <ToastProvider>
      <NotesTab today="2026-09-09" privacy={privacy} onOpenTasks={() => {}} onOpenAgenda={() => {}} onError={() => {}} />
    </ToastProvider>,
  );
  await act(async () => {
    await new Promise((ready) => setTimeout(ready, 250));
  });
}

async function openEditor() {
  await mount();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "novo card" }));
  });
  return screen.findByPlaceholderText("título");
}

beforeEach(() => {
  calls.length = 0;
  notes = [];
  search = null;
});
afterEach(cleanup);

test("a skeleton shows instead of the empty state until the first search answers", async () => {
  let release: (v: unknown) => void = () => {};
  search = new Promise((r) => (release = r));
  await mount();
  expect(screen.getByRole("status", { name: "carregando os cards" })).toBeTruthy();
  expect(screen.queryByText(/nenhum card salvo/)).toBeNull();
  search = null;
  await act(async () => release({ total: 0, items: [] }));
  expect(screen.getByText(/nenhum card salvo/)).toBeTruthy();
});

test("Esc on an untouched card closes at once; with typing it asks first and can keep editing", async () => {
  const title = await openEditor();
  await act(async () => {
    fireEvent.change(title, { target: { value: "rascunho" } });
    fireEvent.keyDown(title, { key: "Escape" });
  });
  expect(screen.getByText("Descartar o que foi escrito neste card?")).toBeTruthy();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "continuar editando" }));
  });
  expect((screen.getByPlaceholderText("título") as HTMLInputElement).value).toBe("rascunho");

  await act(async () => {
    fireEvent.change(screen.getByPlaceholderText("título"), { target: { value: "" } });
    fireEvent.keyDown(screen.getByPlaceholderText("título"), { key: "Escape" });
  });
  expect(screen.queryByPlaceholderText("título")).toBeNull();
});

test("saving an empty card is refused with a visible reason", async () => {
  const title = await openEditor();
  const save = screen.getByRole("button", { name: "salvar" });
  expect(save.getAttribute("aria-disabled")).toBe("true");
  await act(async () => {
    fireEvent.keyDown(title, { key: "Enter", ctrlKey: true });
  });
  expect(screen.getAllByRole("alert").map((a) => a.textContent)).toContain("escreva um título ou o conteúdo para salvar");
  expect(calls.some((c) => c.cmd === "note_save")).toBe(false);
});

test("pinning confirms on screen, not only to screen readers", async () => {
  notes = [note];
  await mount();
  await act(async () => {
    fireEvent.click(screen.getByLabelText("fixar wifi no topo"));
    await Promise.resolve();
  });
  expect(screen.getByText(/fixada no topo/).className).not.toContain("sr-only");
});

test("a #tag search shows a chip that clears the filter", async () => {
  notes = [note];
  await mount();
  expect(screen.queryByRole("button", { name: /limpar o filtro/ })).toBeNull();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "#casa" }));
    await new Promise((ready) => setTimeout(ready, 250));
  });
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "limpar o filtro #casa" }));
    await new Promise((ready) => setTimeout(ready, 250));
  });
  expect((screen.getByLabelText("buscar notas") as HTMLInputElement).value).toBe("");
  expect(screen.queryByRole("button", { name: /limpar o filtro/ })).toBeNull();
});

test("privacy mode also blurs the tags and the link label", async () => {
  notes = [note];
  await mount(true);
  expect(screen.getByRole("button", { name: "#casa" }).className).toContain("blur-sm");
  expect(screen.getByText("pagar conta").closest("button")?.className).toContain("blur-sm");
});

test("the formatting bar moves focus with the arrow keys and carries no emoji", async () => {
  await openEditor();
  const bar = screen.getByRole("toolbar", { name: "formatação" });
  expect(bar.textContent).not.toMatch(/[\u{1F300}-\u{1FAFF}☑]/u);
  const [first, second] = [...bar.querySelectorAll("button")];
  first!.focus();
  await act(async () => {
    fireEvent.keyDown(first!, { key: "ArrowRight" });
  });
  expect(document.activeElement).toBe(second!);
});
