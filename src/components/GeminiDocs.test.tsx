import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

let docs: () => Promise<unknown>;
const calls: { cmd: string; args: Record<string, string> }[] = [];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: Record<string, string>) => {
    calls.push({ cmd, args });
    return cmd === "gemini_docs" ? docs() : Promise.resolve(null);
  },
}));

const { default: GeminiDocs, geminiWindow } = await import("./GeminiDocs");

const retro = { meeting: "Retro da sprint", start: "2026-09-17T15:00:00-03:00", title: "Anotações do Gemini", url: "https://docs.google.com/document/d/r" };
const offsite = { meeting: "Offsite", start: "2026-09-10", title: "Offsite - Transcript", url: "https://docs.google.com/document/d/o" };

async function show(query = "") {
  render(<GeminiDocs query={query} />);
  await act(async () => {});
}

beforeEach(() => {
  calls.length = 0;
  docs = () => Promise.resolve([retro, offsite]);
});
afterEach(cleanup);

test("lists the Gemini notes of recent meetings and opens the doc in the browser", async () => {
  await show();
  expect(screen.getByText("Retro da sprint")).toBeTruthy();
  expect(screen.getByText("📄 Offsite - Transcript")).toBeTruthy();
  await act(async () => {
    fireEvent.click(screen.getByText("Retro da sprint"));
  });
  expect(calls.find((c) => c.cmd === "open_link")?.args).toEqual({ url: retro.url });
});

test("an all-day meeting keeps its own date instead of sliding to the day before", async () => {
  await show();
  expect(screen.getByText("10/09/2026")).toBeTruthy();
});

test("the tab search also narrows the Gemini notes", async () => {
  await show("offsite");
  expect(screen.queryByText("Retro da sprint")).toBeNull();
  expect(screen.getByText("Offsite")).toBeTruthy();
});

test("without a Google account the section explains itself instead of spinning", async () => {
  docs = () => Promise.reject("entre com o Google para ver a agenda");
  await show();
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.getByText(/entre com o Google/)).toBeTruthy();
});

test("the search window is the last 14 days up to now", () => {
  const now = new Date("2026-09-18T12:00:00Z");
  expect(geminiWindow(now)).toEqual({ timeMin: "2026-09-04T12:00:00.000Z", timeMax: "2026-09-18T12:00:00.000Z" });
});
