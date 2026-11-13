import { afterEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const calls: { cmd: string; args: unknown }[] = [];
let sidebar = false;

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: { enabled?: boolean }) => {
    calls.push({ cmd, args });
    if (cmd === "window_sidebar_set") sidebar = args.enabled === true;
    return Promise.resolve({ position: null, size: null, always_on_top: true, mini: false, sidebar });
  },
}));

const { default: WindowSection } = await import("./WindowSection");

afterEach(() => {
  cleanup();
  calls.length = 0;
  sidebar = false;
});

test("the sidebar box reflects Rust and turning it on asks Rust to dock the window", async () => {
  render(<WindowSection onError={() => {}} />);
  await act(async () => {});
  const box = screen.getByLabelText("barra lateral que se esconde sozinha") as HTMLInputElement;
  expect(box.checked).toBe(false);
  await act(async () => {
    fireEvent.click(box);
  });
  expect(calls.find((c) => c.cmd === "window_sidebar_set")?.args).toEqual({ enabled: true });
  expect(box.checked).toBe(true);
});
