import { describe, expect, test } from "bun:test";
import { keepIfSame, sameData } from "./sameData";

describe("sameData", () => {
  const task = { id: "t1", title: "a", done: false, subtasks: [{ id: "s1", done: false }], priority: null };
  test("fresh copies of the same data are equal", () => {
    expect(sameData([task], [structuredClone(task)])).toBe(true);
    expect(sameData([], [])).toBe(true);
    expect(sameData(null, null)).toBe(true);
  });
  test("any changed, added or missing field is a difference", () => {
    expect(sameData([task], [{ ...task, done: true }])).toBe(false);
    expect(sameData([task], [{ ...task, subtasks: [{ id: "s1", done: true }] }])).toBe(false);
    expect(sameData([task], [task, task])).toBe(false);
    expect(sameData({ a: 1 }, { a: 1, b: undefined })).toBe(false);
    expect(sameData({ a: undefined }, { b: undefined })).toBe(false);
    expect(sameData([1], { 0: 1 })).toBe(false);
    expect(sameData({ a: null }, { a: {} })).toBe(false);
  });
  test("keepIfSame returns the old reference only when nothing changed", () => {
    const prev = [task];
    expect(keepIfSame(prev, [structuredClone(task)])).toBe(prev);
    const next = [{ ...task, title: "b" }];
    expect(keepIfSame(prev, next)).toBe(next);
  });
});
