import { afterEach, beforeEach, expect, jest, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

type Chamada = { cmd: string; args?: Record<string, unknown> };
const chamadas: Chamada[] = [];
let itensDaAgenda: unknown[] = [];
let lembretes: unknown[] | null = null;

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    chamadas.push({ cmd, args });
    switch (cmd) {
      case "vault_status":
        return Promise.resolve({ exists: true, unlocked: true });
      case "agenda_today":
        return Promise.resolve(itensDaAgenda);
      case "tasks_lembretes":
        return Promise.resolve(lembretes);
      case "alerta_payload":
        return Promise.resolve({ ...reuniaoEm(0), id: "tarefa:t1", titulo: "pagar boleto", meet: "" });
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
const ouvintes: Record<string, () => void> = {};
mock.module("@tauri-apps/api/event", () => ({
  listen: (evento: string, cb: () => void) => {
    ouvintes[evento] = cb;
    return Promise.resolve(() => {});
  },
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
  lembretes = null;
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

test("lembrete de tarefa abre o aviso no horario, uma vez so", async () => {
  const agora = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  const { todayLocal } = await import("./lib/api");
  lembretes = [
    { id: "t1", title: "tomar remédio", done: false, day: todayLocal(agora), created_at: 1, updated_at: 1, hora: `${p(agora.getHours())}:${p(agora.getMinutes())}` },
  ];
  render(<App />);
  await assentar();
  await act(async () => {
    jest.advanceTimersByTime(60_000);
    await Promise.resolve();
  });

  const avisos = chamadas.filter((c) => c.cmd === "alerta_abrir");
  expect(avisos).toHaveLength(1);
  expect((avisos[0]?.args?.evento as { id: string }).id).toBe("tarefa:t1");
});

test("Alt+2 vai para notas e ? abre a ajuda de atalhos, que fecha com Esc", async () => {
  render(<App />);
  await assentar();

  await act(async () => {
    fireEvent.keyDown(window, { key: "2", code: "Digit2", altKey: true });
  });
  expect(screen.getByRole("tab", { name: "Notas" }).getAttribute("aria-selected")).toBe("true");

  await act(async () => {
    fireEvent.keyDown(document.body, { key: "?" });
  });
  const dialogo = screen.getByRole("dialog", { name: "Atalhos de teclado" });
  expect(screen.getByLabelText("Alt + L")).toBeTruthy();
  expect(dialogo.textContent).toContain("trancar o cofre");
  await act(async () => {
    fireEvent.keyDown(screen.getByRole("button", { name: "fechar" }), { key: "Escape" });
  });
  expect(screen.queryByRole("dialog")).toBeNull();
});

test("N fora de campo de texto leva o foco para nova tarefa", async () => {
  render(<App />);
  await assentar();
  await act(async () => {
    fireEvent.keyDown(document.body, { key: "n" });
  });
  expect((document.activeElement as HTMLInputElement).placeholder).toBe("nova tarefa de hoje");
});

test("Tab dentro da ajuda de atalhos nao escapa do modal", async () => {
  render(<App />);
  await assentar();
  await act(async () => {
    fireEvent.keyDown(document.body, { key: "?" });
  });
  const fechar = screen.getByRole("button", { name: "fechar" });
  await act(async () => {
    fireEvent.keyDown(fechar, { key: "Tab" });
  });
  expect(document.activeElement).toBe(fechar);
});

test("concluir pelo aviso de tarefa atualiza a lista aberta", async () => {
  render(<App />);
  await assentar();
  const leituras = () => chamadas.filter((c) => c.cmd === "tasks_for_day").length;
  const antes = leituras();
  await act(async () => ouvintes["canto://alerta"]());
  await assentar();
  fireEvent.click(screen.getByRole("button", { name: "concluir tarefa" }));
  await assentar();
  expect(chamadas.some((c) => c.cmd === "task_concluir")).toBe(true);
  expect(leituras(), "a aba seguiria mostrando a tarefa como aberta").toBeGreaterThan(antes);
});
