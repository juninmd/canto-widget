import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

type Chamada = { cmd: string; args?: Record<string, unknown> };
const chamadas: Chamada[] = [];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    chamadas.push({ cmd, args });
    if (cmd === "notes_search") return Promise.resolve([]);
    return Promise.resolve(null);
  },
}));

const { default: NotesTab } = await import("./NotesTab");

async function abrirEditor() {
  render(<NotesTab onError={() => {}} />);
  // A busca da lista e debounced em 150 ms; deixa ela assentar dentro do act
  // para o editor abrir sem update pendente.
  await act(async () => {
    await new Promise((pronto) => setTimeout(pronto, 250));
  });
  await act(async () => {
    fireEvent.click(screen.getByText("+"));
  });
  return screen.getByPlaceholderText("titulo");
}

beforeEach(() => {
  chamadas.length = 0;
});

afterEach(cleanup);

test("Ctrl+Enter salva o card sem passar pelo botao", async () => {
  const titulo = await abrirEditor();
  await act(async () => {
    fireEvent.change(titulo, { target: { value: "ideia solta" } });
    fireEvent.keyDown(titulo, { key: "Enter", ctrlKey: true });
    await Promise.resolve();
  });

  const salvo = chamadas.find((c) => c.cmd === "note_save");
  expect(salvo?.args?.title).toBe("ideia solta");
});

test("Enter sozinho nao salva", async () => {
  const titulo = await abrirEditor();
  await act(async () => {
    fireEvent.change(titulo, { target: { value: "ideia solta" } });
    fireEvent.keyDown(titulo, { key: "Enter" });
    await Promise.resolve();
  });

  expect(chamadas.some((c) => c.cmd === "note_save")).toBe(false);
});

test("Esc cancela o editor e descarta o rascunho", async () => {
  const titulo = await abrirEditor();
  await act(async () => {
    fireEvent.change(titulo, { target: { value: "nao quero isto" } });
    fireEvent.keyDown(titulo, { key: "Escape" });
    await Promise.resolve();
  });

  expect(chamadas.some((c) => c.cmd === "note_save")).toBe(false);
  // Voltou para a lista, e reabrir o editor traz campo limpo.
  await act(async () => {
    fireEvent.click(screen.getByText("+"));
  });
  expect((screen.getByPlaceholderText("titulo") as HTMLInputElement).value).toBe("");
});
