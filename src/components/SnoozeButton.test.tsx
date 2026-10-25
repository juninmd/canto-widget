import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import SnoozeButton from "./SnoozeButton";
import { saveSnooze } from "../lib/snooze";

beforeEach(() => saveSnooze(5));
afterEach(cleanup);

test("the menu opens on the current choice and arrows rove through the options", () => {
  render(<SnoozeButton onSnooze={() => {}} />);
  fireEvent.click(screen.getByLabelText("escolher quanto tempo adiar"));
  const items = screen.getAllByRole("menuitem");
  expect(document.activeElement === items[1]).toBe(true);
  fireEvent.keyDown(items[1], { key: "ArrowDown" });
  expect(document.activeElement === items[2]).toBe(true);
  fireEvent.keyDown(items[2], { key: "ArrowDown" });
  expect(document.activeElement === items[0]).toBe(true);
  fireEvent.keyDown(items[0], { key: "End" });
  expect(document.activeElement === items[2]).toBe(true);
});

test("Esc closes only the menu and hands focus back to the chevron", () => {
  const outer = mock(() => {});
  render(
    <div onKeyDown={outer}>
      <SnoozeButton onSnooze={() => {}} />
    </div>,
  );
  const chevron = screen.getByLabelText("escolher quanto tempo adiar");
  fireEvent.click(chevron);
  fireEvent.keyDown(screen.getAllByRole("menuitem")[0], { key: "Escape" });
  expect(screen.queryByRole("menu")).toBeNull();
  expect(document.activeElement === chevron).toBe(true);
  expect(outer).not.toHaveBeenCalled();
});

test("picking an option snoozes with it and closes the menu", () => {
  const onSnooze = mock((_m: number) => {});
  render(<SnoozeButton onSnooze={onSnooze} />);
  fireEvent.click(screen.getByLabelText("escolher quanto tempo adiar"));
  fireEvent.click(screen.getAllByRole("menuitem")[2]);
  expect(onSnooze).toHaveBeenCalledWith(10);
  expect(screen.queryByRole("menu")).toBeNull();
});
