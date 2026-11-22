import { afterEach, beforeEach, expect, jest, mock, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { advance } from "../../test-clock";

const clip = (id: string, preview: string) => ({ id, preview, chars: 5, kept: 5, truncated: false, copied_at: 1, pinned: false });
let served = [clip("c1", "primeiro")];
let rev = "r1";
let lists = 0;

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string) => {
    if (cmd === "clip_revision") return Promise.resolve(rev);
    if (cmd === "clip_list") {
      lists++;
      return Promise.resolve({ items: served, max_pinned: 100, revision: rev });
    }
    return Promise.resolve(null);
  },
}));

const { default: ClipboardTab } = await import("./ClipboardTab");
const { ToastProvider } = await import("../../lib/toast");

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  cleanup();
  jest.useRealTimers();
});

const wait = advance;

test("the background tick skips the decrypting list call while the history stamp stands still", async () => {
  render(
    <ToastProvider>
      <ClipboardTab privacy={false} onError={() => {}} />
    </ToastProvider>,
  );
  await wait(200);
  expect(screen.getByText("primeiro")).toBeDefined();
  expect(lists).toBe(1);

  await wait(5200);
  expect(lists).toBe(1);

  served = [clip("c2", "recém copiado"), ...served];
  rev = "r2";
  await wait(2600);
  expect(screen.getByText("recém copiado")).toBeDefined();
  expect(lists).toBe(2);
}, 15_000);
