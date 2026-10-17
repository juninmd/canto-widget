import { expect, test } from "bun:test";
import { signedPercent } from "./protos";

test("the variation is signed and written in the user's locale", () => {
  expect(signedPercent(0.31)).toBe("+0,31");
  expect(signedPercent(-0.44)).toBe("-0,44");
  expect(signedPercent(1.2)).toBe("+1,2");
  expect(signedPercent(0)).toBe("+0,0");
});
