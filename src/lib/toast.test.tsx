import { afterEach, expect, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ToastProvider, useToast, type Aviso } from "./toast";

let avisar: (a: Aviso) => void = () => {};
function Captura() {
  avisar = useToast();
  return null;
}

const montar = (duracaoMs = 40) =>
  render(
    <ToastProvider duracaoMs={duracaoMs}>
      <Captura />
    </ToastProvider>,
  );

const esperar = (ms: number) => act(() => new Promise((r) => setTimeout(r, ms)));

afterEach(cleanup);

test("aviso comum some sozinho depois do prazo", async () => {
  montar();
  act(() => avisar({ texto: "card excluído" }));
  expect(screen.getByText("card excluído")).toBeTruthy();
  await esperar(80);
  expect(screen.queryByText("card excluído")).toBeNull();
});

test("erro fica ate o usuario fechar: sumir antes de ler nao ajuda ninguem", async () => {
  montar();
  act(() => avisar({ texto: "senha incorreta", tipo: "erro" }));
  await esperar(80);
  expect(screen.getByRole("alert").textContent).toContain("senha incorreta");
  fireEvent.click(screen.getByLabelText("fechar aviso"));
  expect(screen.queryByText("senha incorreta")).toBeNull();
});

test("mouse em cima pausa o prazo para dar tempo de clicar em desfazer", async () => {
  montar();
  act(() => avisar({ texto: "tarefa excluída", acao: { rotulo: "desfazer", executar: () => {} } }));
  fireEvent.mouseEnter(screen.getByText("tarefa excluída").parentElement!);
  await esperar(80);
  expect(screen.getByRole("button", { name: "desfazer" })).toBeTruthy();
});

test("aviso novo nao reinicia o prazo dos que ja estavam na tela", async () => {
  montar(60);
  act(() => avisar({ texto: "primeiro" }));
  await esperar(40);
  act(() => avisar({ texto: "segundo" }));
  await esperar(35);
  expect(screen.queryByText("primeiro")).toBeNull();
  expect(screen.getByText("segundo")).toBeTruthy();
});

test("no maximo tres avisos empilhados, sai o mais antigo", () => {
  montar(10_000);
  act(() => ["a", "b", "c", "d"].forEach((texto) => avisar({ texto })));
  expect(screen.queryByText("a")).toBeNull();
  expect(screen.getByText("d")).toBeTruthy();
});

test("mesmo erro repetido pelo polling aparece uma vez so", () => {
  montar(10_000);
  act(() => [1, 2, 3].forEach(() => avisar({ texto: "clipboard indisponivel", tipo: "erro" })));
  expect(screen.getAllByText("clipboard indisponivel")).toHaveLength(1);
});

test("duas exclusoes seguidas mantem dois desfazer independentes", () => {
  montar(10_000);
  act(() => {
    avisar({ texto: "item excluído", acao: { rotulo: "desfazer", executar: () => {} } });
    avisar({ texto: "item excluído", acao: { rotulo: "desfazer", executar: () => {} } });
  });
  expect(screen.getAllByRole("button", { name: "desfazer" })).toHaveLength(2);
});
