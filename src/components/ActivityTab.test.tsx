import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const calls: { cmd: string; args?: Record<string, unknown> }[] = [];
let status = { supported: true, enabled: false };
const day = new Date(2026, 8, 30).getTime() / 1000;
const summary = {
  spans: [
    { app: "Code", start: day + 9 * 3600, end: day + 11 * 3600 },
    { app: "Slack", start: day + 11 * 3600, end: day + 11.5 * 3600 },
  ],
  apps: [
    { app: "Code", secs: 7200 },
    { app: "Slack", secs: 1800 },
  ],
  total_secs: 9000,
};
const empty = { spans: [], apps: [], total_secs: 0 };

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    calls.push({ cmd, args });
    if (cmd === "activity_status") return Promise.resolve(status);
    if (cmd === "activity_set_enabled") {
      status = { ...status, enabled: args?.enabled as boolean };
      return Promise.resolve(null);
    }
    if (cmd === "activity_summary") return Promise.resolve((args?.fromMs as number) === day * 1000 ? summary : empty);
    return Promise.resolve(null);
  },
}));

const { default: ActivityTab } = await import("./ActivityTab");
const { default: ActivitySection } = await import("./ActivitySection");
const { ToastProvider } = await import("../lib/toast");

async function mount() {
  render(
    <ToastProvider>
      <ActivityTab today="2026-09-30" onError={() => {}} />
    </ToastProvider>,
  );
  for (let i = 0; i < 3; i++) await act(async () => {});
}

beforeEach(() => {
  calls.length = 0;
  status = { supported: true, enabled: false };
});
afterEach(cleanup);

test("tracking is off until the user asks, and says what it keeps", async () => {
  await mount();
  expect(screen.getByText("Coleta desligada")).toBeTruthy();
  expect(screen.getByText(/Nunca o título da janela/)).toBeTruthy();
  expect(calls.some((c) => c.cmd === "activity_summary")).toBe(false);
});

test("turning it on loads the day: total, categories and the most used apps", async () => {
  await mount();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Ativar coleta" }));
  });
  for (let i = 0; i < 3; i++) await act(async () => {});
  expect(calls.some((c) => c.cmd === "activity_set_enabled" && c.args?.enabled === true)).toBe(true);
  expect(screen.getByText("Tempo ativo: 2h30")).toBeTruthy();
  expect(screen.getByRole("button", { name: /Código/ })).toBeTruthy();
  expect(screen.getByRole("button", { name: /Comunicação/ })).toBeTruthy();
  expect(screen.getByText("Maior bloco sem trocar de app")).toBeTruthy();
  expect(screen.getAllByText("Code").length).toBeGreaterThan(0);
});

test("hiding a category takes its time out of the total", async () => {
  status = { supported: true, enabled: true };
  await mount();
  expect(screen.getAllByText("2h30").length).toBeGreaterThan(0);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /Código/ }));
  });
  expect(screen.getByRole("button", { name: /Código/ }).getAttribute("aria-pressed")).toBe("false");
  expect(screen.getAllByText("30 min").length).toBeGreaterThan(0);
  expect(screen.queryByText("2h30")).toBeNull();
});

test("the week view lists seven days, one summary call each", async () => {
  status = { supported: true, enabled: true };
  await mount();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "7 dias" }));
  });
  expect(calls.filter((c) => c.cmd === "activity_summary")).toHaveLength(7);
  expect(screen.getAllByRole("listitem").length).toBeGreaterThanOrEqual(7);
});

test("a system that cannot tell the focused window says so instead of offering to track", async () => {
  status = { supported: false, enabled: false };
  await mount();
  expect(screen.getByText(/Wayland/)).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Ativar coleta" })).toBeNull();
});

test("settings can turn tracking off and delete the history", async () => {
  status = { supported: true, enabled: true };
  render(
    <ToastProvider>
      <ActivitySection onError={() => {}} />
    </ToastProvider>,
  );
  await act(async () => {});
  const box = screen.getByLabelText("Registrar o aplicativo em uso") as HTMLInputElement;
  expect(box.checked).toBe(true);
  await act(async () => {
    fireEvent.click(box);
  });
  expect(calls.some((c) => c.cmd === "activity_set_enabled" && c.args?.enabled === false)).toBe(true);
  await act(async () => {
    fireEvent.click(screen.getByText("Apagar histórico"));
  });
  expect(calls.some((c) => c.cmd === "activity_clear")).toBe(true);
});
