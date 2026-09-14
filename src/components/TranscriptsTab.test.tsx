import { afterEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string) => {
    if (cmd === "transcripts_dir") return Promise.resolve("C:/nao/existe");
    if (cmd === "transcripts_list") return Promise.reject("pasta de transcrições não encontrada");
    return Promise.resolve(null);
  },
}));

const { default: TranscriptsTab } = await import("./TranscriptsTab");

afterEach(cleanup);

const assentar = () => act(() => new Promise((r) => setTimeout(r, 200)));

test("pasta invalida aparece na aba com saida, sem aviso global a cada busca", async () => {
  const globais: string[] = [];
  render(<TranscriptsTab onError={(m) => globais.push(m)} />);
  await assentar();
  fireEvent.change(screen.getByPlaceholderText("buscar no que foi dito nas reuniões"), { target: { value: "daily" } });
  await assentar();

  expect(screen.getByRole("alert").textContent).toContain("pasta de transcrições não encontrada");
  expect(screen.queryByText("nenhuma transcrição nesta pasta")).toBeNull();
  expect(globais).toEqual([]);

  fireEvent.click(screen.getByRole("button", { name: "escolher outra pasta" }));
  expect(screen.getByDisplayValue("C:/nao/existe")).toBeTruthy();
});
