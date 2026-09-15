import { afterEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

let biometria: unknown = null;
const chamadas: string[] = [];
mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string) => {
    chamadas.push(cmd);
    return Promise.resolve(cmd === "biometria_status" ? biometria : null);
  },
}));

const { default: Lock } = await import("./Lock");

afterEach(() => {
  cleanup();
  biometria = null;
  chamadas.length = 0;
});

test("senha fica oculta ate o usuario pedir para ver", () => {
  render(<Lock exists onOpen={() => {}} />);
  const campo = screen.getByLabelText("senha mestra") as HTMLInputElement;
  expect(campo.type).toBe("password");
  fireEvent.click(screen.getByLabelText("mostrar senha"));
  expect(campo.type).toBe("text");
});

test("criar cofre mostra o requisito da senha fora do placeholder", () => {
  render(<Lock exists={false} onOpen={() => {}} />);
  expect(screen.getByText("mínimo de 4 caracteres")).toBeTruthy();
});

test("senhas diferentes explicam como corrigir", () => {
  render(<Lock exists={false} onOpen={() => {}} />);
  fireEvent.change(screen.getByLabelText("senha mestra"), { target: { value: "1234" } });
  fireEvent.change(screen.getByLabelText("repita a senha"), { target: { value: "4321" } });
  fireEvent.click(screen.getByRole("button", { name: "Criar cofre" }));
  expect(screen.getByRole("alert").textContent).toContain("mesma senha");
});

test("com Windows Hello ativo, um botao destranca sem digitar a senha", async () => {
  biometria = { disponivel: true, ativa: true, nome: "Windows Hello" };
  let abriu = false;
  await act(async () => {
    render(<Lock exists onOpen={() => { abriu = true; }} />);
  });
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Destrancar com Windows Hello" }));
  });
  expect(chamadas).toContain("biometria_desbloquear");
  expect(abriu).toBe(true);
});

test("biometria disponivel mas nao ativada nao oferece o botao", async () => {
  biometria = { disponivel: true, ativa: false, nome: "Windows Hello" };
  await act(async () => {
    render(<Lock exists onOpen={() => {}} />);
  });
  expect(screen.queryByRole("button", { name: /Windows Hello/ })).toBeNull();
});
