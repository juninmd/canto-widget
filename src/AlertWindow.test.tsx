import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const calls: string[] = [];
const emitted: { event: string; payload?: unknown }[] = [];
let payload: unknown[] = [];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string) => {
    calls.push(cmd);
    return Promise.resolve(cmd === "alert_payload" ? payload : null);
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
  emitted.length = 0;
  payload = [];
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

  // O "fechar todos" mora atrás do chevron colado ao "fechar".
  fireEvent.click(screen.getByRole("button", { name: "mais opções de fechar" }));
  await settle();
  fireEvent.click(screen.getByRole("menuitem", { name: "fechar todos" }));
  await settle();
  expect(calls).toContain("alert_close_all");
  expect(screen.queryByRole("alertdialog")).toBeNull();
});

test("um aviso sozinho não oferece fechar todos", async () => {
  payload = [alert("task:t1")];
  render(<AlertWindow />);
  await settle();
  expect(screen.getByRole("button", { name: "fechar" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "mais opções de fechar" })).toBeNull();
});

test("o chevron abre e fecha o menu sem fechar o aviso", async () => {
  payload = [alert("task:t1"), alert("status:s1")];
  render(<AlertWindow />);
  await settle();
  const chevron = screen.getByRole("button", { name: "mais opções de fechar" });
  expect(chevron.getAttribute("aria-expanded")).toBe("false");

  fireEvent.click(chevron);
  await settle();
  expect(chevron.getAttribute("aria-expanded")).toBe("true");
  fireEvent.keyDown(chevron.parentElement as Element, { key: "Escape" });
  await settle();
  expect(screen.queryByRole("menuitem", { name: "fechar todos" })).toBeNull();
  expect(calls).not.toContain("alert_close");
  expect(screen.getByRole("alertdialog")).toBeTruthy();
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
