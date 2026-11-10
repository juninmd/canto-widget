import { afterEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

let connected = true;
const calls: { cmd: string; args: unknown }[] = [];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: { enabled?: boolean }) => {
    calls.push({ cmd, args });
    if (cmd === "github_status") return Promise.resolve({ connected, login: "", source: "", device_flow: true });
    if (cmd === "review_alerts_get") return Promise.resolve(true);
    return Promise.resolve(args.enabled);
  },
}));

const { default: ReviewAlertsSection } = await import("./ReviewAlertsSection");

afterEach(() => {
  cleanup();
  connected = true;
});

test("shows the saved choice and turning it off persists in Rust", async () => {
  render(<ReviewAlertsSection onError={() => {}} />);
  await act(async () => {});
  const box = screen.getByLabelText("avisar quando pedirem minha revisão") as HTMLInputElement;
  expect(box.checked).toBe(true);
  await act(async () => {
    fireEvent.click(box);
  });
  expect(calls.find((c) => c.cmd === "review_alerts_set")?.args).toEqual({ enabled: false });
  expect(box.checked).toBe(false);
});

test("without a GitHub connection the section says where to connect it", async () => {
  connected = false;
  render(<ReviewAlertsSection onError={() => {}} />);
  await act(async () => {});
  expect(screen.getByRole("status").textContent).toBe("Conecte o GitHub na aba GitHub para receber estes avisos.");
});

test("connected, the hint stays out of the way", async () => {
  render(<ReviewAlertsSection onError={() => {}} />);
  await act(async () => {});
  expect(screen.queryByText(/Conecte o GitHub/)).toBeNull();
});
