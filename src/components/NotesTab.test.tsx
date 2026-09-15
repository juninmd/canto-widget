import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

type Chamada = { cmd: string; args?: Record<string, unknown> };
const chamadas: Chamada[] = [];
let notas: unknown[] = [];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    chamadas.push({ cmd, args });
    if (cmd === "notes_search") return Promise.resolve(notas);
    if (cmd === "note_pin") return Promise.resolve(true);
    return Promise.resolve(null);
  },
}));

const { default: NotesTab } = await import("./NotesTab");
const { ToastProvider } = await import("../lib/toast");

async function abrirEditor() {
  render(
    <ToastProvider>
      <NotesTab onError={() => {}} />
    </ToastProvider>,
  );
  // A busca da lista e debounced em 150 ms; deixa ela assentar dentro do act
  // para o editor abrir sem update pendente.
  await act(async () => {
    await new Promise((pronto) => setTimeout(pronto, 250));
  });
  await act(async () => {
    fireEvent.click(screen.getByText("+"));
  });
  return screen.getByPlaceholderText("título");
}

beforeEach(() => {
  chamadas.length = 0;
  notas = [];
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
  expect((screen.getByPlaceholderText("título") as HTMLInputElement).value).toBe("");
});

async function listaCom(nota: Record<string, unknown>) {
  notas = [{ id: "n1", title: "wifi", body: "senha", tags: ["casa"], created_at: 1, updated_at: 1, fixada: false, ...nota }];
  render(
    <ToastProvider>
      <NotesTab onError={() => {}} />
    </ToastProvider>,
  );
  await act(async () => {
    await new Promise((pronto) => setTimeout(pronto, 250));
  });
}

test("clicar na tag filtra pela tag exata", async () => {
  await listaCom({});
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "#casa" }));
    await new Promise((pronto) => setTimeout(pronto, 250));
  });
  expect((screen.getByLabelText("buscar notas") as HTMLInputElement).value).toBe("#casa");
  expect(chamadas.some((c) => c.cmd === "notes_search" && c.args?.query === "#casa")).toBe(true);
});

test("fixar pede ao cofre, recarrega e avisa o leitor de tela", async () => {
  await listaCom({});
  const antes = chamadas.filter((c) => c.cmd === "notes_search").length;
  await act(async () => {
    fireEvent.click(screen.getByLabelText("fixar wifi no topo"));
    await Promise.resolve();
  });
  expect(chamadas.find((c) => c.cmd === "note_pin")?.args).toEqual({ id: "n1" });
  expect(chamadas.filter((c) => c.cmd === "notes_search").length).toBeGreaterThan(antes);
  expect(screen.getByText(/fixada no topo/).getAttribute("role")).toBe("status");
});

test("nota fixada mostra o alfinete sem depender do hover", async () => {
  await listaCom({ fixada: true });
  const alfinete = screen.getByLabelText("desafixar wifi");
  expect(alfinete.getAttribute("aria-pressed")).toBe("true");
  expect(alfinete.className).not.toContain("opacity-0");
});
