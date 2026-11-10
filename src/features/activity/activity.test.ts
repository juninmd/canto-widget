import { expect, mock, test } from "bun:test";

mock.module("@tauri-apps/api/core", () => ({ invoke: () => Promise.resolve(null) }));
const { appName, barBox, byCategory, categoryOf, focusStats, hourlyHeat, peakWindow, setCategoryOverrides, streak, hourRange, secsLabel, timelineRows, weekStats, withoutHidden } = await import("./activity");
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
  expect(categoryOf("cs2")).toBe("games");
  expect(categoryOf("steamwebhelper")).toBe("games");
  expect(categoryOf("VALORANT-Win64-Shipping")).toBe("games");
  expect(categoryOf("fullscreen")).toBe("games");
  expect(categoryOf("Discord")).toBe("meet");
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

test("a category the user picked wins over the name rules", () => {
  setCategoryOverrides({ Figma: "docs" });
  expect(categoryOf("Figma")).toBe("docs");
  expect(categoryOf("Code")).toBe("code");
  setCategoryOverrides({});
  expect(categoryOf("Figma")).toBe("other");
});

test("process names turn into readable app names", () => {
  expect(appName("WindowsTerminal.exe")).toBe("Windows Terminal");
  expect(appName("msedge")).toBe("Edge");
  expect(appName("Code")).toBe("Code");
  expect(appName("fullscreen")).toBe("App em tela cheia");
});

test("hourly heat splits a span across the hours it touches", () => {
  const h = hourlyHeat([{ app: "a", start: 9.5 * 3600, end: 10.25 * 3600 }], 0);
  expect(h[9]).toBe(1800);
  expect(h[10]).toBe(900);
  expect(h.reduce((a, b) => a + b, 0)).toBe(2700);
});

test("the peak is the two busiest hours in a row across the days", () => {
  const row = new Array<number>(24).fill(0);
  row[10] = 3000;
  row[11] = 3600;
  row[15] = 4000;
  expect(peakWindow([row])).toEqual([10, 12]);
  expect(peakWindow([new Array<number>(24).fill(0)])).toBeNull();
});

test("the streak counts days on goal and lets an unfinished today wait", () => {
  expect(streak([4, 4, 4, 1], 4)).toBe(3);
  expect(streak([1, 4, 4, 1], 4)).toBe(2);
  expect(streak([4, 1, 4], 4)).toBe(1);
  expect(streak([4, 4], 0)).toBe(0);
});
