import { afterEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const calls: Record<string, unknown> = {};
let agendaFails = false;

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, a: unknown) => {
    calls[cmd] = a;
    if (cmd === "forges_opened_since" || cmd === "forges_activity_between") return Promise.resolve({ items: [], errors: [] });
    if (cmd === "report_vault")
      return Promise.resolve({ done: [{ title: "Fechar sprint", day: "2026-09-22" }], done_total: 1, notes: [], notes_total: 0 });
    if (cmd === "report_agenda") return agendaFails ? Promise.reject(new Error("entre com o Google")) : Promise.resolve([]);
    return Promise.resolve([]);
  },
}));

const { default: SummaryPanel } = await import("./SummaryPanel");

afterEach(() => {
  cleanup();
  agendaFails = false;
});

async function mount() {
  render(<SummaryPanel today="2026-09-24" tasks={[]} agenda={[]} onClose={() => {}} onError={() => {}} />);
  for (let i = 0; i < 3; i++) await act(async () => {});
}

async function pick(name: string) {
  fireEvent.click(screen.getByRole("radio", { name }));
  for (let i = 0; i < 3; i++) await act(async () => {});
}

test("the summary opens on today, and the week report asks for Monday up to the next midnight", async () => {
  await mount();
  expect(screen.getByRole("radio", { name: "hoje" }).getAttribute("aria-checked")).toBe("true");
  expect(screen.getByRole("region", { name: "resumo do dia" })).toBeTruthy();
  await pick("semana");
  const [fromMs, toMs] = [new Date(2026, 8, 21).getTime(), new Date(2026, 8, 25).getTime()];
  expect(calls.report_vault).toEqual({ fromDay: "2026-09-21", toDay: "2026-09-24", fromMs, toMs });
  expect(calls.forges_activity_between).toEqual({ fromMs, toMs });
  expect(calls.report_agenda).toEqual({ fromMs, toMs });
  const text = screen.getByRole("region", { name: "relatório do período" }).textContent;
  expect(text).toContain("Relatório da semana: 21/09 a 24/09");
  expect(text).toContain("- Fechar sprint (22/09)");
});

test("the month starts on the 1st and copies as markdown", async () => {
  const writeText = mock((_: string) => Promise.resolve());
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  await mount();
  await pick("mês");
  expect(calls.report_vault).toMatchObject({ fromDay: "2026-09-01", fromMs: new Date(2026, 8, 1).getTime() });
  fireEvent.click(screen.getByRole("button", { name: "copiar como markdown" }));
  await act(async () => {});
  expect(writeText.mock.calls[0][0]).toStartWith("## Relatório de setembro de 2026");
});

test("an agenda that fails is named, and the rest of the report still comes", async () => {
  agendaFails = true;
  await mount();
  await pick("semana");
  expect(screen.getByText(/reuniões fora do relatório: entre com o Google/)).toBeTruthy();
  expect(screen.getByText(/Fechar sprint/)).toBeTruthy();
});
