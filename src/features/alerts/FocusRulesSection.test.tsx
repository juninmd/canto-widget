import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const calls: { cmd: string; args?: Record<string, unknown> }[] = [];
let cfg = { schedule: false, start_min: 540, end_min: 720, weekdays_only: true, in_meeting: false, offset_min: 0 };

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: { config?: typeof cfg }) => {
    calls.push({ cmd, args });
    if (cmd === "focus_set") cfg = args!.config!;
    return Promise.resolve(cfg);
  },
}));

const { default: FocusRulesSection } = await import("./FocusRulesSection");

afterEach(() => {
  cleanup();
  calls.length = 0;
  cfg = { schedule: false, start_min: 540, end_min: 720, weekdays_only: true, in_meeting: false, offset_min: 0 };
});

test("the schedule switch saves the config and unlocks the time fields", async () => {
  render(<FocusRulesSection onError={() => {}} />);
  const toggle = await screen.findByLabelText("Ligar por horário");
  const from = screen.getByLabelText("das") as HTMLInputElement;
  expect(from.disabled).toBe(true);
  fireEvent.click(toggle);
  await screen.findByDisplayValue("09:00");
  const saved = calls.find((c) => c.cmd === "focus_set");
  expect((saved?.args?.config as typeof cfg).schedule).toBe(true);
  expect((screen.getByLabelText("das") as HTMLInputElement).disabled).toBe(false);
  fireEvent.change(screen.getByLabelText("das"), { target: { value: "13:30" } });
  await screen.findByDisplayValue("13:30");
  expect(cfg.start_min).toBe(13 * 60 + 30);
});

test("the meeting rule is its own switch", async () => {
  render(<FocusRulesSection onError={() => {}} />);
  fireEvent.click(await screen.findByLabelText("Silenciar durante reuniões com link de chamada"));
  await screen.findByRole("checkbox", { checked: true });
  expect(cfg.in_meeting).toBe(true);
});
