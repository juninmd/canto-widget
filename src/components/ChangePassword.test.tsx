import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, createEvent, fireEvent, render, screen } from "@testing-library/react";

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

test("a new password shorter than the vault's floor is refused before the round trip", async () => {
  await fill("velha", "abc", "abc");
  expect(calls).toEqual([]);
  expect(screen.getByText("mínimo de 4 caracteres", { selector: "[role=alert]" })).toBeTruthy();
  expect(screen.getByLabelText("nova senha").getAttribute("aria-invalid")).toBe("true");
  expect(document.activeElement === screen.getByLabelText("nova senha")).toBe(true);
});

test("reusing the current password as the new one is refused", async () => {
  await fill("mesma-senha", "mesma-senha", "mesma-senha");
  expect(calls).toEqual([]);
  expect(screen.getByText("a nova senha é igual à atual")).toBeTruthy();
});

test("a mismatch marks and focuses the confirmation field", async () => {
  await fill("velha", "nova-senha", "outra-senha");
  const confirm = screen.getByLabelText("repita a nova senha");
  expect(confirm.getAttribute("aria-invalid")).toBe("true");
  expect(document.activeElement === confirm).toBe(true);
});

test("a wrong current password focuses that field so it can be retyped", async () => {
  response = () => Promise.reject("a senha atual nao confere");
  await fill("chute", "nova-senha", "nova-senha");
  expect(document.activeElement === screen.getByLabelText("senha atual")).toBe(true);
});

test("fields tell password managers which password is which", async () => {
  await fill("", "", "");
  expect(screen.getByLabelText("senha atual").getAttribute("autocomplete")).toBe("current-password");
  expect(screen.getByLabelText("nova senha").getAttribute("autocomplete")).toBe("new-password");
  expect(screen.getByLabelText("repita a nova senha").getAttribute("autocomplete")).toBe("new-password");
});

test("Caps Lock on while typing shows a hint that leaves on blur", async () => {
  await fill("", "", "");
  const current = screen.getByLabelText("senha atual");
  const press = createEvent.keyDown(current, { key: "A" });
  Object.defineProperty(press, "getModifierState", { value: (k: string) => k === "CapsLock" });
  fireEvent(current, press);
  expect(screen.getByText("Caps Lock está ativado")).toBeTruthy();
  fireEvent.blur(current);
  expect(screen.queryByText("Caps Lock está ativado")).toBeNull();
});

test("Escape closes the form, clears it and returns focus to the opener", async () => {
  await fill("velha", "nova-senha", "outra-senha");
  fireEvent.keyDown(screen.getByLabelText("senha atual"), { key: "Escape" });
  expect(screen.queryByLabelText("senha atual")).toBeNull();
  await act(async () => {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
  });
  const opener = screen.getByText("trocar senha mestra");
  expect(document.activeElement === opener).toBe(true);
  fireEvent.click(opener);
  expect((screen.getByLabelText("repita a nova senha") as HTMLInputElement).value).toBe("");
});
