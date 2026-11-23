import { expect, test } from "bun:test";
import { prSize } from "./forgeSize";

test("size grows with the changed lines and the limits are inclusive upward", () => {
  expect([0, 29, 30, 99, 100, 299, 300, 699, 700].map((n) => prSize(n, 0))).toEqual(["PP", "PP", "P", "P", "M", "M", "G", "G", "GG"]);
  expect(prSize(200, 100)).toBe("G");
});
