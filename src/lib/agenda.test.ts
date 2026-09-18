import { describe, expect, test } from "bun:test";
import { dayWindow, minutesUntil, shouldAlert, status } from "./agenda";
import type { AgendaItem } from "./api";

const base: AgendaItem = {
  id: "e1",
  title: "Daily",
  start: "",
  end: "",
  all_day: false,
  location: "",
  meet: "",
  link: "",
};

const inMinutes = (m: number, now: Date, id = "e1"): AgendaItem => ({
  ...base,
  id,
  start: new Date(now.getTime() + m * 60_000).toISOString(),
});

describe("agenda", () => {
  const now = new Date("2026-09-09T09:00:00");

  test("day window covers from midnight to the end of the day locally", () => {
    const { timeMin, timeMax } = dayWindow(now);
    expect(new Date(timeMin).getHours()).toBe(0);
    expect(new Date(timeMax).getHours()).toBe(23);
    expect(new Date(timeMin).getDate()).toBe(9);
  });

  test("alert fires for an event starting within 1 minute", () => {
    const items = [inMinutes(0.5, now)];
    expect(shouldAlert(items, new Set(), now).map((i) => i.id)).toEqual(["e1"]);
  });

  test("does not alert a distant event", () => {
    expect(shouldAlert([inMinutes(30, now)], new Set(), now)).toHaveLength(0);
  });

  test("does not repeat an already fired alert", () => {
    const items = [inMinutes(0.2, now)];
    expect(shouldAlert(items, new Set(["e1"]), now)).toHaveLength(0);
  });

  test("stops alerting an event that started more than 2 minutes ago", () => {
    expect(shouldAlert([inMinutes(-5, now)], new Set(), now)).toHaveLength(0);
    expect(shouldAlert([inMinutes(-1, now)], new Set(), now)).toHaveLength(1);
  });

  test("an all-day event never becomes a pop-up", () => {
    const holiday: AgendaItem = { ...base, id: "f", all_day: true, start: "2026-09-09" };
    expect(shouldAlert([holiday], new Set(), now)).toHaveLength(0);
    expect(minutesUntil(holiday, now)).toBe(Number.POSITIVE_INFINITY);
  });

  test("an invalid date does not break the calculation", () => {
    expect(minutesUntil({ ...base, start: "nao-e-data" }, now)).toBe(Number.POSITIVE_INFINITY);
  });
});

describe("status", () => {
  const now = new Date("2026-09-14T10:00:00Z");
  const event = (start: string, end: string) => ({ ...base, start, end });

  test("an ongoing meeting says 'now' in text, not only via color", () => {
    expect(status(event("2026-09-14T09:50:00Z", "2026-09-14T10:30:00Z"), now)).toEqual({ label: "agora", now: true });
  });

  test("a meeting that already ended does not show as now", () => {
    expect(status(event("2026-09-14T09:00:00Z", "2026-09-14T09:30:00Z"), now).label).toBe("encerrado");
  });

  test("the next meeting shows how long is left in minutes and hours", () => {
    expect(status(event("2026-09-14T10:07:30Z", "2026-09-14T11:00:00Z"), now).label).toBe("em 8 min");
    expect(status(event("2026-09-14T11:35:00Z", "2026-09-14T12:00:00Z"), now).label).toBe("em 1h35");
  });

  test("an all-day event gets no countdown", () => {
    expect(status({ ...base, all_day: true, start: "2026-09-14" }, now).label).toBe("");
  });
});
