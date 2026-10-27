import { afterEach, expect, mock, test } from "bun:test";

let hides = 0;
mock.module("@tauri-apps/api/window", () => ({
  getCurrentWindow: () => ({
    hide: () => {
      hides += 1;
      return Promise.resolve();
    },
  }),
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
