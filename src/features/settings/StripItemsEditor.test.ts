import { expect, test } from "bun:test";
import { editorRows, move } from "./StripItemsEditor";
import { STRIP_ITEMS } from "../../lib/api";

test("switched-on items lead in the pill's order, then every other item once", () => {
  const rows = editorRows(["event", "cpu"]);
  expect(rows.slice(0, 2)).toEqual(["event", "cpu"]);
  expect(rows).toHaveLength(STRIP_ITEMS.length);
  expect(new Set(rows).size).toBe(STRIP_ITEMS.length);
});

test("an item moves one place and the ends stay put", () => {
  expect(move(["cpu", "event", "tasks"], "tasks", -1)).toEqual(["cpu", "tasks", "event"]);
  expect(move(["cpu", "event"], "cpu", -1)).toEqual(["cpu", "event"]);
  expect(move(["cpu", "event"], "event", 1)).toEqual(["cpu", "event"]);
  expect(move(["cpu"], "gpu", 1)).toEqual(["cpu"]);
});
