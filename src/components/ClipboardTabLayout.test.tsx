import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";

type Call = { cmd: string; args?: Record<string, unknown> };
const calls: Call[] = [];
const clip = (id: string, preview: string, pinned = false) => ({ id, preview, chars: preview.length, kept: preview.length, truncated: false, copied_at: 1, pinned });
let items = [clip("c1", "primeiro"), clip("c2", "segundo"), clip("c3", "fixado", true)];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    calls.push({ cmd, args });
    if (cmd === "clip_list") return Promise.resolve({ items, max_pinned: 100 });
    return Promise.resolve(null);
  },
}));

const { default: ClipboardTab } = await import("./ClipboardTab");
const { ToastProvider } = await import("../lib/toast");

async function show() {
  render(
    <ToastProvider>
      <ClipboardTab privacy={false} onError={() => {}} />
    </ToastProvider>,
  );
  await act(async () => {
    await new Promise((r) => setTimeout(r, 200));
  });
}

beforeEach(() => {
  calls.length = 0;
  items = [clip("c1", "primeiro"), clip("c2", "segundo"), clip("c3", "fixado", true)];
  try {
    localStorage.clear();
  } catch {
    // Storage may be unavailable; the badge then simply shows.
  }
});
afterEach(cleanup);

test("clear lives in the more-actions menu, which announces itself and closes on Escape", async () => {
  await show();
  expect(screen.queryByRole("button", { name: "limpar" })).toBeNull();
  const more = screen.getByRole("button", { name: "mais ações do clipboard" });
  expect(more.getAttribute("aria-haspopup")).toBe("menu");
  expect(more.getAttribute("aria-expanded")).toBe("false");
  await act(async () => {
    fireEvent.click(more);
  });
  expect(more.getAttribute("aria-expanded")).toBe("true");
  expect(screen.getByRole("menu")).toBeTruthy();
  await act(async () => {
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
  });
  expect(screen.queryByRole("menu")).toBeNull();
  expect(document.activeElement).toBe(more);
  expect(calls.some((c) => c.cmd === "clip_clear")).toBe(false);
});

test("the menu's clear entry is off when there is nothing to remove", async () => {
  items = [clip("c3", "fixado", true)];
  await show();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "mais ações do clipboard" }));
  });
  expect((screen.getByRole("menuitem", { name: "Limpar histórico…" }) as HTMLButtonElement).disabled).toBe(true);
});

test("pinned items come first under their own label, the rest under Recentes", async () => {
  await show();
  const pinned = screen.getByRole("heading", { name: "Fixados" }).closest("section")!;
  const recent = screen.getByRole("heading", { name: "Recentes" }).closest("section")!;
  expect(within(pinned).getByText("fixado")).toBeTruthy();
  expect(within(pinned).queryByText("primeiro")).toBeNull();
  expect(within(recent).getByText("primeiro")).toBeTruthy();
  expect(within(recent).getByText("segundo")).toBeTruthy();
  expect(pinned.compareDocumentPosition(recent) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

test("a list without pinned items has no Fixados label", async () => {
  items = [clip("c1", "primeiro")];
  await show();
  expect(screen.queryByRole("heading", { name: "Fixados" })).toBeNull();
  expect(screen.getByRole("heading", { name: "Recentes" })).toBeTruthy();
});

test("the history notice is a one-line lock badge that keeps the full sentence as its title", async () => {
  await show();
  const badge = screen.getByText("Cifrado no cofre, fora do backup").closest("p")!;
  expect(badge.getAttribute("title")).toBe("Histórico local e cifrado — nunca entra no backup");
});

test("clicking anywhere on the card copies it through the card's stretched button", async () => {
  await show();
  await act(async () => {
    fireEvent.click(screen.getAllByTitle("clique para copiar de novo")[0]);
  });
  expect(calls.some((c) => c.cmd === "clip_copy")).toBe(true);
});

test("the pin and delete actions stay in the tab order and are at least 24px targets", async () => {
  await show();
  const card = screen.getByText("primeiro").closest("li")!;
  const pin = within(card).getByRole("button", { name: "fixar no histórico" });
  const del = within(card).getByRole("button", { name: "excluir do histórico" });
  for (const b of [pin, del]) {
    expect(b.className).toContain("canto-hit");
    expect(b.tabIndex).toBe(0);
    expect(b.closest("span")!.className).toContain("group-focus-within:opacity-100");
  }
});
