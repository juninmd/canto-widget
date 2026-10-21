import { expect, test } from "bun:test";
import { ringText } from "./agendaRing";

test("under 100 minutes the ring shows the minutes with their unit", () => {
  expect(ringText(39)).toEqual({ value: "39", unit: "min" });
  expect(ringText(0.4)).toEqual({ value: "0", unit: "min" });
  expect(ringText(-5)).toEqual({ value: "0", unit: "min" });
});

test("from 100 minutes on it switches to hours and minutes, no unit", () => {
  expect(ringText(100)).toEqual({ value: "1h40", unit: "" });
  expect(ringText(125)).toEqual({ value: "2h05", unit: "" });
});
