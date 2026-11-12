import { expect, test } from "bun:test";
import { describeCron, nextRuns, parseCron } from "./cron";

const at = (iso: string) => new Date(iso);

test("an expression is valid only with five known fields", () => {
  expect(parseCron("*/15 9-18 * * 1-5")).not.toBeNull();
  expect(parseCron("0 3 * * *")).not.toBeNull();
  expect(parseCron("0 3 * *")).toBeNull();
  expect(parseCron("61 3 * * *")?.[0].has(61)).toBeFalsy();
  expect(parseCron("a b c d e")).toBeNull();
  expect(parseCron("0 0 * * mon")?.[4].has(1)).toBe(true);
  expect(parseCron("0 0 * * 7")?.[4].has(0)).toBe(true);
});

test("next runs follow minute steps, ranges and weekdays", () => {
  const r = nextRuns("*/15 9-18 * * 1-5", at("2026-11-13T08:50:00"), 3);
  expect(r.map((d) => d.getHours() * 100 + d.getMinutes())).toEqual([900, 915, 930]);
  const sat = nextRuns("0 9 * * 1-5", at("2026-11-14T10:00:00"), 1)[0];
  expect(sat.getDay()).toBe(1);
  expect(nextRuns("0 3 1 * *", at("2026-11-12T00:00:00"), 1)[0].getDate()).toBe(1);
  expect(nextRuns("@reboot", at("2026-11-12T00:00:00"))).toEqual([]);
});

test("a day of month and a weekday together fire on either", () => {
  const r = nextRuns("0 0 13 * 5", at("2026-11-01T00:00:00"), 3).map((d) => d.getDate());
  expect(r).toEqual([6, 13, 20]);
});

test("the expression is described in words", () => {
  expect(describeCron("*/15 9-18 * * 1-5")).toBe("A cada 15 minutos, entre 9h e 18h, de segunda a sexta");
  expect(describeCron("0 3 * * *")).toBe("No minuto 0, às 3h");
  expect(describeCron("@daily")).toBe("Todos os dias à meia-noite");
  expect(describeCron("nada")).toBeNull();
});
