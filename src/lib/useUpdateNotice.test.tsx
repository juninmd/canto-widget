import { afterEach, beforeEach, expect, jest, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, renderHook } from "@testing-library/react";
import type { Toast } from "./toast";

let check: () => Promise<unknown>;
mock.module("@tauri-apps/api/core", () => ({ invoke: () => check() }));

const { useUpdateNotice } = await import("./useUpdateNotice");

const available = (latest: string) => ({ current: "0.1.0", latest, available: true, notes: "", date: null });
const SIX_HOURS = 6 * 60 * 60 * 1000;

let toasts: Toast[];
let opened: number;

async function advance(ms: number) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
}

beforeEach(() => {
  jest.useFakeTimers();
  toasts = [];
  opened = 0;
  check = () => Promise.resolve(available("0.2.0"));
  renderHook(() => useUpdateNotice((t) => toasts.push(t), () => opened++));
});
afterEach(() => {
  cleanup();
  jest.useRealTimers();
});

test("a new version is announced once, with a shortcut to Settings", async () => {
  await advance(5_000);
  expect(toasts.map((t) => t.message)).toEqual(["Canto 0.2.0 disponível"]);
  toasts[0].action?.run();
  expect(opened).toBe(1);
  await advance(SIX_HOURS);
  expect(toasts.length).toBe(1);
});

test("a later release is announced again", async () => {
  await advance(5_000);
  check = () => Promise.resolve(available("0.3.0"));
  await advance(SIX_HOURS);
  expect(toasts.map((t) => t.message)).toEqual(["Canto 0.2.0 disponível", "Canto 0.3.0 disponível"]);
});

test("being offline in the background does not raise an error toast", async () => {
  check = () => Promise.reject("sem conexão com o servidor de atualizações");
  await advance(5_000);
  expect(toasts).toEqual([]);
});
