import { afterEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

let biometrics: unknown = null;
let wrongPassword = false;
let biometricFails = false;
const calls: string[] = [];
mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string) => {
    calls.push(cmd);
    if (cmd === "vault_unlock" && wrongPassword) return Promise.reject("senha incorreta");
    if (cmd === "biometric_unlock" && biometricFails) return Promise.reject("cancelado pelo usuário");
    return Promise.resolve(cmd === "biometric_status" ? biometrics : null);
  },
}));

const { default: Lock } = await import("./Lock");

afterEach(() => {
  cleanup();
  biometrics = null;
  wrongPassword = false;
  biometricFails = false;
  calls.length = 0;
});

test("password stays hidden until the user asks to see it", () => {
  render(<Lock exists onOpen={() => {}} />);
  const field = screen.getByLabelText("senha mestra") as HTMLInputElement;
  expect(field.type).toBe("password");
  fireEvent.click(screen.getByLabelText("mostrar senha"));
  expect(field.type).toBe("text");
});

test("creating a vault shows the password requirement outside the placeholder", () => {
  render(<Lock exists={false} onOpen={() => {}} />);
  expect(screen.getByText("mínimo de 4 caracteres")).toBeTruthy();
});

test("mismatched passwords explain how to fix it", () => {
  render(<Lock exists={false} onOpen={() => {}} />);
  fireEvent.change(screen.getByLabelText("senha mestra"), { target: { value: "1234" } });
  fireEvent.change(screen.getByLabelText("repita a senha"), { target: { value: "4321" } });
  fireEvent.click(screen.getByRole("button", { name: "Criar cofre" }));
  expect(screen.getByRole("alert").textContent).toContain("mesma senha");
  const again = screen.getByLabelText("repita a senha");
  expect(document.activeElement === again).toBe(true);
  expect(again.getAttribute("aria-describedby")).toBe(screen.getByRole("alert").id);
  expect(again.getAttribute("aria-invalid")).toBe("true");
  expect(screen.getByLabelText("senha mestra").getAttribute("aria-invalid")).toBeNull();
});

test("a cancelled biometric unlock shows the error without marking the empty password field invalid", async () => {
  biometrics = { available: true, enabled: true, name: "Windows Hello" };
  biometricFails = true;
  await act(async () => {
    render(<Lock exists onOpen={() => {}} />);
  });
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Destrancar com Windows Hello" }));
  });
  expect(screen.getByRole("alert").textContent).toContain("cancelado");
  const field = screen.getByLabelText("senha mestra");
  expect(field.getAttribute("aria-invalid")).toBeNull();
  expect(field.getAttribute("aria-describedby")).toBeNull();
});

test("a wrong password puts the focus back on the field, selected, and marks it invalid", async () => {
  wrongPassword = true;
  render(<Lock exists onOpen={() => {}} />);
  const field = screen.getByLabelText("senha mestra") as HTMLInputElement;
  fireEvent.change(field, { target: { value: "errada" } });
  (screen.getByRole("button", { name: "Destrancar" }) as HTMLButtonElement).focus();
  await act(async () => {
    fireEvent.submit(field.form!);
  });
  expect(screen.getByRole("alert").textContent).toContain("senha incorreta");
  expect(document.activeElement === field).toBe(true);
  expect([field.selectionStart, field.selectionEnd]).toEqual([0, "errada".length]);
  expect(field.getAttribute("aria-invalid")).toBe("true");
});

test("with Windows Hello enabled, a button unlocks without typing the password", async () => {
  biometrics = { available: true, enabled: true, name: "Windows Hello" };
  let opened = false;
  await act(async () => {
    render(<Lock exists onOpen={() => { opened = true; }} />);
  });
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Destrancar com Windows Hello" }));
  });
  expect(calls).toContain("biometric_unlock");
  expect(opened).toBe(true);
});

test("biometrics available but not enabled doesn't offer the button", async () => {
  biometrics = { available: true, enabled: false, name: "Windows Hello" };
  await act(async () => {
    render(<Lock exists onOpen={() => {}} />);
  });
  expect(screen.queryByRole("button", { name: /Windows Hello/ })).toBeNull();
});
