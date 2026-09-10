import { afterEach, beforeEach, expect, jest, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, render } from "@testing-library/react";

type Chamada = { cmd: string; args?: Record<string, unknown> };
const chamadas: Chamada[] = [];
let itensDaAgenda: unknown[] = [];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    chamadas.push({ cmd, args });
    switch (cmd) {
      case "vault_status":
        return Promise.resolve({ exists: true, unlocked: true });
      case "agenda_today":
        return Promise.resolve(itensDaAgenda);
      case "tasks_for_day":
      case "notes_search":
      case "clip_list":
      case "transcripts_list":
        return Promise.resolve([]);
      case "drive_status":
        return Promise.resolve({ configured: false, connected: false, email: "" });
      default:
        return Promise.resolve(null);
    }
  },
}));
mock.module("@tauri-apps/api/window", () => ({
  getCurrentWindow: () => ({ hide: () => Promise.resolve() }),
}));
mock.module("@tauri-apps/api/event", () => ({
  listen: () => Promise.resolve(() => {}),
}));

const { default: App } = await import("./App");

const reuniaoEm = (minutos: number) => ({
  id: "reuniao-1",
  titulo: "Daily",
  inicio: new Date(Date.now() + minutos * 60_000).toISOString(),
  fim: new Date(Date.now() + (minutos + 30) * 60_000).toISOString(),
  dia_inteiro: false,
  local: "",
  meet: "https://meet.google.com/aaa-bbbb-ccc",
  link: "",
});

/** Deixa o React resolver as promessas dos comandos antes de seguir. */
async function assentar() {
  for (let i = 0; i < 5; i++) {
    await act(async () => {
      await Promise.resolve();
    });
  }
}

beforeEach(() => {
  chamadas.length = 0;
  itensDaAgenda = [];
  // Antes do render: o relogio do aviso e criado na montagem do App.
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
  cleanup();
});

test("avisa da reuniao com o usuario na aba de tarefas", async () => {
  itensDaAgenda = [reuniaoEm(0.5)];
  render(<App />);
  await assentar();

  // Nenhuma aba foi trocada: o widget abre em "tarefas".
  expect(chamadas.some((c) => c.cmd === "tasks_for_day")).toBe(true);
  expect(chamadas.some((c) => c.cmd === "agenda_today")).toBe(true);
  expect(chamadas.some((c) => c.cmd === "alerta_abrir")).toBe(false);

  await act(async () => {
    jest.advanceTimersByTime(30_000);
    await Promise.resolve();
  });

  const alerta = chamadas.find((c) => c.cmd === "alerta_abrir");
  expect(alerta, "o pop-up so dispara com a aba agenda montada").toBeDefined();
  expect((alerta?.args?.evento as { id: string }).id).toBe("reuniao-1");
});

test("nao avisa duas vezes da mesma reuniao", async () => {
  itensDaAgenda = [reuniaoEm(0.5)];
  render(<App />);
  await assentar();

  await act(async () => {
    jest.advanceTimersByTime(120_000);
    await Promise.resolve();
  });

  expect(chamadas.filter((c) => c.cmd === "alerta_abrir")).toHaveLength(1);
});

test("reuniao distante nao dispara pop-up", async () => {
  itensDaAgenda = [reuniaoEm(45)];
  render(<App />);
  await assentar();

  await act(async () => {
    jest.advanceTimersByTime(120_000);
    await Promise.resolve();
  });

  expect(chamadas.some((c) => c.cmd === "alerta_abrir")).toBe(false);
});
