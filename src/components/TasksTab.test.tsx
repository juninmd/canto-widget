import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

type Chamada = { cmd: string; args?: Record<string, unknown> };
const chamadas: Chamada[] = [];

const tarefa = {
  id: "t1",
  title: "comprar leite",
  done: false,
  day: "2026-09-09",
  created_at: 1,
  updated_at: 1,
};

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    chamadas.push({ cmd, args });
    if (cmd === "tasks_for_day") return Promise.resolve([tarefa]);
    return Promise.resolve(null);
  },
}));

const { default: TasksTab } = await import("./TasksTab");

async function abrirEdicao() {
  render(<TasksTab today="2026-09-09" onError={() => {}} />);
  await act(async () => {
    await Promise.resolve();
  });
  const alvo = screen.getByText("comprar leite");
  await act(async () => {
    fireEvent.doubleClick(alvo);
  });
  return screen.getByDisplayValue("comprar leite") as HTMLInputElement;
}

beforeEach(() => {
  chamadas.length = 0;
});

afterEach(cleanup);

test("Enter confirma o novo titulo da tarefa uma unica vez", async () => {
  const input = await abrirEdicao();
  await act(async () => {
    fireEvent.change(input, { target: { value: "comprar cafe" } });
    fireEvent.keyDown(input, { key: "Enter" });
    // O webview dispara blur no input que sai do DOM; o happy-dom nao, entao
    // simulamos aqui. Sem a trava isso gravava o cofre duas vezes.
    fireEvent.blur(input);
  });

  const renomeacoes = chamadas.filter((c) => c.cmd === "task_rename");
  expect(renomeacoes).toHaveLength(1);
  expect(renomeacoes[0]?.args).toEqual({ id: "t1", title: "comprar cafe" });
});

test("Esc descarta a edicao mesmo com o blur do desmonte", async () => {
  const input = await abrirEdicao();
  await act(async () => {
    fireEvent.change(input, { target: { value: "titulo descartado" } });
    // Esc troca o input pelo texto; o blur do elemento que sai chega depois e
    // nao pode salvar o que o usuario acabou de descartar.
    fireEvent.keyDown(input, { key: "Escape" });
    fireEvent.blur(input);
  });

  expect(chamadas.some((c) => c.cmd === "task_rename")).toBe(false);
  expect(screen.getByText("comprar leite")).toBeDefined();
});

test("renomear volta a funcionar depois de um Esc", async () => {
  const input = await abrirEdicao();
  await act(async () => {
    fireEvent.keyDown(input, { key: "Escape" });
    fireEvent.blur(input);
  });

  const segundo = screen.getByText("comprar leite");
  await act(async () => {
    fireEvent.doubleClick(segundo);
  });
  const campo = screen.getByDisplayValue("comprar leite");
  await act(async () => {
    fireEvent.change(campo, { target: { value: "comprar cha" } });
    fireEvent.keyDown(campo, { key: "Enter" });
  });

  expect(chamadas.find((c) => c.cmd === "task_rename")?.args).toEqual({
    id: "t1",
    title: "comprar cha",
  });
});
