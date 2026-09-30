import { expect, mock, test } from "bun:test";

mock.module("@tauri-apps/api/core", () => ({ invoke: () => Promise.resolve(null) }));
const { clock, createFocusStore, isOver, minutesOf } = await import("./focus");

test("clock shows minutes and seconds, and hours only past the hour", () => {
  expect(clock(0)).toBe("00:00");
  expect(clock(754)).toBe("12:34");
  expect(clock(3725)).toBe("1:02:05");
  expect(clock(-5)).toBe("00:00");
  expect(minutesOf(119)).toBe(1);
});

test("a task is over only past its estimate, and never without one", () => {
  expect(isOver(45 * 60, 45)).toBe(false);
  expect(isOver(45 * 60 + 1, 45)).toBe(true);
  expect(isOver(99999, null)).toBe(false);
});

function setup(every = 60_000) {
  let now = 1_000_000;
  const added: [string, number][] = [];
  let fail = false;
  const store = createFocusStore({
    now: () => now,
    every,
    add: (id, secs) => (fail ? Promise.reject(new Error("cofre trancado")) : Promise.resolve(added.push([id, secs]))),
  });
  return { store, added, advance: (ms: number) => (now += ms), failNext: (v: boolean) => (fail = v) };
}

test("pausing saves the elapsed seconds and clears the run", async () => {
  const { store, added, advance } = setup();
  await store.start({ id: "a", title: "A", estimateMin: 25, trackedSecs: 100 });
  advance(90_400);
  expect(store.totalSecs()).toBe(190);
  await store.stop();
  expect(added).toEqual([["a", 90]]);
  expect(store.get()).toBeNull();
});

test("starting another task saves the first one before switching", async () => {
  const { store, added, advance } = setup();
  await store.start({ id: "a", title: "A" });
  advance(30_000);
  await store.start({ id: "b", title: "B" });
  expect(added).toEqual([["a", 30]]);
  expect(store.get()?.id).toBe("b");
  await store.stop();
});

test("a failed save keeps the seconds for the next try and reports the error", async () => {
  const { store, added, advance, failNext } = setup();
  const errors: unknown[] = [];
  store.setHandlers({ onError: (e) => errors.push(e) });
  await store.start({ id: "a", title: "A" });
  advance(45_000);
  failNext(true);
  await store.stop();
  expect(errors).toHaveLength(1);
  expect(added).toEqual([]);
});

test("the periodic flush saves without ending the run and keeps sub-second remainders", async () => {
  const { store, added, advance } = setup(5);
  await store.start({ id: "a", title: "A" });
  advance(60_500);
  await new Promise((r) => setTimeout(r, 30));
  expect(added).toEqual([["a", 60]]);
  expect(store.get()?.id).toBe("a");
  expect(store.unflushed()).toBe(0);
  advance(500);
  expect(store.unflushed()).toBe(1);
  store.discard();
});

test("discard drops the run without saving, for a vault that just locked", async () => {
  const { store, added, advance } = setup();
  await store.start({ id: "a", title: "A" });
  advance(20_000);
  store.discard();
  expect(added).toEqual([]);
  expect(store.totalSecs()).toBe(0);
});
