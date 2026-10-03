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

// A DOM without layout: every tab "measures" 70 px, the more button 50 px and the bar 300 px.
function withLayout(run: () => void) {
  const proto = HTMLElement.prototype;
  const off = Object.getOwnPropertyDescriptor(proto, "offsetWidth");
  const cli = Object.getOwnPropertyDescriptor(proto, "clientWidth");
  Object.defineProperty(proto, "offsetWidth", {
    configurable: true,
    get(this: HTMLElement) {
      return this.hasAttribute("data-ruler") ? (this.dataset.label?.startsWith("mais") ? 50 : 70) : 0;
    },
  });
  Object.defineProperty(proto, "clientWidth", { configurable: true, get: () => 300 });
  try {
    run();
  } finally {
    if (off) Object.defineProperty(proto, "offsetWidth", off);
    else delete (proto as unknown as Record<string, unknown>).offsetWidth;
    if (cli) Object.defineProperty(proto, "clientWidth", cli);
    else delete (proto as unknown as Record<string, unknown>).clientWidth;
  }
}

const bar = () => screen.getAllByRole("tab").map((t) => t.textContent);

test("tabs that don't fit go to a 'mais' menu instead of being cut", () => {
  withLayout(() => {
    render(<Harness />);
    expect(bar()).toEqual(["Tarefas", "Notas", "Clipboard"]);
    fireEvent.click(screen.getByRole("button", { name: /mais/ }));
    const menu = screen.getByRole("menu");
    const items = screen.getAllByRole("menuitem").map((i) => i.textContent);
    expect(items).toHaveLength(7);
    expect(items[0]).toContain("Agenda");
    expect(items[0]).toContain("Alt+4");
    expect(menu).toBeDefined();
  });
});

test("picking a tab from the menu opens it and keeps it on the bar", () => {
  withLayout(() => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: /mais/ }));
    fireEvent.click(screen.getByRole("menuitem", { name: /GitHub/ }));
    expect(screen.queryByRole("menu")).toBeNull();
    expect(selected()?.textContent).toBe("GitHub");
    expect(bar()).toContain("GitHub");
    expect(bar()).toHaveLength(3);
  });
});

test("the open tab is on the bar even when it would not fit", () => {
  withLayout(() => {
    function Start() {
      const [current, setCurrent] = useState<Tab>("settings");
      return <TabBar current={current} onChange={setCurrent} />;
    }
    render(<Start />);
    expect(bar()).toContain("Ajustes");
    expect(selected()?.textContent).toBe("Ajustes");
  });
});

test("End jumps to a tab that was in the menu and the focus follows it", () => {
  withLayout(() => {
    render(<Harness />);
    fireEvent.keyDown(screen.getByRole("tablist"), { key: "End" });
    expect(selected()?.textContent).toBe("Ajustes");
    expect(document.activeElement?.textContent, "the focus would be lost with the menu").toBe("Ajustes");
  });
});

test("Esc closes the menu and a click outside does too", () => {
  withLayout(() => {
    render(
      <>
        <Harness />
        <p>fora</p>
      </>,
    );
    fireEvent.click(screen.getByRole("button", { name: /mais/ }));
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /mais/ }));
    fireEvent.pointerDown(screen.getByText("fora"));
    expect(screen.queryByRole("menu")).toBeNull();
  });
});

test("with room for everything there is no 'mais' button", () => {
  render(<Harness />);
  expect(screen.queryByRole("button", { name: /mais/ })).toBeNull();
  expect(bar()).toHaveLength(10);
});
