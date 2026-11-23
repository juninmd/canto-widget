import { expect, test } from "bun:test";
import { CATALOGS } from "../i18n/catalogs";
import { clockLabel, clockOrDay, hourLabel, hourTick, hoursMinutes } from "./clockLabel";
import { currencySign } from "../features/market/market";
import { duration } from "../features/tasks/summary";
import { everyLabel } from "../features/health/health";

const fill = (text: string, params: Record<string, string | number>) => text.replace(/\{(\w+)\}/g, (_, name: string) => String(params[name]));

test("hours of the day and short durations follow the pt-BR catalog", () => {
  expect(hourLabel(14)).toBe("14h");
  expect(hourTick(8)).toBe("8h");
  expect(hoursMinutes(1, 5)).toBe("1h05");
  expect(duration(45)).toBe("45 min");
  expect(duration(120)).toBe("2h");
  expect(duration(95)).toBe("1h35");
  expect(everyLabel(300)).toBe("5 min");
  expect(everyLabel(30)).toBe("30 s");
});

test("English and Spanish write the same hours their own way", () => {
  expect(fill(CATALOGS.en["time.hourOfDay"], { h: 14 })).toBe("14:00");
  expect(fill(CATALOGS.en["time.hMin"], { h: 1, mm: "05" })).toBe("1h 05m");
  expect(fill(CATALOGS.es["time.hourOfDay"], { h: 14 })).toBe("14 h");
  for (const [language, messages] of Object.entries(CATALOGS)) {
    if (language === "pt-BR") continue;
    expect(fill(messages["time.hourOfDay"], { h: 14 }), language).not.toBe("14h");
  }
});

test("the currency sign comes from the language, not a literal", () => {
  expect(currencySign("BRL")).toBe("R$");
  expect(currencySign("USD")).toBe("US$");
  expect(currencySign("not a code")).toBe("not a code");
});

const now = new Date(2026, 9, 9, 10, 0);

test("a moment from today is just the time", () => {
  const at = new Date(2026, 9, 9, 8, 30).getTime();
  expect(clockOrDay(at, now)).toBe(clockLabel(at));
});

test("a moment from another day carries its day, so it is never read as today", () => {
  const at = new Date(2026, 9, 8, 22, 15).getTime();
  const label = clockOrDay(at, now);
  expect(label).toContain("08/10");
  expect(label.endsWith(clockLabel(at))).toBe(true);
});

test("an unreadable timestamp does not throw", () => {
  expect(typeof clockOrDay(Number.NaN, now)).toBe("string");
});
