import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

let calls: { cmd: string; args: unknown }[] = [];
const ok = (biometricDisabled = false, pending = false) => () => Promise.resolve({ biometricDisabled, pending });
let response: () => Promise<unknown> = ok();

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: unknown) => {
    calls.push({ cmd, args });
    return response();
  },
}));

const { default: ChangePassword } = await import("./ChangePassword");
const { ToastProvider } = await import("../lib/toast");

async function fill(current: string, next: string, confirm: string) {
  render(
    <ToastProvider>
      <ChangePassword onChanged={() => {}} />
    </ToastProvider>,
  );
  fireEvent.click(screen.getByText("trocar senha mestra"));
  fireEvent.change(screen.getByLabelText("senha atual"), { target: { value: current } });
  fireEvent.change(screen.getByLabelText("nova senha"), { target: { value: next } });
  fireEvent.change(screen.getByLabelText("repita a nova senha"), { target: { value: confirm } });
  await act(async () => {
    fireEvent.click(screen.getByText("trocar senha"));
  });
}

beforeEach(() => {
  calls = [];
  response = ok();
});

afterEach(cleanup);

test("a mismatched confirmation never reaches the vault", async () => {
  await fill("velha", "nova-senha", "outra-senha");
  expect(calls).toEqual([]);
  expect(screen.getByText(/não conferem/)).toBeTruthy();
});

test("the change sends current and new password to Rust and closes the form", async () => {
  await fill("velha", "nova-senha", "nova-senha");
  expect(calls).toEqual([{ cmd: "vault_change_password", args: { currentPassword: "velha", newPassword: "nova-senha" } }]);
  expect(screen.queryByLabelText("senha atual")).toBeNull();
  expect(screen.getByText("senha mestra trocada")).toBeTruthy();
});

test("biometrics disabled by the change is reported to the user", async () => {
  response = ok(true);
  await fill("velha", "nova-senha", "nova-senha");
  expect(screen.getByText(/ative a biometria de novo/)).toBeTruthy();
});

test("a wrong current password stays on the form, with the vault's error", async () => {
  response = () => Promise.reject("a senha atual nao confere");
  await fill("chute", "nova-senha", "nova-senha");
  expect(screen.getByText("a senha atual nao confere")).toBeTruthy();
  expect(screen.getByLabelText("senha atual")).toBeTruthy();
});
test("a file still waiting after the change tells the user how to finish it", async () => {
  response = ok(false, true);
  await fill("velha", "nova-senha", "nova-senha");
  expect(screen.getByText(/senha mestra trocada; tranque e destranque/)).toBeTruthy();
});
