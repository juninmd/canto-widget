import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

let saved = { ci: true, stalled: true, stalled_hours: 48 };
const calls: { cmd: string; args: { config?: typeof saved } }[] = [];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: { config?: typeof saved }) => {
    calls.push({ cmd, args });
    if (cmd === "my_pr_alerts_set") saved = args.config as typeof saved;
    return Promise.resolve(saved);
  },
}));

const { default: MyPrAlertsSection } = await import("./MyPrAlertsSection");

beforeEach(() => {
  saved = { ci: true, stalled: true, stalled_hours: 48 };
  calls.length = 0;
});
afterEach(cleanup);

async function show() {
  render(<MyPrAlertsSection onError={() => {}} />);
  await act(async () => {});
}

const sent = () => calls.filter((c) => c.cmd === "my_pr_alerts_set").map((c) => c.args.config);

test("shows what Rust saved and turning the CI alert off sends the whole config", async () => {
  await show();
  const ci = screen.getByLabelText("avisar quando o CI de um PR meu falhar") as HTMLInputElement;
  expect(ci.checked).toBe(true);
  await act(async () => {
    fireEvent.click(ci);
  });
  expect(sent()).toEqual([{ ci: false, stalled: true, stalled_hours: 48 }]);
  expect(ci.checked).toBe(false);
});

test("the waiting limit offers 24, 48 and 72 hours and is disabled with the alert off", async () => {
  await show();
  const hours = screen.getByRole("combobox") as HTMLSelectElement;
  expect([...hours.options].map((o) => o.value)).toEqual(["24", "48", "72"]);
  await act(async () => {
    fireEvent.change(hours, { target: { value: "72" } });
  });
  expect(sent()).toEqual([{ ci: true, stalled: true, stalled_hours: 72 }]);
  await act(async () => {
    fireEvent.click(screen.getByLabelText(/avisar quando um PR meu ficar sem revisão/, { selector: "input[type=checkbox]" }));
  });
  expect(hours.disabled).toBe(true);
});

test("a limit saved by hand outside the list still shows up as chosen", async () => {
  saved = { ci: true, stalled: true, stalled_hours: 36 };
  await show();
  expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("36");
});
