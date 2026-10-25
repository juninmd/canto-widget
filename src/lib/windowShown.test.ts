import { afterEach, expect, mock, test } from "bun:test";

let hides = 0;
let onShown: ((e: { payload: boolean }) => void) | null = null;
mock.module("@tauri-apps/api/window", () => ({
  getCurrentWindow: () => ({
    hide: () => {
      hides += 1;
      return Promise.resolve();
    },
  }),
}));
mock.module("@tauri-apps/api/event", () => ({
  listen: (name: string, run: (e: { payload: boolean }) => void) => {
    if (name === "canto://window-shown") onShown = run;
    return Promise.resolve(() => {});
  },
}));

const { hideWindow, setWindowShown, subscribeWindowShown, windowShown } = await import("./windowShown");

afterEach(() => setWindowShown(true));

test("hiding from the UI pauses polls before the OS reports anything", async () => {
  const seen: boolean[] = [];
  const stop = subscribeWindowShown(() => seen.push(windowShown()));
  await hideWindow();
  expect(hides).toBe(1);
  expect(windowShown()).toBe(false);
  expect(seen).toEqual([false]);
  stop();
});

test("Rust's hide and show from the tray reach the webview even when document.hidden never changes", async () => {
  const stop = subscribeWindowShown(() => {});
  await new Promise((r) => setTimeout(r, 0));
  onShown!({ payload: false });
  expect(windowShown()).toBe(false);
  onShown!({ payload: true });
  expect(windowShown()).toBe(true);
  stop();
});

test("focus or a pointer in the window wakes polls up, so a missed event never leaves them asleep", () => {
  const stop = subscribeWindowShown(() => {});
  setWindowShown(false);
  window.dispatchEvent(new Event("focus"));
  expect(windowShown()).toBe(true);
  setWindowShown(false);
  window.dispatchEvent(new Event("pointermove"));
  expect(windowShown()).toBe(true);
  stop();
});
