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
    if (cmd === "item_delete") return Promise.resolve("chave-1");
    if (cmd === "lixeira_desfazer") return Promise.resolve(true);
    return Promise.resolve(null);
  },
}));

const { default: TasksTab } = await import("./TasksTab");
const { ToastProvider } = await import("../lib/toast");

async function abrirEdicao() {
  render(
    <ToastProvider>
      <TasksTab today="2026-09-09" onError={() => {}} />
    </ToastProvider>,
  );
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

test("excluir oferece desfazer com a chave devolvida pelo cofre", async () => {
  await abrirEdicao();
  fireEvent.keyDown(screen.getByDisplayValue("comprar leite"), { key: "Escape" });
  await act(async () => {
    fireEvent.click(screen.getByLabelText("excluir comprar leite"));
  });
  const aviso = await screen.findByText('tarefa "comprar leite" excluída');
  expect(aviso).toBeTruthy();

  chamadas.length = 0;
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "desfazer" }));
  });

  expect(chamadas).toContainEqual({ cmd: "lixeira_desfazer", args: { chave: "chave-1" } });
  expect(chamadas.some((c) => c.cmd === "tasks_for_day"), "lista nao recarregou apos desfazer").toBe(true);
  expect(screen.queryByText('tarefa "comprar leite" excluída')).toBeNull();
});

async function montar() {
  render(
    <ToastProvider>
      <TasksTab today="2026-09-09" onError={() => {}} />
    </ToastProvider>,
  );
  await act(async () => {
    await Promise.resolve();
  });
}

test("horario e repeticao gravam na hora; semanal usa o dia da semana da tarefa", async () => {
  await montar();
  await act(async () => {
    fireEvent.click(screen.getByLabelText("horário e repetição de comprar leite"));
  });
  await act(async () => {
    fireEvent.change(screen.getByLabelText("horário do lembrete de comprar leite"), { target: { value: "14:30" } });
  });
  expect(chamadas.find((c) => c.cmd === "task_set_detalhes")?.args).toEqual({ id: "t1", hora: "14:30", repetir: null });

  chamadas.length = 0;
  const repetir = screen.getByLabelText("repetir comprar leite") as HTMLSelectElement;
  // 2026-09-09 e quarta-feira: a opcao semanal precisa dizer isso e mandar dia 3.
  expect(repetir.textContent).toContain("toda quarta");
  await act(async () => {
    fireEvent.change(repetir, { target: { value: "semanal" } });
  });
  expect(chamadas.find((c) => c.cmd === "task_set_detalhes")?.args?.repetir).toEqual({ tipo: "semanal", dia: 3 });
});

test("resumo do dia mostra o texto e volta com Esc", async () => {
  await montar();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "resumo do dia" }));
  });
  const resumo = screen.getByRole("region", { name: "resumo do dia" });
  expect(resumo.textContent).toContain("Pendente (1)");
  expect(resumo.textContent).toContain("comprar leite");
  await act(async () => {
    fireEvent.keyDown(screen.getByRole("button", { name: "copiar resumo" }), { key: "Escape" });
  });
  expect(screen.queryByRole("region", { name: "resumo do dia" })).toBeNull();
});
