import { describe, expect, test } from "bun:test";
import { conflicts, duration, freeLabel, horizon, nextFree } from "./agendaFree";
import type { AgendaItem } from "./api";

const at = (hm: string) => new Date(`2026-09-09T${hm}:00`);
const ev = (id: string, start: string, end: string, over: Partial<AgendaItem> = {}): AgendaItem => ({
  id,
  title: id,
  start: at(start).toISOString(),
  end: at(end).toISOString(),
  all_day: false,
  location: "",
  meet: "",
  link: "",
  ...over,
});
const hm = (d: Date | null) => (d ? `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}` : null);
const slot = (items: AgendaItem[], now: string) => {
  const s = nextFree(items, at(now));
  return s && { start: hm(s.start), end: hm(s.end), now: s.now };
};

describe("next free time", () => {
  test("free now until the next event", () => {
    expect(slot([ev("a", "10:00", "11:00")], "09:00")).toEqual({ start: "09:00", end: "10:00", now: true });
  });

  test("an ongoing event pushes the slot to its end", () => {
    expect(slot([ev("a", "08:30", "09:30"), ev("b", "11:00", "12:00")], "09:00")).toEqual({
      start: "09:30",
      end: "11:00",
      now: false,
    });
  });

  test("overlapping and back-to-back events form one busy block", () => {
    const items = [ev("a", "09:00", "10:00"), ev("b", "09:30", "10:30"), ev("c", "10:30", "11:00"), ev("d", "14:00", "15:00")];
    expect(slot(items, "09:15")).toEqual({ start: "11:00", end: "14:00", now: false });
  });

  test("a gap shorter than 15 minutes is skipped", () => {
    const items = [ev("a", "09:00", "10:00"), ev("b", "10:10", "11:00"), ev("c", "12:00", "13:00")];
    expect(slot(items, "09:00")).toEqual({ start: "11:00", end: "12:00", now: false });
    expect(slot([ev("a", "09:10", "10:00")], "09:00"), "10 min before the meeting doesn't count").toEqual({
      start: "10:00",
      end: null,
      now: false,
    });
  });

  test("declined invites and all-day events don't take time", () => {
    const items = [ev("a", "09:00", "12:00", { response: "declined" }), ev("b", "00:00", "23:59", { all_day: true })];
    expect(slot(items, "09:00")).toEqual({ start: "09:00", end: null, now: true });
  });

  test("the working day ends at 19:00; after that the horizon is midnight", () => {
    expect(hm(horizon(at("09:00")))).toBe("19:00");
    expect(horizon(at("20:00")).getDate()).toBe(10);
    expect(slot([ev("a", "17:00", "18:50"), ev("b", "20:00", "21:00")], "17:30"), "10 min left before 19:00").toBeNull();
    expect(slot([ev("a", "18:00", "20:00")], "17:00")).toEqual({ start: "17:00", end: "18:00", now: true });
    expect(slot([ev("a", "21:00", "22:00")], "20:00")).toEqual({ start: "20:00", end: "21:00", now: true });
    expect(slot([], "23:50")).toBeNull();
  });

  test("labels in pt-BR", () => {
    const now = at("09:00");
    expect(freeLabel(nextFree([ev("a", "10:00", "11:00")], now), now)).toBe("livre agora até 10:00");
    expect(freeLabel(nextFree([], now), now)).toBe("livre pelo resto do dia");
    expect(freeLabel(nextFree([ev("a", "08:00", "15:00")], now), now)).toBe("livre a partir de 15:00 pelo resto do dia");
    const busy = [ev("a", "08:00", "14:30"), ev("b", "16:00", "17:00")];
    expect(freeLabel(nextFree(busy, now), now)).toBe("próximo tempo livre: 14:30–16:00 (1 h 30 min)");
    expect(freeLabel(null, now)).toBe("sem janela livre de 15 min até 19:00");
  });

  test("durations", () => {
    expect(duration(45)).toBe("45 min");
    expect(duration(120)).toBe("2 h");
    expect(duration(119.8)).toBe("2 h");
    expect(duration(95)).toBe("1 h 35 min");
  });
});

describe("conflicts", () => {
  test("partial and contained overlaps flag both events with the other's title", () => {
    const got = conflicts([ev("a", "09:00", "10:00"), ev("b", "09:30", "10:30"), ev("c", "09:40", "09:50")]);
    expect(got.get("a")).toEqual(["b", "c"]);
    expect(got.get("b")).toEqual(["a", "c"]);
    expect(got.get("c")).toEqual(["a", "b"]);
  });

  test("events only touching at the edges don't conflict", () => {
    expect(conflicts([ev("a", "09:00", "10:00"), ev("b", "10:00", "11:00")]).size).toBe(0);
  });

  test("declined and all-day events never conflict", () => {
    const items = [
      ev("a", "09:00", "10:00"),
      ev("b", "09:30", "10:30", { response: "declined" }),
      ev("c", "00:00", "23:59", { all_day: true }),
    ];
    expect(conflicts(items).size).toBe(0);
  });
});
