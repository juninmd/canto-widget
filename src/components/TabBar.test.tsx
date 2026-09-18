import { afterEach, expect, test } from "bun:test";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import TabBar, { type Tab } from "./TabBar";

function Harness() {
  const [current, setCurrent] = useState<Tab>("tasks");
  return <TabBar current={current} onChange={setCurrent} />;
}

afterEach(cleanup);

const selected = () => screen.getAllByRole("tab").find((t) => t.getAttribute("aria-selected") === "true");

test("only the active tab is a Tab stop: the keyboard does not walk through six stops", () => {
  render(<Harness />);
  const stops = screen.getAllByRole("tab").filter((t) => t.tabIndex === 0);
  expect(stops.map((t) => t.textContent)).toEqual(["Tarefas"]);
});

test("aria-controls only points at a panel that exists on screen", () => {
  render(
    <>
      <Harness />
      <main id="panel-tasks" role="tabpanel" />
    </>,
  );
  const refs = screen.getAllByRole("tab").map((t) => t.getAttribute("aria-controls")).filter(Boolean);
  expect(refs).toEqual(["panel-tasks"]);
  expect(refs.every((id) => document.getElementById(id!))).toBe(true);
});

test("arrows switch tabs, wrapping at start and end", () => {
  render(<Harness />);
  const list = screen.getByRole("tablist");
  fireEvent.keyDown(list, { key: "ArrowLeft" });
  expect(selected()?.textContent).toBe("Ajustes");
  expect(document.activeElement).toBe(selected()!);
  fireEvent.keyDown(list, { key: "ArrowRight" });
  expect(selected()?.textContent).toBe("Tarefas");
});

test("Home and End jump to the edge tabs", () => {
  render(<Harness />);
  const list = screen.getByRole("tablist");
  fireEvent.keyDown(list, { key: "End" });
  expect(selected()?.textContent).toBe("Ajustes");
  fireEvent.keyDown(list, { key: "Home" });
  expect(selected()?.textContent).toBe("Tarefas");
});
