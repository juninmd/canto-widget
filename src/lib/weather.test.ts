import { expect, test } from "bun:test";
import { clock, conditionKey, degrees, weekday } from "./weather";

test("every condition maps to its sentence and rain is not the percentage key", () => {
  expect(conditionKey("clear")).toBe("weather.clear");
  expect(conditionKey("rain")).toBe("weather.rainy");
  expect(conditionKey("storm")).toBe("weather.storm");
});

test("degrees are whole numbers in the user's locale", () => {
  expect(degrees(22.4)).toBe("22");
  expect(degrees(-3.6)).toBe("-4");
  expect(degrees(21.5)).toBe("22");
});

test("the API's local timestamp becomes a clock time", () => {
  expect(clock("2026-10-17T16:00")).toBe("16:00");
  expect(clock("qualquer coisa")).toBe("qualquer coisa");
});

test("a date becomes the short weekday", () => {
  expect(weekday("2026-10-18")).toBe("dom.");
  expect(weekday("nao e data")).toBe("nao e data");
});
