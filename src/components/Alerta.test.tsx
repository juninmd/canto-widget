import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { AgendaItem } from "../lib/api";

const chamadas: string[] = [];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string) => {
    chamadas.push(cmd);
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
