import { afterEach, beforeEach, expect, jest, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { AgendaItem } from "../lib/api";

const sizes: { width: number; height: number }[] = [];
mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, a?: { width: number; height: number }) => {
    if (cmd === "window_mini_resize" && a) sizes.push({ width: a.width, height: a.height });
    return Promise.resolve(null);
  },
}));

const { default: MiniRail } = await import("./MiniRail");

const alert = (id: string, title: string, extra: Partial<AgendaItem> = {}): AgendaItem => ({
  id,
  title,
  start: new Date(Date.now() + 120_000).toISOString(),
  end: "",
  all_day: false,
  location: "",
  meet: "",
  link: "",
  ...extra,
});
const daily = alert("e1", "Daily");
const ci = alert("pr:canto/x#4", "PR #4 falhou", { tag: "ci", link: "https://github.com/canto/x/pull/4" });

beforeEach(() => {
  sizes.length = 0;
  jest.useFakeTimers();
});
afterEach(() => {
  cleanup();
  jest.useRealTimers();
});

const rail = () => screen.getByRole("group", { name: "avisos pendentes" });
const last = () => sizes[sizes.length - 1];

test("collapsed, the dock asks for the thin strip, tall enough for its rows", () => {
  render(<MiniRail alerts={[daily, ci]} mode="mini" onOpen={() => {}} onMode={() => {}} />);
  expect(last()).toEqual({ width: 24, height: 148 });
});

test("every alert is a button that opens it", () => {
  const opened: string[] = [];
  render(<MiniRail alerts={[daily, ci]} mode="mini" onOpen={(id) => opened.push(id)} onMode={() => {}} />);
  fireEvent.click(screen.getByRole("button", { name: "abrir PR #4 falhou" }));
  expect(opened).toEqual(["pr:canto/x#4"]);
});

test("pointing at the dock shows the icons, pointing at a row shows its text, leaving collapses again", () => {
  render(<MiniRail alerts={[daily, ci]} mode="mini" onOpen={() => {}} onMode={() => {}} />);
  fireEvent.pointerEnter(rail());
  expect(last().width).toBe(56);
  fireEvent.pointerEnter(screen.getByRole("button", { name: "abrir Daily" }));
  expect(last().width).toBe(300);
  fireEvent.pointerLeave(rail());
  expect(last().width, "waits a beat so crossing the gap between rows doesn't flicker").toBe(300);
  act(() => jest.advanceTimersByTime(300));
  expect(last().width).toBe(24);
});

test("moving to the next row within the grace period never shrinks the window", () => {
  render(<MiniRail alerts={[daily, ci]} mode="mini" onOpen={() => {}} onMode={() => {}} />);
  const first = screen.getByRole("button", { name: "abrir Daily" });
  fireEvent.pointerEnter(first);
  const from = sizes.length;
  fireEvent.pointerLeave(first);
  act(() => jest.advanceTimersByTime(100));
  fireEvent.pointerEnter(screen.getByRole("button", { name: "abrir PR #4 falhou" }));
  act(() => jest.advanceTimersByTime(1000));
  expect(sizes.slice(from).every((s) => s.width === 300), "the window flickered between rows").toBe(true);
});

test("a new alert peeks the icons for a moment and then goes back to the bars", () => {
  const { rerender } = render(<MiniRail alerts={[daily]} mode="mini" onOpen={() => {}} onMode={() => {}} />);
  expect(last().width).toBe(24);
  rerender(<MiniRail alerts={[ci, daily]} mode="mini" onOpen={() => {}} onMode={() => {}} />);
  expect(last().width).toBe(56);
  act(() => jest.advanceTimersByTime(3000));
  expect(last().width).toBe(24);
});

test("opening the mode menu makes room for it", () => {
  render(<MiniRail alerts={[daily]} mode="mini" onOpen={() => {}} onMode={() => {}} />);
  fireEvent.pointerEnter(rail());
  fireEvent.click(screen.getByRole("button", { name: "trocar modo do canto" }));
  expect(last().width).toBe(340);
  expect(last().height).toBeGreaterThanOrEqual(300);
});

test("with nothing pending the dock is a single quiet handle that still switches mode", () => {
  const picked: string[] = [];
  render(<MiniRail alerts={[]} mode="mini" onOpen={() => {}} onMode={(m) => picked.push(m)} />);
  expect(screen.getByRole("status", { name: "nenhum aviso pendente" })).toBeDefined();
  expect(screen.queryAllByRole("button", { name: /^abrir / })).toHaveLength(0);
  fireEvent.click(screen.getByRole("button", { name: "trocar modo do canto" }));
  fireEvent.click(screen.getByRole("menuitemradio", { name: /Normal/ }));
  expect(picked).toEqual(["normal"]);
});

test("each row has a 24 px target even while it draws a 6 px bar", () => {
  render(<MiniRail alerts={[daily]} mode="mini" onOpen={() => {}} onMode={() => {}} />);
  const row = screen.getByRole("button", { name: "abrir Daily" });
  expect(row.className).toContain("canto-hit");
  expect(row.className).toContain("w-6");
});

test("the mode menu is pinned inside the dock window so its options are never cut", () => {
  render(<MiniRail alerts={[daily]} mode="mini" onOpen={() => {}} onMode={() => {}} />);
  fireEvent.pointerEnter(rail());
  fireEvent.click(screen.getByRole("button", { name: "trocar modo do canto" }));
  const menu = screen.getByRole("menu");
  expect(menu.className, "anchored to the button, half of it fell outside a window centered on one alert").toContain("fixed");
  expect(menu.className).toContain("left-2");
  expect(menu.className).toContain("top-2");
  expect(menu.className).not.toContain("absolute");
});
