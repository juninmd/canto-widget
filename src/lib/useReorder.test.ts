import { expect, test } from "bun:test";
import { mergeOrder, moveId } from "./useReorder";

test("moveId puts the item where the target was", () => {
  expect(moveId(["a", "b", "c"], "a", "c")).toEqual(["b", "c", "a"]);
  expect(moveId(["a", "b"], "a", "a")).toBeNull();
});

test("mergeOrder rewrites only the visible slots", () => {
  expect(mergeOrder(["a", "x", "b", "y", "c"], ["c", "a", "b"])).toEqual(["c", "x", "a", "y", "b"]);
});
