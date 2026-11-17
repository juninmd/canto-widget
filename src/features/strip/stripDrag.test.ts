import { expect, test } from "bun:test";
import { createPillDrag, DRAG_SLOP } from "./stripDrag";

function setup() {
  const calls: [number, boolean][] = [];
  const drag = createPillDrag((grab, commit) => {
    calls.push([grab, commit]);
    return Promise.resolve();
  });
  return { drag, calls };
}

test("a press that barely moves stays a click", () => {
  const { drag, calls } = setup();
  drag.down(100, 90);
  expect(drag.move(100 + DRAG_SLOP - 1)).toBe(false);
  drag.up();
  expect(calls).toEqual([]);
  expect(drag.moved()).toBe(false);
});

test("a drag follows with the grab point and saves on the drop, then swallows one click", async () => {
  const { drag, calls } = setup();
  drag.down(100, 90);
  expect(drag.move(140)).toBe(true);
  await Promise.resolve();
  drag.up();
  expect(calls).toEqual([[10, false], [10, true]]);
  expect(drag.moved()).toBe(true);
  expect(drag.moved()).toBe(false);
});

test("moves without a press do nothing", () => {
  const { drag, calls } = setup();
  expect(drag.move(500)).toBe(false);
  drag.up();
  expect(calls).toEqual([]);
});
