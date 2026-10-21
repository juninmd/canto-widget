import { afterEach, expect, test } from "bun:test";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { TABS, type Tab } from "./TabBar";
import TabRail from "./TabRail";

afterEach(cleanup);

function Harness({ tabs = TABS }: { tabs?: typeof TABS }) {
  const [current, setCurrent] = useState<Tab>("tasks");
  const [pinned, setPinned] = useState(false);
  return <TabRail current={current} onChange={setCurrent} tabs={tabs} pinned={pinned} onPinned={setPinned} />;
}

const selected = () => screen.getAllByRole("tab").find((t) => t.getAttribute("aria-selected") === "true");

test("every tab is on the rail, named even while only the icons show", () => {
  render(<Harness />);
  const names = screen.getAllByRole("tab").map((t) => t.getAttribute("aria-label"));
  expect(names).toEqual(TABS.map((t) => t.label));
  expect(screen.getByRole("tablist").getAttribute("aria-orientation")).toBe("vertical");
});

test("only the open tab is a Tab stop and a click switches tabs", () => {
  render(<Harness />);
  expect(screen.getAllByRole("tab").filter((t) => t.tabIndex === 0).map((t) => t.getAttribute("aria-label"))).toEqual(["Tarefas"]);
  fireEvent.click(screen.getByRole("tab", { name: "GitHub" }));
  expect(selected()?.getAttribute("aria-label")).toBe("GitHub");
});

test("up and down move between tabs, wrapping, and Home/End jump to the edges", () => {
  render(<Harness />);
  const list = screen.getByRole("tablist");
  fireEvent.keyDown(list, { key: "ArrowUp" });
  expect(selected()?.getAttribute("aria-label")).toBe("Ajustes");
  expect(document.activeElement).toBe(selected()!);
  fireEvent.keyDown(list, { key: "ArrowDown" });
  expect(selected()?.getAttribute("aria-label")).toBe("Tarefas");
  fireEvent.keyDown(list, { key: "End" });
  expect(selected()?.getAttribute("aria-label")).toBe("Ajustes");
  fireEvent.keyDown(list, { key: "Home" });
  expect(selected()?.getAttribute("aria-label")).toBe("Tarefas");
});

test("left and right do nothing: the arrows follow the bar's direction", () => {
  render(<Harness />);
  fireEvent.keyDown(screen.getByRole("tablist"), { key: "ArrowRight" });
  expect(selected()?.getAttribute("aria-label")).toBe("Tarefas");
});

test("Ajustes stays last, after the groups", () => {
  render(<Harness />);
  const tabs = screen.getAllByRole("tab");
  expect(tabs[tabs.length - 1].getAttribute("aria-label")).toBe("Ajustes");
});

test("the pin button toggles and says what it will do", () => {
  render(<Harness />);
  const pin = screen.getByRole("button", { name: "manter aberta" });
  expect(pin.getAttribute("aria-pressed")).toBe("false");
  fireEvent.click(pin);
  expect(screen.getByRole("button", { name: "recolher barra" }).getAttribute("aria-pressed")).toBe("true");
});

test("hidden tabs leave the rail", () => {
  render(<Harness tabs={TABS.filter((t) => t.id === "tasks" || t.id === "settings")} />);
  expect(screen.getAllByRole("tab")).toHaveLength(2);
});
