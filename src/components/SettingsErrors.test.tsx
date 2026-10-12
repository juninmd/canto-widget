import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

let failSet = true;
let stored = true;
const calls: string[] = [];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string) => {
    calls.push(cmd);
    if (cmd === "github_status") return Promise.resolve({ connected: true });
    if (cmd === "review_alerts_get" || cmd === "fullscreen_hold_get") return Promise.resolve(stored);
    if (cmd === "review_alerts_set" || cmd === "fullscreen_hold_set") return failSet ? Promise.reject("cofre ocupado") : Promise.resolve(false);
    if (cmd === "activity_status") return Promise.resolve({ enabled: stored });
    if (cmd === "activity_set_enabled") return Promise.reject("sem permissão");
    if (cmd === "backup_export") return Promise.reject("disco cheio");
    if (cmd === "window_config") return Promise.resolve({ always_on_top: true, position: null, size: null });
    if (cmd === "window_set_always_on_top") return Promise.reject("janela travada");
    return Promise.resolve(null);
  },
}));

const { default: ReviewAlertsSection } = await import("./ReviewAlertsSection");
const { default: FullscreenHoldSection } = await import("./FullscreenHoldSection");
const { default: BackupSection } = await import("./BackupSection");
const { default: WindowSection } = await import("./WindowSection");
const { default: ActivitySection } = await import("./ActivitySection");
const { ToastProvider } = await import("../lib/toast");

beforeEach(() => {
  failSet = true;
  stored = true;
  calls.length = 0;
});
afterEach(cleanup);

async function click(el: HTMLElement) {
  await act(async () => {
    fireEvent.click(el);
  });
}

test("a toggle that fails to save shows the reason in the section and goes back to what Rust has", async () => {
  const toasts: string[] = [];
  render(<ReviewAlertsSection onError={(m) => toasts.push(m)} />);
  await act(async () => {});
  const box = screen.getByLabelText("avisar quando pedirem minha revisão") as HTMLInputElement;
  await click(box);
  expect(screen.getByRole("alert").textContent).toBe("cofre ocupado");
  expect(toasts).toEqual(["cofre ocupado"]);
  expect(box.checked).toBe(true);
  expect(calls.filter((c) => c === "review_alerts_get")).toHaveLength(2);
});

test("the error clears on the next attempt", async () => {
  render(<FullscreenHoldSection onError={() => {}} />);
  await act(async () => {});
  const box = screen.getByRole("checkbox");
  await click(box);
  expect(screen.getByRole("alert")).toBeTruthy();
  failSet = false;
  await click(box);
  expect(screen.queryByRole("alert")).toBeNull();
});

test("backup, window and activity failures also land inline", async () => {
  render(
    <ToastProvider>
      <BackupSection onError={() => {}} />
      <WindowSection onError={() => {}} />
      <ActivitySection onError={() => {}} />
    </ToastProvider>,
  );
  await act(async () => {});
  await click(screen.getByRole("button", { name: "exportar" }));
  await click(screen.getByLabelText("sempre na frente das outras janelas"));
  await click(screen.getByLabelText("Registrar o aplicativo em uso"));
  expect(screen.getAllByRole("alert").map((a) => a.textContent).filter(Boolean)).toEqual(["disco cheio", "janela travada", "sem permissão"]);
});
