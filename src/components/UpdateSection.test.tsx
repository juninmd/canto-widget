import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

let check: () => Promise<unknown>;
let install: () => Promise<unknown>;
const calls: string[] = [];
let progress: ((e: { payload: unknown }) => void) | null = null;

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string) => {
    calls.push(cmd);
    return cmd === "update_check" ? check() : install();
  },
}));
mock.module("@tauri-apps/api/event", () => ({
  listen: (_event: string, cb: (e: { payload: unknown }) => void) => {
    progress = cb;
    return Promise.resolve(() => {});
  },
}));

const { default: UpdateSection } = await import("./UpdateSection");

const newer = { current: "0.1.0", latest: "0.2.0", available: true, notes: "Correções no clipboard", date: "2026-09-18" };

async function show() {
  render(<UpdateSection />);
  await act(async () => {});
}

beforeEach(() => {
  calls.length = 0;
  progress = null;
  check = () => Promise.resolve(newer);
  install = () => new Promise(() => {});
});
afterEach(cleanup);

test("shows the installed and the newest published version side by side", async () => {
  await show();
  expect(screen.getByText("versão instalada").nextElementSibling?.textContent).toBe("0.1.0");
  expect(screen.getByText("última publicada").nextElementSibling?.textContent).toBe("0.2.0 · 18/09/2026");
  expect(screen.getByText("Correções no clipboard")).toBeDefined();
});

test("up to date still names the published version and offers no install", async () => {
  check = () => Promise.resolve({ ...newer, current: "0.2.0", available: false, notes: "", date: null });
  await show();
  expect(screen.getByText("última publicada").nextElementSibling?.textContent).toBe("0.2.0");
  expect(screen.getByText("Você está na versão mais recente.")).toBeDefined();
  expect(screen.queryByRole("button", { name: /atualizar para/ })).toBeNull();
});

test("a failed check says why and can be retried without leaving the tab", async () => {
  check = () => Promise.reject("nenhuma versão publicada foi encontrada");
  await show();
  expect(screen.getByRole("alert").textContent).toStartWith("Não foi possível verificar:");
  check = () => Promise.resolve(newer);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "verificar agora" }));
  });
  expect(screen.queryByRole("alert")).toBeNull();
  expect(calls.filter((c) => c === "update_check").length).toBe(2);
});

test("installing shows download progress from the backend", async () => {
  await show();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "atualizar para 0.2.0 e reiniciar" }));
  });
  await act(async () => progress?.({ payload: { downloaded: 450, total: 1000 } }));
  expect(screen.getByRole("button", { name: "baixando… 45%" }).hasAttribute("disabled")).toBe(true);
  expect(calls).toContain("update_install");
});

test("a rejected signature is reported and the user can try again", async () => {
  install = () => Promise.reject("o instalador baixado não confere com a assinatura do projeto e foi descartado");
  await show();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "atualizar para 0.2.0 e reiniciar" }));
  });
  expect(screen.getByRole("alert").textContent).toBe(
    "A atualização não foi instalada: o instalador baixado não confere com a assinatura do projeto e foi descartado",
  );
  expect(screen.getByRole("button", { name: "atualizar para 0.2.0 e reiniciar" }).hasAttribute("disabled")).toBe(false);
});
