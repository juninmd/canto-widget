import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { AgendaItem } from "../lib/api";

const chamadas: string[] = [];
const argumentos: Record<string, unknown>[] = [];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    chamadas.push(cmd);
    argumentos.push(args ?? {});
    return Promise.resolve(null);
  },
}));

const { default: Alerta } = await import("./Alerta");

const evento: AgendaItem = {
  id: "e1",
  titulo: "Daily",
  inicio: "2026-09-09T09:00:00-03:00",
  fim: "2026-09-09T09:15:00-03:00",
  dia_inteiro: false,
  local: "",
  meet: "https://meet.google.com/aaa-bbbb-ccc",
  link: "",
};

beforeEach(() => {
  chamadas.length = 0;
  argumentos.length = 0;
});

afterEach(cleanup);

test("Esc fecha o alerta e libera o overlay no Rust", async () => {
  let fechou = false;
  await act(async () => {
    render(<Alerta evento={evento} onFechar={() => { fechou = true; }} />);
  });

  await act(async () => {
    fireEvent.keyDown(window, { key: "Escape" });
  });

  expect(fechou).toBe(true);
  expect(chamadas).toContain("alerta_fechar");
});

test("o foco cai na acao principal, nao no botao de fechar", async () => {
  await act(async () => {
    render(<Alerta evento={evento} onFechar={() => {}} />);
  });

  expect(document.activeElement?.textContent).toBe("entrar no Meet");
});

test("o listener de Esc sai junto com o alerta", async () => {
  const { unmount } = render(<Alerta evento={evento} onFechar={() => {}} />);
  await act(async () => {});
  await act(async () => {
    unmount();
  });
  chamadas.length = 0;
  argumentos.length = 0;

  await act(async () => {
    fireEvent.keyDown(window, { key: "Escape" });
  });

  expect(chamadas).toHaveLength(0);
});

test("nao abre o Meet sozinho, so no clique", async () => {
  await act(async () => {
    render(<Alerta evento={evento} onFechar={() => {}} />);
  });
  expect(chamadas).not.toContain("abrir_link");

  await act(async () => {
    fireEvent.click(screen.getByText("entrar no Meet"));
  });
  expect(chamadas).toContain("abrir_link");
});

test("lembrete de tarefa conclui a tarefa certa direto do aviso", async () => {
  const { comoEvento } = await import("../lib/lembretes");
  const lembrete = comoEvento({ id: "t9", title: "tomar remédio", done: false, day: "2026-09-14", created_at: 1, updated_at: 1, hora: "08:30" });
  let fechou = false;
  await act(async () => {
    render(<Alerta evento={lembrete} onFechar={() => { fechou = true; }} />);
  });
  expect(screen.getByText("lembrete de tarefa")).toBeTruthy();
  expect(screen.queryByText("entrar no Meet")).toBeNull();
  const concluir = screen.getByRole("button", { name: "concluir tarefa" });
  expect(document.activeElement).toBe(concluir);
  await act(async () => {
    fireEvent.click(concluir);
  });
  expect(argumentos[chamadas.indexOf("task_concluir")]).toEqual({ id: "t9" });
  expect(chamadas).toContain("alerta_fechar");
  expect(fechou).toBe(true);
});
