import { beforeEach, expect, test } from "bun:test";
import { loadSeen, markSeen, newComments, parseSeen, rememberItems } from "./forgeSeen";
import type { ForgeItem } from "../../lib/api";

const item = (n: number, comments: number) => ({ url: `u/${n}`, comments }) as ForgeItem;

beforeEach(() => localStorage.clear());

test("corrupt storage reads as nothing seen", () => {
  expect(parseSeen("{oops")).toEqual({});
  expect(parseSeen("[1]")).toEqual({});
  expect(parseSeen(null)).toEqual({});
  expect(parseSeen('{"a":1,"b":"x"}')).toEqual({ a: 1 });
});

test("a first sight sets the baseline, so only later comments count as news", () => {
  rememberItems([item(1, 4)]);
  expect(newComments(loadSeen(), item(1, 4))).toBe(0);
  expect(newComments(loadSeen(), item(1, 7))).toBe(3);
  expect(newComments(loadSeen(), item(2, 9))).toBe(0);
});

test("remembering never overwrites what was already seen, and opening an item catches it up", () => {
  rememberItems([item(1, 4)]);
  rememberItems([item(1, 9)]);
  expect(loadSeen()["u/1"]).toBe(4);
  markSeen(item(1, 9));
  expect(newComments(loadSeen(), item(1, 9))).toBe(0);
});

test("the store stays bounded", () => {
  rememberItems(Array.from({ length: 320 }, (_, i) => item(i, 1)));
  const keys = Object.keys(loadSeen());
  expect(keys).toHaveLength(300);
  expect(keys.at(-1)).toBe("u/319");
});
