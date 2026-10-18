import { expect, test } from "bun:test";
import { price, signedPercent } from "./market";

test("a rate keeps its four decimals and an index gets the thousands separator", () => {
  expect(price(5.0826, 4)).toBe("5,0826");
  expect(price(205430.33, 2)).toBe("205.430,33");
  expect(price(411553, 0)).toBe("411.553");
  expect(price(105, 0)).toBe("105");
});

test("the variation is signed and written in the user's locale", () => {
  expect(signedPercent(0.31)).toBe("+0,31");
  expect(signedPercent(-0.44)).toBe("-0,44");
  expect(signedPercent(1.2)).toBe("+1,20");
  expect(signedPercent(0)).toBe("+0,00");
});
