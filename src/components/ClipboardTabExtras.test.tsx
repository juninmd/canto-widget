import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";

type Call = { cmd: string; args?: Record<string, unknown> };
const calls: Call[] = [];
const clip = (id: string, preview: string, pinned = false) => ({ id, preview, chars: preview.length, kept: preview.length, truncated: false, copied_at: 1, pinned });
let items = [clip("c1", "primeiro"), clip("c2", "segundo"), clip("c3", "fixado", true)];
let listing: (() => Promise<unknown>) | null = null;

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    calls.push({ cmd, args });
    if (cmd === "clip_list") return listing ? listing() : Promise.resolve({ items, max_pinned: 100 });
    if (cmd === "clip_clear") return Promise.resolve("chave-limpar");
    return Promise.resolve(null);
  },
}));

const { default: ClipboardTab } = await import("./ClipboardTab");
const { ToastProvider } = await import("../lib/toast");

const errors: string[] = [];
const listCalls = () => calls.filter((c) => c.cmd === "clip_list").length;
async function show(wait = 200) {
  render(
    <ToastProvider>
      <ClipboardTab privacy={false} onError={(m) => errors.push(m)} />
    </ToastProvider>,
  );
  await act(async () => {
    await new Promise((r) => setTimeout(r, wait));
  });
}

beforeEach(() => {
  calls.length = 0;
  errors.length = 0;
  items = [clip("c1", "primeiro"), clip("c2", "segundo"), clip("c3", "fixado", true)];
  listing = null;
  try {
    localStorage.clear();
  } catch {
    // Storage may be unavailable; the tests that need it assert on it separately.
  }
});
afterEach(cleanup);

test("a skeleton shows instead of the empty state until the first list answers", async () => {
  let release: (v: unknown) => void = () => {};
  listing = () => new Promise((r) => (release = r));
  await show();
  expect(screen.getByRole("status", { name: "carregando o histórico" })).toBeTruthy();
  expect(screen.queryByText(/copie algo/)).toBeNull();
  listing = null;
  await act(async () => release({ items: [], max_pinned: 100 }));
  expect(screen.getByText(/copie algo/)).toBeTruthy();
});

async function openClear() {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "ações do clipboard" }));
  });
  await act(async () => {
    fireEvent.click(screen.getByRole("menuitem", { name: "Limpar histórico…" }));
  });
}

test("clear asks first, with the count and the pinned items that stay", async () => {
  await show();
  await openClear();
  expect(calls.some((c) => c.cmd === "clip_clear")).toBe(false);
  const ask = screen.getByText(/Limpar 2 itens/).closest("[role=alert]")!;
  expect(ask.textContent).toContain("Limpar 2 itens do histórico?");
  expect(ask.textContent).toContain("Os 1 fixados são mantidos.");

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "cancelar" }));
  });
  expect(screen.queryByText(/Limpar 2 itens/)).toBeNull();
  expect(calls.some((c) => c.cmd === "clip_clear")).toBe(false);

  await openClear();
  await act(async () => {
    fireEvent.click(within(screen.getByText(/Limpar 2 itens/).closest("[role=alert]") as HTMLElement).getByRole("button", { name: "limpar" }));
  });
  expect(calls.some((c) => c.cmd === "clip_clear")).toBe(true);
});

test("the same poll failure is reported once, not every 2.5 seconds", async () => {
  listing = () => Promise.reject("sem acesso");
  await show(150);
  await act(async () => {
    await new Promise((r) => setTimeout(r, 5200));
  });
  expect(listCalls()).toBeGreaterThan(2);
  expect(errors).toEqual(["sem acesso"]);
}, 10_000);

test("the poll stops while the window is hidden and resumes when it is back", async () => {
  Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
  try {
    await show(2800);
    expect(listCalls()).toBe(0);
    Object.defineProperty(document, "hidden", { configurable: true, get: () => false });
    await act(async () => void document.dispatchEvent(new Event("visibilitychange")));
    await act(async () => void (await new Promise((r) => setTimeout(r, 250))));
    expect(listCalls()).toBeGreaterThan(0);
  } finally {
    delete (document as unknown as Record<string, unknown>).hidden;
  }
});

test("the history notice can be dismissed and stays dismissed", async () => {
  await show();
  expect(screen.getByText(/fora do backup/)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "ocultar este aviso" }));
  expect(screen.queryByText(/fora do backup/)).toBeNull();
  cleanup();
  await show();
  expect(screen.queryByText(/fora do backup/)).toBeNull();
});

test("copying a second item restarts the flash instead of the first timer cutting it short", async () => {
  await show();
  const copy = async (text: string) =>
    act(async () => {
      fireEvent.click(screen.getByText(text));
      await Promise.resolve();
    });
  await copy("primeiro");
  await act(async () => void (await new Promise((r) => setTimeout(r, 800))));
  await copy("segundo");
  await act(async () => void (await new Promise((r) => setTimeout(r, 600))));
  expect(screen.getAllByRole("status").some((s) => s.textContent === "copiado ✓")).toBe(true);
});
