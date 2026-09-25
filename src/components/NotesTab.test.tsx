import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

type Call = { cmd: string; args?: Record<string, unknown> };
const calls: Call[] = [];
let notes: unknown[] = [];
let search: ((args: Record<string, unknown>) => Promise<unknown>) | null = null;

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    calls.push({ cmd, args });
    if (cmd === "notes_search" && search) return search(args ?? {});
    if (cmd === "notes_search") {
      const limit = (args?.limit as number) ?? notes.length;
      return Promise.resolve({ total: notes.length, items: notes.slice(0, limit) });
    }
    if (cmd === "note_pin") return Promise.resolve(true);
    if (cmd === "note_export_md") return Promise.resolve("C:\\fake\\wifi.md");
    return Promise.resolve(null);
  },
}));

const { default: NotesTab } = await import("./NotesTab");
const { ToastProvider } = await import("../lib/toast");

async function openEditor() {
  render(
    <ToastProvider>
      <NotesTab today="2026-09-09" privacy={false} onOpenTasks={() => {}} onOpenAgenda={() => {}} onError={() => {}} />
    </ToastProvider>,
  );
  // The list search is debounced 150ms; let it settle inside act so the editor opens with no pending update.
  await act(async () => {
    await new Promise((ready) => setTimeout(ready, 250));
  });
  await act(async () => {
    fireEvent.click(screen.getByText("+"));
  });
  return screen.getByPlaceholderText("título");
}

beforeEach(() => {
  calls.length = 0;
  notes = [];
  search = null;
});

afterEach(cleanup);

test("Ctrl+Enter saves the card without going through the button", async () => {
  const title = await openEditor();
  await act(async () => {
    fireEvent.change(title, { target: { value: "ideia solta" } });
    fireEvent.keyDown(title, { key: "Enter", ctrlKey: true });
    await Promise.resolve();
  });

  const saved = calls.find((c) => c.cmd === "note_save");
  expect(saved?.args?.title).toBe("ideia solta");
});

test("Enter alone does not save", async () => {
  const title = await openEditor();
  await act(async () => {
    fireEvent.change(title, { target: { value: "ideia solta" } });
    fireEvent.keyDown(title, { key: "Enter" });
    await Promise.resolve();
  });

  expect(calls.some((c) => c.cmd === "note_save")).toBe(false);
});

test("Esc cancels the editor and discards the draft", async () => {
  const title = await openEditor();
  await act(async () => {
    fireEvent.change(title, { target: { value: "nao quero isto" } });
    fireEvent.keyDown(title, { key: "Escape" });
    await Promise.resolve();
  });

  expect(calls.some((c) => c.cmd === "note_save")).toBe(false);
  // Back to the list, and reopening the editor brings a clean field.
  await act(async () => {
    fireEvent.click(screen.getByText("+"));
  });
  expect((screen.getByPlaceholderText("título") as HTMLInputElement).value).toBe("");
});

async function listWith(note: Record<string, unknown>) {
  notes = [{ id: "n1", title: "wifi", body: "senha", tags: ["casa"], created_at: 1, updated_at: 1, fixada: false, ...note }];
  render(
    <ToastProvider>
      <NotesTab today="2026-09-09" privacy={false} onOpenTasks={() => {}} onOpenAgenda={() => {}} onError={() => {}} />
    </ToastProvider>,
  );
  await act(async () => {
    await new Promise((ready) => setTimeout(ready, 250));
  });
}

test("clicking the tag filters by the exact tag", async () => {
  await listWith({});
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "#casa" }));
    await new Promise((ready) => setTimeout(ready, 250));
  });
  expect((screen.getByLabelText("buscar notas") as HTMLInputElement).value).toBe("#casa");
  expect(calls.some((c) => c.cmd === "notes_search" && c.args?.query === "#casa")).toBe(true);
});

test("pinning asks the vault, reloads, and announces it to the screen reader", async () => {
  await listWith({});
  const before = calls.filter((c) => c.cmd === "notes_search").length;
  await act(async () => {
    fireEvent.click(screen.getByLabelText("fixar wifi no topo"));
    await Promise.resolve();
  });
  expect(calls.find((c) => c.cmd === "note_pin")?.args).toEqual({ id: "n1" });
  expect(calls.filter((c) => c.cmd === "notes_search").length).toBeGreaterThan(before);
  expect(screen.getByText(/fixada no topo/).getAttribute("role")).toBe("status");
});

test("exporting asks the vault for a path and announces where it was saved", async () => {
  await listWith({});
  await act(async () => {
    fireEvent.click(screen.getByLabelText("exportar wifi como markdown"));
    await Promise.resolve();
  });
  expect(calls.find((c) => c.cmd === "note_export_md")?.args).toEqual({ id: "n1" });
  expect(screen.getByText(/exportada em C:\\fake\\wifi\.md/).getAttribute("role")).toBe("status");
});

test("typing a search term highlights it inside the visible cards", async () => {
  await listWith({});
  await act(async () => {
    fireEvent.change(screen.getByLabelText("buscar notas"), { target: { value: "wifi" } });
    await new Promise((ready) => setTimeout(ready, 250));
  });
  const mark = document.querySelector("mark");
  expect(mark?.textContent).toBe("wifi");
});

test("privacy mode blurs the title and body without hiding the card", async () => {
  notes = [{ id: "n1", title: "wifi", body: "senha", tags: [], created_at: 1, updated_at: 1, fixada: false }];
  render(
    <ToastProvider>
      <NotesTab today="2026-09-09" privacy={true} onOpenTasks={() => {}} onOpenAgenda={() => {}} onError={() => {}} />
    </ToastProvider>,
  );
  await act(async () => {
    await new Promise((ready) => setTimeout(ready, 250));
  });
  expect(screen.getByText("wifi").className).toContain("blur-sm");
  expect(screen.getByText("senha").className).toContain("blur-sm");
});

test("a pinned note shows the pin without depending on hover", async () => {
  await listWith({ fixada: true });
  const pin = screen.getByLabelText("desafixar wifi");
  expect(pin.getAttribute("aria-pressed")).toBe("true");
  expect(pin.className).not.toContain("opacity-0");
});

test("a large vault renders one page and loads the rest on demand", async () => {
  notes = Array.from({ length: 120 }, (_, i) => ({ id: `n${i}`, title: `nota ${i}`, body: "", tags: [], created_at: i, updated_at: i }));
  render(
    <ToastProvider>
      <NotesTab today="2026-09-09" privacy={false} onOpenTasks={() => {}} onOpenAgenda={() => {}} onError={() => {}} />
    </ToastProvider>,
  );
  await act(async () => {
    await new Promise((ready) => setTimeout(ready, 250));
  });
  expect(screen.getAllByText(/^nota \d+$/).length).toBe(50);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "mostrar mais (70 restantes)" }));
    await Promise.resolve();
  });
  expect(screen.getAllByText(/^nota \d+$/).length).toBe(100);
  expect(calls.at(-1)?.args).toEqual({ query: "", limit: 100 });
});

test("a slow reply for an older search never replaces the results of the newer one", async () => {
  const note = (title: string) => ({ id: title, title, body: "", tags: [], created_at: 1, updated_at: 1 });
  const wait = (ms: number) => new Promise((ready) => setTimeout(ready, ms));
  search = async (args) => {
    if (args.query === "a") await wait(400);
    return { total: 1, items: [note(args.query === "a" ? "111" : args.query === "ab" ? "222" : "000")] };
  };
  render(
    <ToastProvider>
      <NotesTab today="2026-09-09" privacy={false} onOpenTasks={() => {}} onOpenAgenda={() => {}} onError={() => {}} />
    </ToastProvider>,
  );
  await act(async () => {
    await wait(250);
    fireEvent.change(screen.getByLabelText("buscar notas"), { target: { value: "a" } });
    await wait(200);
    fireEvent.change(screen.getByLabelText("buscar notas"), { target: { value: "ab" } });
    await wait(600);
  });
  expect(screen.getByText("222")).toBeTruthy();
  expect(screen.queryByText("111")).toBeNull();
});
