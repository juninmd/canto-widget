import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

type Call = { cmd: string; args?: Record<string, unknown> };
const calls: Call[] = [];
let release: (v: unknown) => void = () => {};
let slow = false;

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    calls.push({ cmd, args });
    if (cmd === "clip_list") {
      return slow ? new Promise((r) => (release = r)) : Promise.resolve({ items: [], max_pinned: 40 });
    }
    return Promise.resolve(null);
  },
}));

const { default: ClipSection } = await import("./ClipSection");

const errors: string[] = [];
async function show() {
  render(<ClipSection onError={(m) => errors.push(m)} />);
  await act(async () => {});
}
const input = () => screen.getByLabelText("máximo de itens fixados") as HTMLInputElement;

beforeEach(() => {
  calls.length = 0;
  errors.length = 0;
  slow = false;
});
afterEach(cleanup);

test("the field starts at the limit the history reports", async () => {
  await show();
  expect(input().value).toBe("40");
  expect(calls.some((c) => c.cmd === "clip_set_max_pinned")).toBe(false);
});

test("changing the pinned limit saves it through clip_set_max_pinned, clamped to 1000", async () => {
  await show();
  await act(async () => {
    fireEvent.change(input(), { target: { value: "5000" } });
  });
  expect(calls.at(-1)).toEqual({ cmd: "clip_set_max_pinned", args: { max: 1000 } });
});

test("clearing or zeroing the limit while typing saves nothing, and a late reply keeps the draft", async () => {
  slow = true;
  await show();
  await act(async () => {
    fireEvent.change(input(), { target: { value: "" } });
  });
  await act(async () => {
    fireEvent.change(input(), { target: { value: "0" } });
  });
  expect(calls.some((c) => c.cmd === "clip_set_max_pinned")).toBe(false);

  await act(async () => release({ items: [], max_pinned: 40 }));
  expect(input().value).toBe("0");

  await act(async () => {
    fireEvent.change(input(), { target: { value: "25" } });
  });
  expect(calls.at(-1)).toEqual({ cmd: "clip_set_max_pinned", args: { max: 25 } });
});
