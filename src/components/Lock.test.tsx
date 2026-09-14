import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

mock.module("@tauri-apps/api/core", () => ({ invoke: () => Promise.resolve(null) }));

const { default: Lock } = await import("./Lock");

afterEach(cleanup);

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
