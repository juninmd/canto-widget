import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

let saved = { enabled: false, hour: 9, weekdays_only: true };
const calls: { cmd: string; args: { config?: typeof saved } }[] = [];
let fail = false;

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: { config?: typeof saved }) => {
    calls.push({ cmd, args });
    if (cmd === "morning_digest_set") {
      if (fail) return Promise.reject("não consegui salvar");
      saved = args.config as typeof saved;
    }
    return Promise.resolve(saved);
  },
}));

const { default: DigestSection } = await import("./DigestSection");

beforeEach(() => {
  saved = { enabled: false, hour: 9, weekdays_only: true };
  calls.length = 0;
  fail = false;
});
afterEach(cleanup);

async function show() {
  render(<DigestSection onError={() => {}} />);
  await act(async () => {});
}

const sent = () => calls.filter((c) => c.cmd === "morning_digest_set").map((c) => c.args.config);

test("it starts off, with the hour and the weekdays choice disabled until it is switched on", async () => {
  await show();
  expect((screen.getByLabelText("avisar com o resumo do dia") as HTMLInputElement).checked).toBe(false);
  expect((screen.getByLabelText("a partir das") as HTMLSelectElement).disabled).toBe(true);
  expect((screen.getByLabelText("só em dias úteis") as HTMLInputElement).disabled).toBe(true);
});

test("switching it on, picking the hour and allowing weekends each send the whole config", async () => {
  await show();
  await act(async () => {
    fireEvent.click(screen.getByLabelText("avisar com o resumo do dia"));
  });
  await act(async () => {
    fireEvent.change(screen.getByLabelText("a partir das"), { target: { value: "8" } });
  });
  await act(async () => {
    fireEvent.click(screen.getByLabelText("só em dias úteis"));
  });
  expect(sent()).toEqual([
    { enabled: true, hour: 9, weekdays_only: true },
    { enabled: true, hour: 8, weekdays_only: true },
    { enabled: true, hour: 8, weekdays_only: false },
  ]);
});

test("an hour outside the offered ones still shows, and a refusal is an alert with the saved value back", async () => {
  saved = { enabled: true, hour: 15, weekdays_only: true };
  await show();
  expect((screen.getByLabelText("a partir das") as HTMLSelectElement).value).toBe("15");
  fail = true;
  await act(async () => {
    fireEvent.click(screen.getByLabelText("avisar com o resumo do dia"));
  });
  expect(screen.getByRole("alert").textContent).toContain("não consegui salvar");
  expect((screen.getByLabelText("avisar com o resumo do dia") as HTMLInputElement).checked).toBe(true);
});
