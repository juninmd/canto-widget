import { afterEach, expect, test } from "bun:test";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import MobileNav from "./MobileNav";
import { TABS, type Tab } from "./TabBar";

function Harness({ start = "tasks" as Tab }) {
  const [current, setCurrent] = useState<Tab>(start);
  return (
    <>
      <MobileNav current={current} onChange={setCurrent} tabs={TABS} />
      <output>{current}</output>
    </>
  );
}

afterEach(cleanup);

test("the bar shows four tabs and a menu button; the rest wait in the sheet", () => {
  render(<Harness />);
  expect(screen.getAllByRole("tab").map((t) => t.textContent)).toEqual(["Tarefas", "Notas", "Clipboard", "Agenda"]);
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.getByRole("button", { name: /mais/ })).toBeTruthy();
});

test("a tab outside the bar opens from the sheet and takes the menu button's place", () => {
  render(<Harness />);
  fireEvent.click(screen.getByRole("button", { name: /mais/ }));
  const sheet = screen.getByRole("dialog");
  expect(sheet.querySelectorAll("button").length).toBe(TABS.length);
  fireEvent.click(screen.getByRole("button", { name: "Ajustes" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.getByRole("status").textContent).toBe("settings");
  const menu = screen.getByRole("button", { name: /Ajustes/ });
  expect(menu.id).toBe("aba-settings");
});

test("Escape and a tap on the backdrop close the sheet", () => {
  render(<Harness />);
  fireEvent.click(screen.getByRole("button", { name: /mais/ }));
  fireEvent.keyDown(window, { key: "Escape" });
  expect(screen.queryByRole("dialog")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: /mais/ }));
  fireEvent.click(screen.getByRole("dialog").parentElement!);
  expect(screen.queryByRole("dialog")).toBeNull();
});

test("the sheet opens on the current tab, keeps Tab inside and hands focus back to the menu button", () => {
  render(<Harness start="settings" />);
  const menu = screen.getByRole("button", { name: /Ajustes/ });
  fireEvent.click(menu);
  const buttons = [...screen.getByRole("dialog").querySelectorAll("button")];
  const last = buttons[buttons.length - 1];
  expect(document.activeElement?.textContent).toBe("Ajustes");
  last.focus();
  fireEvent.keyDown(last, { key: "Tab" });
  expect(document.activeElement === buttons[0]).toBe(true);
  fireEvent.keyDown(buttons[0], { key: "Tab", shiftKey: true });
  expect(document.activeElement === last).toBe(true);
  fireEvent.keyDown(window, { key: "Escape" });
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.activeElement === menu).toBe(true);
});
