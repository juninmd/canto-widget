import { afterEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

type Deferred = { resolve: (v: unknown) => void };
let notesQueue: Deferred[] = [];
let notesArgs: unknown[] = [];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    if (cmd === "notes_search") {
      notesArgs.push(args);
      return new Promise((resolve) => notesQueue.push({ resolve }));
    }
    if (cmd === "tasks_for_day") return Promise.resolve([]);
    if (cmd === "clip_list") return Promise.resolve({ items: [], max_pinned: 0 });
    return Promise.resolve(null);
  },
}));

const { default: GlobalSearch } = await import("./GlobalSearch");

afterEach(() => {
  cleanup();
  notesQueue = [];
  notesArgs = [];
});

async function wait(ms: number) {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
}

function mount() {
  render(<GlobalSearch today="2026-09-20" privacy={false} onNavigate={() => {}} onClose={() => {}} onError={() => {}} />);
  return screen.getByPlaceholderText("buscar em tarefas de hoje, notas e clipboard");
}

test("a stale search response never overwrites a newer query's results", async () => {
  const input = mount();

  fireEvent.change(input, { target: { value: "primeira" } });
  await wait(200); // debounce fires: first notes_search call, index 0

  fireEvent.change(input, { target: { value: "segunda" } });
  await wait(200); // debounce fires again: second notes_search call, index 1

  expect(notesArgs.length).toBe(2);

  // Resolve out of order: the newer query answers first, the stale one answers late.
  await act(async () => {
    notesQueue[1].resolve({
      total: 1,
      items: [{ id: "n2", title: "nota da segunda busca", body: "", tags: [], created_at: 1, updated_at: 1 }],
    });
  });
  await act(async () => {
    notesQueue[0].resolve({
      total: 1,
      items: [{ id: "n1", title: "nota da primeira busca", body: "", tags: [], created_at: 1, updated_at: 1 }],
    });
  });

  expect(screen.getByText("nota da segunda busca")).toBeTruthy();
  expect(screen.queryByText("nota da primeira busca")).toBeNull();
});

test("clearing the query drops previous results instead of waiting for them", async () => {
  const input = mount();

  fireEvent.change(input, { target: { value: "algo" } });
  await wait(200);
  expect(notesArgs.length).toBe(1);

  fireEvent.change(input, { target: { value: "" } });
  await act(async () => {
    notesQueue[0].resolve({
      total: 1,
      items: [{ id: "n1", title: "nota tardia", body: "", tags: [], created_at: 1, updated_at: 1 }],
    });
  });

  expect(screen.queryByText("nota tardia")).toBeNull();
  expect(screen.getByText("digite para buscar nas três abas ao mesmo tempo")).toBeTruthy();
});
