import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { TABS } from "./TabBar";
import TabDock from "./TabDock";

afterEach(cleanup);

test("the bar holds the first four tabs and the grid opens every tab", () => {
  const onChange = mock(() => {});
  render(<TabDock current="tasks" onChange={onChange} tabs={TABS} />);
  expect(screen.getAllByRole("tab")).toHaveLength(4);
  expect(screen.queryByRole("dialog")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "todas as abas" }));
  const grid = screen.getByRole("dialog", { name: "todas as abas" });
  expect(grid.querySelectorAll("button")).toHaveLength(TABS.length);
  fireEvent.click(screen.getByRole("button", { name: /Ajustes/ }));
  expect(onChange).toHaveBeenCalledWith("settings");
  expect(screen.queryByRole("dialog")).toBeNull();
});

test("a tab opened from the grid stays on the bar", () => {
  render(<TabDock current="settings" onChange={() => {}} tabs={TABS} />);
  expect(screen.getAllByRole("tab")).toHaveLength(5);
  expect(screen.getByRole("tab", { name: "Ajustes" }).getAttribute("aria-selected")).toBe("true");
});

test("Escape closes the grid", () => {
  render(<TabDock current="tasks" onChange={() => {}} tabs={TABS} />);
  fireEvent.click(screen.getByRole("button", { name: "todas as abas" }));
  fireEvent.keyDown(window, { key: "Escape" });
  expect(screen.queryByRole("dialog")).toBeNull();
});
