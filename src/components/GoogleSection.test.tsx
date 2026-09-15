import { afterEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const FOTO = "data:image/png;base64,iVBORw0KGgo=";
const conectado = { configured: true, embutido: true, connected: true, email: "ana@exemplo.com", nome: "Ana Souza", avatar: FOTO };
let status: Record<string, unknown> = conectado;
const chamadas: string[] = [];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string) => {
    chamadas.push(cmd);
    if (cmd === "drive_disconnect") status = { configured: true, embutido: true, connected: false, email: "", nome: "", avatar: "" };
    return Promise.resolve(cmd === "drive_status" ? status : null);
  },
}));

const { default: GoogleSection } = await import("./GoogleSection");

async function montar() {
  render(<GoogleSection onError={() => {}} />);
  await act(async () => {
    await Promise.resolve();
  });
}

afterEach(() => {
  cleanup();
  status = conectado;
  chamadas.length = 0;
});

test("conta conectada mostra foto, nome e e-mail", async () => {
  await montar();
  expect(screen.getByText("Ana Souza")).toBeTruthy();
  expect(screen.getByText("ana@exemplo.com")).toBeTruthy();
  expect(document.querySelector("img")?.getAttribute("src")).toBe(FOTO);
});

test("sair desconecta e volta ao estado de entrar", async () => {
  await montar();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "sair da conta ana@exemplo.com" }));
  });
  expect(chamadas).toContain("drive_disconnect");
  expect(screen.getByText("pronto para entrar")).toBeTruthy();
  expect(screen.getByRole("button", { name: "entrar com o Google" })).toBeTruthy();
  expect(screen.queryByText("Ana Souza")).toBeNull();
});

test("foto que nao e data: de imagem nao vira <img>; mostra a inicial", async () => {
  status = { ...conectado, nome: "", avatar: "https://rastreador.exemplo/pixel.png" };
  await montar();
  expect(document.querySelector("img")).toBeNull();
  expect(screen.getByText("A")).toBeTruthy();
  expect(screen.getByText("ana@exemplo.com")).toBeTruthy();
});
