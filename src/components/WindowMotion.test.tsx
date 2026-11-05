import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, render } from "@testing-library/react";

mock.module("@tauri-apps/api/event", () => ({ listen: () => Promise.resolve(() => {}) }));
mock.module("@tauri-apps/api/window", () => ({
  getCurrentWindow: () => ({ isVisible: () => Promise.resolve(true), hide: () => Promise.resolve() }),
}));

const { default: AlertFx } = await import("./AlertFx");
const { default: WeatherAlertFx } = await import("./WeatherAlertFx");
const { default: WeatherSky } = await import("./WeatherSky");
const { setWindowShown } = await import("../lib/windowShown");

/** Every frame the components asked for; a hidden window must not ask for another one. */
let frames: FrameRequestCallback[] = [];
const originalRaf = globalThis.requestAnimationFrame;
const originalCancel = globalThis.cancelAnimationFrame;
const originalGetContext = HTMLCanvasElement.prototype.getContext;
const originalMatchMedia = window.matchMedia;

beforeEach(() => {
  frames = [];
  globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => frames.push(cb)) as typeof requestAnimationFrame;
  globalThis.cancelAnimationFrame = (() => {}) as typeof cancelAnimationFrame;
  // happy-dom has no 2D context; the loops only pass it around, so a no-op surface is enough.
  const gradient = { addColorStop() {} };
  const surface = new Proxy({ canvas: {} } as Record<string, unknown>, {
    get: (target, key) => {
      const name = String(key);
      if (name in target) return target[name];
      if (name === "createLinearGradient" || name === "createRadialGradient") return () => gradient;
      return () => {};
    },
    set: (target, key, value) => {
      target[String(key)] = value;
      return true;
    },
  });
  HTMLCanvasElement.prototype.getContext = (() => surface) as unknown as HTMLCanvasElement["getContext"];
  window.matchMedia = ((query: string) => ({
    matches: query.includes("no-preference"),
    media: query,
    addEventListener() {},
    removeEventListener() {},
  })) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  cleanup();
  setWindowShown(true);
  globalThis.requestAnimationFrame = originalRaf;
  globalThis.cancelAnimationFrame = originalCancel;
  HTMLCanvasElement.prototype.getContext = originalGetContext;
  window.matchMedia = originalMatchMedia;
});

async function pauseAndResume(name: string, el: React.ReactNode) {
  render(el);
  await act(async () => {});
  const running = frames.length;
  expect(running, `${name} never started drawing`).toBeGreaterThan(0);

  await act(async () => setWindowShown(false));
  expect(frames.length, `${name} kept drawing after the window hid`).toBe(running);

  await act(async () => setWindowShown(true));
  expect(frames.length, `${name} did not resume when the window came back`).toBe(running + 1);
}

test("the weather sky stops drawing while the widget is in the tray", async () => {
  await pauseAndResume("the weather sky", <WeatherSky condition="rain" night={false} />);
});

test("the alert backdrop stops drawing while the pop-up is hidden", async () => {
  await pauseAndResume("the alert backdrop", <AlertFx scene="rings" tone="warn" intense={false} />);
});

test("the weather alert sky stops drawing while the pop-up is hidden", async () => {
  await pauseAndResume("the weather alert sky", <WeatherAlertFx id="weather:storm" severe />);
});
