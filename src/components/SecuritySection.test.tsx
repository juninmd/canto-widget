import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

let calls: { cmd: string; args?: unknown }[] = [];
let responses: Record<string, () => Promise<unknown>> = {};

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: unknown) => {
    calls.push({ cmd, args });
    return (responses[cmd] ?? (() => Promise.resolve(null)))();
  },
}));

const { default: SecuritySection } = await import("./SecuritySection");
const { ToastProvider } = await import("../lib/toast");

async function mount(onError: (m: string) => void = () => {}) {
  responses.biometric_status = () => Promise.resolve({ available: false, enabled: false, name: "" });
  responses.unlock_history ??= () => Promise.resolve([]);
  render(
    <ToastProvider>
      <SecuritySection onError={onError} />
    </ToastProvider>,
  );
  await act(async () => {});
}

beforeEach(() => {
  calls = [];
  responses = {};
});

afterEach(cleanup);

test("shows the saved auto-lock timeout as soon as it loads", async () => {
  responses.autolock_get = () => Promise.resolve(30);
  await mount();
  expect((screen.getByLabelText(/trancar sozinho após/) as HTMLSelectElement).value).toBe("30");
});

test("changing the timeout saves the new value in minutes", async () => {
  responses.autolock_get = () => Promise.resolve(15);
  await mount();
  await act(async () => {
    fireEvent.change(screen.getByLabelText(/trancar sozinho após/), { target: { value: "60" } });
  });
  expect(calls.find((c) => c.cmd === "autolock_set")?.args).toEqual({ minutes: 60 });
});

test("the unlock history shows the most recent entry first, with its method translated to pt-BR", async () => {
  responses.autolock_get = () => Promise.resolve(15);
  responses.unlock_history = () =>
    Promise.resolve([
      { at: new Date("2026-09-18T10:00:00Z").getTime(), method: "password" },
      { at: new Date("2026-09-20T10:00:00Z").getTime(), method: "windows_hello" },
    ]);
  await mount();
  fireEvent.click(screen.getByText("últimos desbloqueios"));
  const items = screen.getAllByRole("listitem");
  expect(items[0].textContent).toContain("Windows Hello");
  expect(items[1].textContent).toContain("senha");
});

test("with no history yet, the section shows no expandable list", async () => {
  responses.autolock_get = () => Promise.resolve(15);
  await mount();
  expect(screen.queryByText("últimos desbloqueios")).toBeNull();
});

test("a rejected change reaches onError and the select reverts to the saved value", async () => {
  const errors: string[] = [];
  let saved = 15;
  responses.autolock_get = () => Promise.resolve(saved);
  responses.autolock_set = () => Promise.reject("tempo de auto-trava invalido");
  await mount((m) => errors.push(m));
  await act(async () => {
    fireEvent.change(screen.getByLabelText(/trancar sozinho após/), { target: { value: "60" } });
  });
  expect(errors).toEqual(["tempo de auto-trava invalido"]);
  expect((screen.getByLabelText(/trancar sozinho após/) as HTMLSelectElement).value).toBe(String(saved));
});
