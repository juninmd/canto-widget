import { afterEach, expect, test } from "bun:test";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import TabBar, { type Tab } from "./TabBar";

function Harness() {
  const [atual, setAtual] = useState<Tab>("tarefas");
  return <TabBar atual={atual} onChange={setAtual} />;
}

afterEach(cleanup);

const selecionada = () => screen.getAllByRole("tab").find((t) => t.getAttribute("aria-selected") === "true");

test("so a aba ativa entra na ordem do Tab: o teclado nao atravessa seis paradas", () => {
  render(<Harness />);
  const paradas = screen.getAllByRole("tab").filter((t) => t.tabIndex === 0);
  expect(paradas.map((t) => t.textContent)).toEqual(["Tarefas"]);
});

test("aria-controls so aponta para painel que existe na tela", () => {
  render(
    <>
      <Harness />
      <main id="painel-tarefas" role="tabpanel" />
    </>,
  );
  const refs = screen.getAllByRole("tab").map((t) => t.getAttribute("aria-controls")).filter(Boolean);
  expect(refs).toEqual(["painel-tarefas"]);
  expect(refs.every((id) => document.getElementById(id!))).toBe(true);
});

test("setas trocam de aba, com volta ao inicio e ao fim", () => {
  render(<Harness />);
  const lista = screen.getByRole("tablist");
  fireEvent.keyDown(lista, { key: "ArrowLeft" });
  expect(selecionada()?.textContent).toBe("Ajustes");
  expect(document.activeElement).toBe(selecionada()!);
  fireEvent.keyDown(lista, { key: "ArrowRight" });
  expect(selecionada()?.textContent).toBe("Tarefas");
});

test("Home e End levam as abas das pontas", () => {
  render(<Harness />);
  const lista = screen.getByRole("tablist");
  fireEvent.keyDown(lista, { key: "End" });
  expect(selecionada()?.textContent).toBe("Ajustes");
  fireEvent.keyDown(lista, { key: "Home" });
  expect(selecionada()?.textContent).toBe("Tarefas");
});
