import { afterEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import type { AgendaItem } from "../../lib/api";

mock.module("@tauri-apps/api/core", () => ({ invoke: () => Promise.resolve(null) }));
mock.module("@tauri-apps/api/event", () => ({ emit: () => Promise.resolve(), listen: () => Promise.resolve(() => {}) }));
mock.module("./sound", () => ({ playAlert: () => {} }));

const { default: Alert } = await import("./Alert");

const base = { end: "", all_day: false, location: "", meet: "", link: "", start: new Date(Date.now() + 5 * 60_000).toISOString() };
const item = (id: string, extra: Partial<AgendaItem> = {}): AgendaItem => ({ ...base, id, title: "Algo aconteceu", ...extra });

afterEach(cleanup);

async function show(e: AgendaItem) {
  render(<Alert events={[e]} onDismiss={() => {}} />);
  await act(async () => {});
  return screen.getByRole("alertdialog");
}

test("each kind of alert gets its own animated backdrop", async () => {
  const cases: [AgendaItem, string][] = [
    [item("e1"), "rings"],
    [item("task:1"), "ticks"],
    [item("mention:1"), "bubbles"],
    [item("model:m"), "sparks"],
    [item("digest:morning"), "rays"],
    [item("pr:ci:o/r#1", { tag: "ci" }), "bugs"],
    [item("status:gh", { tag: "major" }), "pulse"],
  ];
  for (const [e, scene] of cases) {
    const dialog = await show(e);
    expect(dialog.querySelector(`[data-alert-fx="${scene}"]`) === null).toBe(false);
    cleanup();
  }
});

test("a red alert pulses its border, a calm one does not", async () => {
  const red = await show(item("pr:ci:o/r#1", { tag: "ci" }));
  expect(red.className).toContain("wx-severe");
  expect(red.className).toContain("wx-enter-shake");
  cleanup();
  const calm = await show(item("mention:1"));
  expect(calm.className.includes("wx-severe")).toBe(false);
});
