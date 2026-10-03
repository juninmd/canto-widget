import { afterEach, expect, test } from "bun:test";
import { cleanup, createEvent, fireEvent, render, screen } from "@testing-library/react";
import Splitter from "./Splitter";

afterEach(cleanup);

function setup(left = 416, total = 1280) {
  const changes: number[] = [];
  const commits: number[] = [];
  render(<Splitter left={left} total={total} onChange={(v) => changes.push(v)} onCommit={(v) => commits.push(v)} />);
  return { changes, commits, bar: screen.getByRole("separator", { name: "largura da lista de tarefas" }) };
}

test("it exposes its value and limits to assistive tech and takes the keyboard", () => {
  const { bar } = setup();
  expect(bar.getAttribute("aria-valuenow")).toBe("416");
  expect(bar.getAttribute("aria-valuemin")).toBe("360");
  expect(bar.getAttribute("aria-valuemax")).toBe("980");
  expect(bar.tabIndex).toBe(0);
});

test("arrow keys resize and remember each step", () => {
  const { bar, commits } = setup();
  fireEvent.keyDown(bar, { key: "ArrowRight" });
  fireEvent.keyDown(bar, { key: "End" });
  expect(commits).toEqual([432, 980]);
});

test("double click restores the default width", () => {
  const { bar, commits } = setup(700);
  fireEvent.doubleClick(bar);
  expect(commits).toEqual([416]);
});

test("dragging follows the pointer within the limits and remembers where it ended", () => {
  const { bar, changes, commits } = setup();
  bar.setPointerCapture = () => {};
  const down = createEvent.pointerDown(bar, { clientX: 400, pointerId: 1 });
  fireEvent(bar, down);
  fireEvent.pointerMove(bar, { clientX: 460, pointerId: 1 });
  fireEvent.pointerMove(bar, { clientX: -2000, pointerId: 1 });
  fireEvent.pointerUp(bar, { pointerId: 1 });
  expect(changes).toEqual([476, 360]);
  expect(commits).toEqual([360]);
  expect(document.body.classList.contains("canto-resizing"), "the cursor would stay stuck").toBe(false);
});

test("moving the pointer without pressing does nothing", () => {
  const { bar, changes } = setup();
  fireEvent.pointerMove(bar, { clientX: 500 });
  expect(changes).toEqual([]);
});
