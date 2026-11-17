import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { StripConfig, StripSnapshot } from "../../lib/api";

const calls: string[] = [];
let dnd = { active: false, untilMs: null as number | null };

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string) => {
    calls.push(cmd);
    if (cmd === "dnd_get") return Promise.resolve(dnd);
    if (cmd === "dnd_set") return Promise.resolve({ active: true, untilMs: Date.now() + 3_600_000 });
    if (cmd === "dnd_clear") return Promise.resolve({ active: false, untilMs: null });
    return Promise.resolve(null);
  },
}));
mock.module("@tauri-apps/api/event", () => ({ listen: () => Promise.resolve(() => {}) }));

const { default: StripDetails } = await import("./StripDetails");

afterEach(() => {
  cleanup();
  calls.length = 0;
  dnd = { active: false, untilMs: null };
});

const cfg = { items: [], columns: 2, charts: false } as unknown as StripConfig;
const snap = {} as StripSnapshot;
const view = () => render(<StripDetails cfg={cfg} snap={snap} onOpen={() => {}} onCustomize={() => {}} onHide={() => {}} />);

test("the pause button turns do-not-disturb on for an hour and then off again", async () => {
  view();
  fireEvent.click(await screen.findByText("Pausar alertas 1 h"));
  expect(await screen.findByText("Retomar alertas")).toBeTruthy();
  expect(calls).toContain("dnd_set");
  fireEvent.click(screen.getByText("Retomar alertas"));
  expect(await screen.findByText("Pausar alertas 1 h")).toBeTruthy();
  expect(calls).toContain("dnd_clear");
});
