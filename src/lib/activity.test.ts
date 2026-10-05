import { expect, mock, test } from "bun:test";

mock.module("@tauri-apps/api/core", () => ({ invoke: () => Promise.resolve(null) }));
const { barBox, byCategory, categoryOf, focusStats, hourRange, secsLabel, timelineRows, weekStats, withoutHidden } = await import("./activity");
import type { Category } from "./activity";

test("applications land in a category by name, and a call app counts as a meeting before a chat", () => {
  expect(categoryOf("Code")).toBe("code");
  expect(categoryOf("WindowsTerminal")).toBe("code");
  expect(categoryOf("zoom.us")).toBe("meet");
  expect(categoryOf("Microsoft Teams")).toBe("meet");
  expect(categoryOf("Slack")).toBe("chat");
  expect(categoryOf("firefox")).toBe("web");
  expect(categoryOf("Notion")).toBe("docs");
  expect(categoryOf("Calculadora")).toBe("other");
});

test("time per category adds the applications up, biggest first, and skips empty ones", () => {
  const out = byCategory([
    { app: "Code", secs: 3600 },
    { app: "Slack", secs: 600 },
    { app: "Terminal", secs: 1800 },
  ]);
  expect(out).toEqual([
    { category: "code", secs: 5400 },
    { category: "chat", secs: 600 },
  ]);
  expect(secsLabel(5400)).toBe("1h30");
  expect(secsLabel(59)).toBe("1 min");
});

test("the timeline covers the workday and widens to the first and last span", () => {
  const day = 1_000_000;
  const at = (h: number) => day + h * 3600;
  expect(hourRange([], day)).toEqual([8, 18]);
  expect(hourRange([{ app: "a", start: at(6.5), end: at(7) }, { app: "a", start: at(19), end: at(20.2) }], day)).toEqual([6, 21]);
});

test("a span becomes a left offset and width inside the visible hours, clipped at the edges", () => {
  const day = 0;
  const box = barBox({ app: "a", start: 9 * 3600, end: 10 * 3600 }, day, [8, 18]);
  expect(box.left).toBeCloseTo(10);
  expect(box.width).toBeCloseTo(10);
  const clipped = barBox({ app: "a", start: 7 * 3600, end: 9 * 3600 }, day, [8, 18]);
  expect(clipped.left).toBe(0);
  expect(clipped.width).toBeCloseTo(10);
});

test("timeline rows follow the ranking and carry only their own spans", () => {
  const spans = [
    { app: "Code", start: 1, end: 2 },
    { app: "Slack", start: 3, end: 4 },
  ];
  const rows = timelineRows(spans, [{ app: "Code", secs: 9 }, { app: "Slack", secs: 1 }], 1);
  expect(rows).toHaveLength(1);
  expect(rows[0].spans).toEqual([spans[0]]);
});

test("hidden categories drop their apps and spans", () => {
  const apps = [{ app: "Code", secs: 1 }, { app: "Slack", secs: 2 }];
  expect(withoutHidden(apps, new Set<Category>(["chat"]))).toEqual([apps[0]]);
  expect(withoutHidden(apps, new Set())).toBe(apps);
});

test("focus stats merge touching spans of one app and count every change of app", () => {
  const s = (app: string, a: number, b: number) => ({ app, start: a, end: b });
  const out = focusStats([s("Code", 0, 600), s("Code", 630, 1200), s("Slack", 1200, 1300), s("Code", 1300, 1400)]);
  expect(out.longest).toEqual({ app: "Code", start: 0, secs: 1200 });
  expect(out.switches).toBe(2);
  expect(focusStats([]).switches).toBe(0);
});

test("week stats average only the days with records and point at the busiest", () => {
  expect(weekStats([100, 0, 300])).toEqual({ average: 200, best: 2 });
  expect(weekStats([0, 0])).toEqual({ average: 0, best: -1 });
});
