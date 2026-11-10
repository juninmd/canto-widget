import { expect, mock, test } from "bun:test";

mock.module("@tauri-apps/api/core", () => ({ invoke: () => Promise.resolve(null) }));
const { axisTicks, donutArcs, mergeApps, mergeFocus, peakHour, weekSeries } = await import("./activityView");
import type { Day } from "./activityView";
import type { Category } from "./activity";

test("the peak hour is the hour with the most active time, and absent without records", () => {
  const day = 1_000_000;
  const at = (h: number) => day + h * 3600;
  const spans = [
    { app: "a", start: at(9), end: at(9.25) },
    { app: "a", start: at(10), end: at(10.75) },
  ];
  expect(peakHour(spans, day)).toEqual({ hour: 10, secs: 2700 });
  expect(peakHour([], day)).toBeNull();
});

test("donut slices follow the shares, leave a small gap and start where the last one ended", () => {
  const arcs = donutArcs([{ category: "code", secs: 75 }, { category: "meet", secs: 25 }], 100, 2);
  expect(arcs.map((a) => a.category)).toEqual(["code", "meet"]);
  expect(arcs[0].offset).toBe(0);
  expect(arcs[0].dash).toBeCloseTo(73);
  expect(arcs[1].offset).toBeCloseTo(75);
  expect(arcs[1].dash).toBeCloseTo(23);
  const tiny = donutArcs([{ category: "code", secs: 99 }, { category: "meet", secs: 1 }], 100, 2);
  expect(tiny[1].dash).toBeCloseTo(1);
});

test("the time axis labels every even hour of the range", () => {
  expect(axisTicks([8, 18])).toEqual([8, 10, 12, 14, 16, 18]);
  expect(axisTicks([7, 19])).toEqual([8, 10, 12, 14, 16, 18]);
});

test("the week series runs oldest to newest, stacks code first and flags the days on goal", () => {
  const day = (ms: number, apps: { app: string; secs: number }[]): Day => ({ day: ms, apps, spans: [], idle: [], idleSecs: 0, focus: [] });
  const days = [
    day(3, [{ app: "Slack", secs: 600 }, { app: "Code", secs: 7200 }]),
    day(2, [{ app: "Code", secs: 1800 }]),
    day(1, []),
  ];
  const out = weekSeries(days, new Set<Category>(), 3600);
  expect(out.map((d) => d.day)).toEqual([1, 2, 3]);
  expect(out[2].stack.map((c) => c.category)).toEqual(["code", "chat"]);
  expect(out.map((d) => d.met)).toEqual([false, false, true]);
  const filtered = weekSeries(days, new Set<Category>(["code"]), 3600);
  expect(filtered[2].total).toBe(600);
  expect(filtered[2].met).toBe(true);
  expect(weekSeries(days, new Set(), 0).every((d) => !d.met)).toBe(true);
});

test("several days merge into one ranking of applications and one of tasks", () => {
  const mk = (apps: { app: string; secs: number }[], focus: { task: string; title: string | null; secs: number }[]): Day => ({ day: 0, apps, spans: [], idle: [], idleSecs: 0, focus });
  const days = [
    mk([{ app: "Code", secs: 100 }, { app: "Slack", secs: 50 }], [{ task: "a", title: null, secs: 30 }]),
    mk([{ app: "Slack", secs: 80 }], [{ task: "a", title: "Revisar PR", secs: 10 }, { task: "b", title: "Docs", secs: 60 }]),
  ];
  expect(mergeApps(days)).toEqual([{ app: "Slack", secs: 130 }, { app: "Code", secs: 100 }]);
  expect(mergeFocus(days)).toEqual([{ task: "b", title: "Docs", secs: 60 }, { task: "a", title: "Revisar PR", secs: 40 }]);
});
