import { afterEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const calls: { cmd: string; args: unknown }[] = [];
let pending: ((v: boolean) => void) | null = null;
let hold = false;

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: { enabled?: boolean }) => {
    calls.push({ cmd, args });
    if (cmd === "fullscreen_hold_get") return Promise.resolve(true);
    if (hold) return new Promise((r) => (pending = r));
    return Promise.resolve(args.enabled);
  },
}));

const { default: FullscreenHoldSection } = await import("./FullscreenHoldSection");

afterEach(() => {
  cleanup();
  calls.length = 0;
  hold = false;
  pending = null;
});

test("shows the saved choice and turning it off persists in Rust", async () => {
  render(<FullscreenHoldSection onError={() => {}} />);
  await act(async () => {});
  const box = screen.getByLabelText("esperar a tela cheia acabar para avisar") as HTMLInputElement;
  expect(box.checked).toBe(true);
  await act(async () => {
    fireEvent.click(box);
  });
  expect(calls.find((c) => c.cmd === "fullscreen_hold_set")?.args).toEqual({ enabled: false });
  expect(box.checked).toBe(false);
});

test("while a save is in flight the box is held, so a second click can't race it", async () => {
  hold = true;
  render(<FullscreenHoldSection onError={() => {}} />);
  await act(async () => {});
  const box = screen.getByLabelText("esperar a tela cheia acabar para avisar") as HTMLInputElement;
  fireEvent.click(box);
  expect(box.disabled).toBe(true);
  fireEvent.click(box);
  expect(calls.filter((c) => c.cmd === "fullscreen_hold_set").length).toBe(1);
  await act(async () => pending!(false));
  expect(box.disabled).toBe(false);
  expect(box.checked).toBe(false);
});
