import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const calls: string[] = [];
const resized: number[] = [];
const emitted: { event: string; payload?: unknown }[] = [];
let payload: unknown[] = [];
let pending: unknown[] = [];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: { height?: number }) => {
    calls.push(cmd);
    if (cmd === "alert_resize" && args?.height) resized.push(args.height);
    return Promise.resolve(cmd === "alert_payload" ? payload : cmd === "alert_settle" ? pending : null);
  },
}));
const listeners: Record<string, () => void> = {};
mock.module("@tauri-apps/api/event", () => ({
  listen: (event: string, cb: () => void) => {
    listeners[event] = cb;
    return Promise.resolve(() => {});
  },
  emit: (event: string, p?: unknown) => {
    emitted.push({ event, payload: p });
    return Promise.resolve();
  },
}));

const { default: AlertWindow } = await import("./AlertWindow");

const alert = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  title: "pagar boleto",
  start: "2026-09-09T09:00:00-03:00",
  end: "",
  all_day: false,
  location: "",
  meet: "",
  link: "",
  ...extra,
});

const settle = () => act(async () => void (await Promise.resolve()));

beforeEach(() => {
  calls.length = 0;
  resized.length = 0;
  emitted.length = 0;
  payload = [];
  pending = [];
});
afterEach(cleanup);

test("reads the pending alerts without needing an unlocked vault", async () => {
  payload = [alert("task:t1")];
  render(<AlertWindow />);
  await settle();
  expect(screen.getByRole("alertdialog")).toBeTruthy();
  expect(calls).toEqual(expect.arrayContaining(["alert_payload"]));
  expect(calls.some((c) => c.startsWith("vault_"))).toBe(false);
});

test("an overlay left with no card asks Rust to hide its invisible window", async () => {
  payload = [alert("task:t1")];
  render(<AlertWindow />);
  await settle();
  calls.length = 0;
  fireEvent.click(screen.getByRole("button", { name: "fechar" }));
  await settle();
  expect(screen.queryByRole("alertdialog")).toBeNull();
  expect(calls).toEqual(expect.arrayContaining(["alert_close", "alert_settle"]));
});

test("an alert Rust still holds comes back instead of leaving an empty window up", async () => {
  payload = [alert("task:t1")];
  render(<AlertWindow />);
  await settle();
  pending = [alert("status:s1", { title: "GitHub fora do ar" })];
  fireEvent.click(screen.getByRole("button", { name: "fechar" }));
  await settle();
  expect(screen.getByRole("alertdialog")).toBeTruthy();
});

test("rings again when Rust announces another alert", async () => {
  render(<AlertWindow />);
  await settle();
  expect(screen.queryByRole("alertdialog")).toBeNull();
  payload = [alert("task:t1")];
  await act(async () => listeners["canto://alert"]());
  await settle();
  expect(screen.getByRole("alertdialog")).toBeTruthy();
});

test("completing a task tells the widget window to reread its list", async () => {
  payload = [alert("task:t1")];
  render(<AlertWindow />);
  await settle();
  fireEvent.click(screen.getByRole("button", { name: "concluir tarefa" }));
  await settle();
  expect(emitted.map((e) => e.event)).toContain("canto://tasks-changed");
});

test("opening the models tab shows the widget and asks it to switch", async () => {
  payload = [alert("model:aurora", { tag: "#3" })];
  render(<AlertWindow />);
  await settle();
  fireEvent.click(screen.getByRole("button", { name: "abrir aba Modelos" }));
  await settle();
  expect(emitted).toContainEqual({ event: "canto://open-tab", payload: "models" });
  expect(calls).toContain("main_show");
});

test("fechar todos fecha a fila inteira numa chamada só", async () => {
  payload = [alert("task:t1"), alert("status:s1"), alert("model:m1", { tag: "#1" })];
  render(<AlertWindow />);
  await settle();
  expect(screen.getByRole("alertdialog")).toBeTruthy();

  // O "fechar todos" fica sempre visível, com quantos avisos leva junto.
  const all = screen.getByRole("button", { name: "fechar todos" });
  expect(all.textContent).toContain("3");
  fireEvent.click(all);
  await settle();
  expect(calls).toContain("alert_close_all");
  expect(screen.queryByRole("alertdialog")).toBeNull();
});

test("um aviso sozinho não oferece fechar todos", async () => {
  payload = [alert("task:t1")];
  render(<AlertWindow />);
  await settle();
  expect(screen.getByRole("button", { name: "fechar" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "fechar todos" }) === null).toBe(true);
});

test("a janela do aviso pede a altura do cartão ao Rust", async () => {
  const observers: ResizeObserverCallback[] = [];
  const original = globalThis.ResizeObserver;
  globalThis.ResizeObserver = class {
    constructor(cb: ResizeObserverCallback) {
      observers.push(cb);
    }
    observe() {}
    disconnect() {}
    unobserve() {}
  } as unknown as typeof ResizeObserver;
  try {
    payload = [alert("task:t1")];
    render(<AlertWindow />);
    await settle();
    // The card's layout height, even while the entry animation still has it scaled down.
    const entry = { borderBoxSize: [{ blockSize: 147.4, inlineSize: 420 }] } as unknown as ResizeObserverEntry;
    observers.forEach((cb) => cb([entry], {} as ResizeObserver));
    await settle();
    expect(resized).toEqual([148]);
  } finally {
    globalThis.ResizeObserver = original;
  }
});

test("a descrição do aviso é renderizada como markdown", async () => {
  payload = [alert("mention:m1", { description: "@ana: **importante** olhar `lib.rs`\n\n- primeiro\n  - aninhado" })];
  render(<AlertWindow />);
  await settle();
  const dialog = screen.getByRole("alertdialog");
  expect(dialog.querySelector("strong")?.textContent).toBe("importante");
  expect(dialog.querySelector("code")?.textContent).toBe("lib.rs");
  // A nested list keeps its text: dropping the token would silently eat the line.
  expect([...dialog.querySelectorAll("li")].map((li) => li.textContent)).toEqual(["primeiroaninhado", "aninhado"]);
});

test("uma linha sozinha na descrição continua sendo uma linha", async () => {
  // O resumo do dia e vários avisos mandam uma linha por item; sem `breaks` o markdown juntaria tudo.
  payload = [alert("digest:d1", { description: "3 reuniões, a primeira às 09:30\n2 tarefas abertas" })];
  render(<AlertWindow />);
  await settle();
  const dialog = screen.getByRole("alertdialog");
  expect(dialog.querySelectorAll("br")).toHaveLength(1);
  expect(dialog.textContent).toContain("3 reuniões");
});

test("um link do markdown abre no navegador pelo mesmo caminho dos outros", async () => {
  payload = [alert("mention:m1", { description: "veja [o PR](https://github.com/acme/atlas/pull/1)" })];
  render(<AlertWindow />);
  await settle();
  fireEvent.click(screen.getByRole("button", { name: "o PR" }));
  await settle();
  expect(calls).toContain("open_link");
});
