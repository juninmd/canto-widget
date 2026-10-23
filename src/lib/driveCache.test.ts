import { beforeEach, expect, test } from "bun:test";
import { cachedPage, driveKey, forgetPages, rememberPage } from "./driveCache";

const page = (id: string) => ({ files: [], next: id });
beforeEach(forgetPages);

test("a listing comes back from the cache until it goes stale", () => {
  const key = driveKey("all", "", " notas ", "");
  rememberPage(key, page("t1"), 0);
  expect(cachedPage(driveKey("all", "", "notas", ""), 60_000)?.next).toBe("t1");
  expect(cachedPage(key, 5 * 60_000 + 1)).toBeNull();
});

test("inside a folder the filter doesn't matter, and the least recently used listing leaves first", () => {
  expect(driveKey("recent", "", "", "f1")).toBe(driveKey("starred", "", "", "f1"));
  for (let i = 0; i < 30; i++) rememberPage(`k${i}`, page(`${i}`), 0);
  cachedPage("k0", 0);
  rememberPage("k30", page("30"), 0);
  expect(cachedPage("k0", 0)?.next).toBe("0");
  expect(cachedPage("k1", 0)).toBeNull();
});
