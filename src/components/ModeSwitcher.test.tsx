import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import ModeSwitcher from "./ModeSwitcher";

afterEach(cleanup);

const open = () => fireEvent.click(screen.getByRole("button", { name: "trocar modo do canto" }));

test("the menu stays closed until the icon is clicked", () => {
  render(<ModeSwitcher mode="normal" onPick={() => {}} />);
  expect(screen.queryByRole("menu")).toBeNull();
  open();
  expect(screen.getByRole("menu", { name: "modo do canto" })).toBeDefined();
  expect(screen.getByRole("button", { name: "trocar modo do canto" }).getAttribute("aria-expanded")).toBe("true");
});

test("picking an option reports it and closes the menu", () => {
  const picked: string[] = [];
  render(<ModeSwitcher mode="normal" onPick={(m) => picked.push(m)} />);
  open();
  fireEvent.click(screen.getByRole("menuitemradio", { name: /Maximizado/ }));
  expect(picked).toEqual(["max"]);
  expect(screen.queryByRole("menu")).toBeNull();
});

test("the current mode is checked and is the only tab stop in the menu", () => {
  render(<ModeSwitcher mode="mini" onPick={() => {}} />);
  open();
  const items = screen.getAllByRole("menuitemradio");
  expect(items.map((i) => i.getAttribute("aria-checked"))).toEqual(["true", "false", "false", "false"]);
  expect(items.map((i) => i.tabIndex)).toEqual([0, -1, -1, -1]);
});

test("arrows move through the options and Escape closes without leaving the icon", () => {
  render(<ModeSwitcher mode="normal" onPick={() => {}} />);
  open();
  const items = screen.getAllByRole("menuitemradio");
  expect(document.activeElement).toBe(items[2]);
  fireEvent.keyDown(items[2], { key: "ArrowDown" });
  expect(document.activeElement).toBe(items[3]);
  fireEvent.keyDown(items[3], { key: "ArrowDown" });
  expect(document.activeElement, "wraps around").toBe(items[0]);
  fireEvent.keyDown(items[0], { key: "Escape" });
  expect(screen.queryByRole("menu")).toBeNull();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "trocar modo do canto" }));
});

test("a click outside closes it, and the owner hears about both changes", () => {
  const states: boolean[] = [];
  render(
    <div>
      <ModeSwitcher mode="normal" onPick={() => {}} onOpenChange={(o) => states.push(o)} />
      <p>fora</p>
    </div>,
  );
  open();
  fireEvent.pointerDown(screen.getByText("fora"));
  expect(screen.queryByRole("menu")).toBeNull();
  expect(states).toEqual([true, false]);
});
