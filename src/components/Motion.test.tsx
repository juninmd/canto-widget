import { afterEach, expect, test } from "bun:test";
import { useState } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import TabBar, { type Tab } from "./TabBar";
import TaskProgress from "./TaskProgress";
import PriceTick from "./PriceTick";
import { CiPill } from "./ForgePills";
import CountUp from "./CountUp";
import { applySkin } from "../lib/theme";

afterEach(cleanup);

function withLayout(run: () => void) {
  // happy-dom has no layout: give every element a box so the indicator has something to measure.
  const proto = HTMLElement.prototype;
  const saved = ["offsetWidth", "offsetHeight", "offsetLeft", "offsetTop"].map((k) => [k, Object.getOwnPropertyDescriptor(proto, k)] as const);
  Object.defineProperty(proto, "offsetWidth", { configurable: true, get: () => 60 });
  Object.defineProperty(proto, "offsetHeight", { configurable: true, get: () => 32 });
  Object.defineProperty(proto, "offsetLeft", {
    configurable: true,
    get(this: HTMLElement) {
      const tabs = [...(this.parentElement?.querySelectorAll('[role="tab"]') ?? [])];
      return Math.max(0, tabs.indexOf(this)) * 62;
    },
  });
  Object.defineProperty(proto, "offsetTop", { configurable: true, get: () => 0 });
  try {
    run();
  } finally {
    for (const [k, d] of saved) if (d) Object.defineProperty(proto, k, d);
  }
}

test("the tab underline is one bar that slides to the picked tab", () => {
  withLayout(() => {
    function Harness() {
      const [current, setCurrent] = useState<Tab>("tasks");
      return <TabBar current={current} onChange={setCurrent} />;
    }
    const { container } = render(<Harness />);
    const bar = () => container.querySelector<HTMLElement>("[data-tab-indicator]");
    expect(screen.getByRole("tablist").hasAttribute("data-sliding")).toBe(true);
    expect(bar()?.style.transform).toBe("translateX(8px)");
    fireEvent.click(screen.getByRole("tab", { name: /Notas/ }));
    expect(bar()?.style.transform).toBe("translateX(70px)");
    expect(bar()?.style.width).toBe("44px");
  });
});

test("without layout the tabs keep their own underline", () => {
  render(<TabBar current="tasks" onChange={() => {}} />);
  expect(screen.getByRole("tablist").hasAttribute("data-sliding")).toBe(false);
  expect(document.querySelector("[data-tab-indicator]")).toBeNull();
});

test("finishing the last task throws confetti once; opening on a finished day stays quiet", () => {
  const { container, rerender } = render(<TaskProgress done={2} total={2} />);
  expect(container.querySelector("[data-confetti]")).toBeNull();
  rerender(<TaskProgress done={1} total={2} />);
  rerender(<TaskProgress done={2} total={2} />);
  expect(container.querySelector("[data-confetti]")).not.toBeNull();
  rerender(<TaskProgress done={2} total={3} />);
  expect(container.querySelector("[data-confetti]")).toBeNull();
});

test("an empty day shows no '0 de 0' counter; the first task brings it back", () => {
  const { container, rerender } = render(<TaskProgress done={0} total={0} />);
  expect(container.textContent).toBe("");
  rerender(<TaskProgress done={0} total={1} />);
  expect(container.textContent).toBe("0 de 1");
});

test("a price flashes the direction it moved, but not when it first shows", () => {
  const { container, rerender } = render(<PriceTick value={5.4} text="5,40" />);
  const tick = () => container.querySelector("span")!;
  expect(tick().dataset.tick).toBeUndefined();
  rerender(<PriceTick value={5.5} text="5,50" />);
  expect(tick().dataset.tick).toBe("up");
  expect(tick().className).toContain("canto-tick-up");
  rerender(<PriceTick value={5.3} text="5,30" />);
  expect(tick().dataset.tick).toBe("down");
});

test("CI spins while it runs and only pulses for a result that arrives on screen", () => {
  const { container, rerender } = render(<CiPill status="running" />);
  expect(container.querySelector("[data-ci-spin]")).not.toBeNull();
  rerender(<CiPill status="success" />);
  expect(container.querySelector("[data-ci-spin]")).toBeNull();
  expect(container.querySelector<HTMLElement>("[data-ci-settled]")?.dataset.ciSettled).toBe("success");
  cleanup();
  const fresh = render(<CiPill status="failure" />);
  expect(fresh.container.querySelector("[data-ci-settled]")).toBeNull();
});

test("a counted number lands on its value when motion is off", () => {
  render(<CountUp value={71.4} format={(n) => n.toFixed(1)} />);
  expect(document.body.textContent).toBe("71.4");
});

test("switching skins crossfades, the first skin at startup does not", async () => {
  const root = document.documentElement;
  delete root.dataset.skin;
  delete root.dataset.skinFade;
  applySkin("padrao");
  expect(root.hasAttribute("data-skin-fade")).toBe(false);
  applySkin("dracula");
  expect(root.hasAttribute("data-skin-fade")).toBe(true);
  await act(async () => {
    await new Promise((ready) => setTimeout(ready, 450));
  });
  expect(root.hasAttribute("data-skin-fade")).toBe(false);
  localStorage.clear();
});
