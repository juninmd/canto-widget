import { afterEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, render, screen } from "@testing-library/react";

const many = Array.from({ length: 1000 }, (_, n) => ({
  id: `c${n}`,
  preview: n % 3 ? `texto ${n}` : `https://example.com/${n}`,
  chars: 10,
  kept: 10,
  truncated: false,
  copied_at: n,
  pinned: n < 5,
}));
let served = many;

// Every poll hands back a fresh copy, as the real IPC does: equal content, new objects.
mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string) =>
    Promise.resolve(cmd === "clip_list" ? { items: served.map((i) => ({ ...i })), max_pinned: 1000 } : null),
}));

// Every card classifies its clip on render, so the classifier's call count is how many cards re-rendered.
const real = await import("../lib/clip");
const realKind = real.clipKind;
let kinds = 0;
mock.module("../lib/clip", () => ({
  ...real,
  clipKind: (text: string) => {
    kinds++;
    return realKind(text);
  },
}));

const { default: ClipboardTab } = await import("./ClipboardTab");
const { ToastProvider } = await import("../lib/toast");

afterEach(cleanup);

const wait = (ms: number) => act(async () => void (await new Promise((r) => setTimeout(r, ms))));

test("a background poll that brings back the same 1000 clips re-renders none of them", async () => {
  render(
    <ToastProvider>
      <ClipboardTab privacy={false} onError={() => {}} />
    </ToastProvider>,
  );
  await wait(200);
  expect(screen.getByText("texto 1")).toBeDefined();
  kinds = 0;
  await wait(2600);
  expect(kinds).toBe(0);

  served = [{ ...many[0], id: "novo", preview: "recém copiado" }, ...many];
  await wait(2600);
  expect(screen.getByText("recém copiado")).toBeDefined();
  expect(kinds).toBeGreaterThan(1000);
}, 15_000);
