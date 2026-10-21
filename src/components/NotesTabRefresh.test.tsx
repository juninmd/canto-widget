import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";

type Call = { cmd: string; args?: Record<string, unknown> };
const calls: Call[] = [];
const mk = (id: string, title: string, tags: string[], extra: Record<string, unknown> = {}) => ({
  id,
  title,
  body: `corpo de ${title}`,
  tags,
  created_at: 1,
  updated_at: 1,
  ...extra,
});
const all = [
  mk("n1", "Ideias de onboarding", ["produto", "ux"], { fixada: true }),
  mk("n2", "Retro da sprint", ["time"]),
  mk("n3", "Comandos do git", ["dev", "produto"]),
];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    calls.push({ cmd, args });
    if (cmd === "notes_search") {
      const q = String(args?.query ?? "").trim().toLowerCase();
      const items = all.filter((n) => !q || (q.startsWith("#") ? n.tags.includes(q.slice(1)) : n.title.toLowerCase().includes(q)));
      return Promise.resolve({ total: items.length, items });
    }
    return Promise.resolve(null);
  },
}));

const { default: NotesTab } = await import("./NotesTab");
const { ToastProvider } = await import("../lib/toast");

async function settle() {
  await act(async () => {
    await new Promise((ready) => setTimeout(ready, 250));
  });
}

async function mount() {
  render(
    <ToastProvider>
      <NotesTab today="2026-09-09" privacy={false} onOpenTasks={() => {}} onOpenAgenda={() => {}} onError={() => {}} />
    </ToastProvider>,
  );
  await settle();
}

const chipRow = () => within(screen.getByRole("group", { name: "filtrar por tag" }));
const searches = () => calls.filter((c) => c.cmd === "notes_search").map((c) => c.args?.query);

beforeEach(() => {
  calls.length = 0;
  localStorage.clear();
});
afterEach(cleanup);

test("a chip per tag shows its count, and Todas counts every card", async () => {
  await mount();
  expect(chipRow().getByRole("button", { name: "todas, 3 cards" }).getAttribute("aria-pressed")).toBe("true");
  expect(chipRow().getByRole("button", { name: "#produto, 2 cards" })).toBeTruthy();
  expect(chipRow().getByRole("button", { name: "#dev, 1 cards" })).toBeTruthy();
});

test("a tag chip runs the same search as typing #tag, and Todas clears it", async () => {
  await mount();
  await act(async () => {
    fireEvent.click(chipRow().getByRole("button", { name: "#produto, 2 cards" }));
  });
  await settle();
  const search = screen.getByRole("searchbox", { name: "buscar notas" }) as HTMLInputElement;
  expect(search.value).toBe("#produto");
  expect(searches().at(-1)).toBe("#produto");
  expect(screen.getAllByText("Comandos do git")).toHaveLength(1);
  expect(screen.queryByText("Retro da sprint")).toBeNull();

  // The other chips stay: the counts come from the unfiltered list, not the narrowed one.
  const produto = chipRow().getByRole("button", { name: "#produto, 2 cards" });
  expect(produto.getAttribute("aria-pressed")).toBe("true");
  expect(chipRow().getByRole("button", { name: "#time, 1 cards" }).getAttribute("aria-pressed")).toBe("false");
  expect(chipRow().getByRole("button", { name: "todas, 3 cards" }).getAttribute("aria-pressed")).toBe("false");

  await act(async () => {
    fireEvent.click(chipRow().getByRole("button", { name: "todas, 3 cards" }));
  });
  await settle();
  expect(search.value).toBe("");
  expect(searches().at(-1)).toBe("");
  expect(screen.getByText("Retro da sprint")).toBeTruthy();
});

test("pinned and recent cards sit under their own labels", async () => {
  await mount();
  const labels = [...document.querySelectorAll('li[aria-hidden="true"]')].map((li) => li.textContent);
  expect(labels).toEqual(["fixadas", "recentes"]);
});

test("the list/grid toggle switches to two columns, remembers it, and a reload restores it", async () => {
  await mount();
  const list = document.querySelector("ul")!;
  expect(list.className).not.toContain("grid-cols-2");
  const view = within(screen.getByRole("group", { name: "visualização dos cards" }));
  expect(view.getByRole("button", { name: "lista" }).getAttribute("aria-pressed")).toBe("true");

  await act(async () => {
    fireEvent.click(view.getByRole("button", { name: "grade" }));
  });
  expect(document.querySelector("ul")!.className).toContain("grid-cols-2");
  expect(view.getByRole("button", { name: "grade" }).getAttribute("aria-pressed")).toBe("true");
  expect(localStorage.getItem("canto.notesView")).toBe("grid");

  cleanup();
  await mount();
  expect(document.querySelector("ul")!.className).toContain("grid-cols-2");
});

test("a search that finds nothing says so, hints at what to do and clears in one click", async () => {
  await mount();
  const search = screen.getByRole("searchbox", { name: "buscar notas" }) as HTMLInputElement;
  await act(async () => {
    fireEvent.change(search, { target: { value: "#inexistente" } });
  });
  await settle();
  expect(screen.getByText("nenhum card encontrado")).toBeTruthy();
  expect(screen.getByText("tente outra tag ou limpe a busca")).toBeTruthy();

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "limpar busca" }));
  });
  await settle();
  expect(search.value).toBe("");
  expect(screen.getByText("Retro da sprint")).toBeTruthy();
});
