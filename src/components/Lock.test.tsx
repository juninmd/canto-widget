import { afterEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

let biometrics: unknown = null;
const calls: string[] = [];
mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string) => {
    calls.push(cmd);
    return Promise.resolve(cmd === "biometric_status" ? biometrics : null);
  },
}));

const { default: Lock } = await import("./Lock");

afterEach(() => {
  cleanup();
  biometrics = null;
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
