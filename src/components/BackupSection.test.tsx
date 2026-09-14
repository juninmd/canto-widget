import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

let respostas: Record<string, () => Promise<unknown>> = {};

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string) => (respostas[cmd] ?? (() => Promise.resolve(null)))(),
}));

const { default: BackupSection } = await import("./BackupSection");

async function clicar(rotulo: string, onError = (_: string) => {}) {
  render(<BackupSection onError={onError} />);
  await act(async () => {
    fireEvent.click(screen.getByText(rotulo));
  });
}

beforeEach(() => {
  respostas = {};
});

afterEach(cleanup);

test("cancelar o dialogo nao vira erro nem mensagem de sucesso", async () => {
  const erros: string[] = [];
  respostas.backup_exportar = () => Promise.resolve(null);
  await clicar("exportar", (m) => erros.push(m));
  expect(erros).toEqual([]);
  expect(screen.queryByText(/backup salvo/)).toBeNull();
});

test("importar mostra quanto o cofre tem depois da mescla", async () => {
  respostas.backup_importar = () => Promise.resolve({ tarefas: 3, notas: 2 });
  await clicar("importar");
  expect(screen.getByText(/3 tarefas e 2 notas/)).toBeTruthy();
});

test("senha diferente chega ao usuario pela faixa de erro", async () => {
  const erros: string[] = [];
  respostas.backup_importar = () => Promise.reject("o backup foi criado com outra senha mestra");
  await clicar("importar", (m) => erros.push(m));
  expect(erros).toEqual(["o backup foi criado com outra senha mestra"]);
  expect(screen.queryByText(/mesclado/)).toBeNull();
});
