import { afterEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, render, screen } from "@testing-library/react";

let opened: () => Promise<unknown> = () => Promise.resolve({ items: [], errors: [] });
let geminiDocs: () => Promise<unknown> = () => Promise.resolve([]);
let args: unknown = null;

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, a: unknown) => {
    if (cmd === "forges_opened_since") {
      args = a;
      return opened();
    }
    if (cmd === "gemini_docs") return geminiDocs();
    return Promise.resolve(null);
  },
}));

const { default: DaySummary } = await import("./DaySummary");

afterEach(cleanup);

async function mount(agenda: unknown[] = []) {
  render(<DaySummary day="2026-09-18" tasks={[]} agenda={agenda as never} onClose={() => {}} onError={() => {}} />);
  for (let i = 0; i < 3; i++) await act(async () => {});
}

const pr = { reference: "octo/canto#7", title: "Cache local", draft: false };

test("PRs/MRs opened since local midnight join the summary", async () => {
  opened = () => Promise.resolve({ items: [pr], errors: [] });
  await mount();
  expect(args).toEqual({ sinceMs: new Date(2026, 8, 18).getTime() });
  expect(screen.getByRole("region", { name: "resumo do dia" }).textContent).toContain("PRs/MRs abertos (1)\n- octo/canto#7 Cache local");
});

test("a forge that fails is named, and the rest of the summary still comes", async () => {
  opened = () => Promise.resolve({ items: [pr], errors: ["gitlab: sem resposta do GitLab"] });
  await mount();
  expect(screen.getByText(/PRs\/MRs fora do resumo: gitlab: sem resposta/)).toBeTruthy();
  expect(screen.getByText(/octo\/canto#7/)).toBeTruthy();
});

test("while the forges answer, the summary says it's still looking", async () => {
  opened = () => new Promise(() => {});
  await mount();
  expect(screen.getByRole("status").textContent).toContain("consultando");
});

test("a meeting's Gemini notes reach the summary text", async () => {
  const meeting = { id: "r", title: "Daily", start: new Date(2026, 8, 18, 9, 0).toISOString(), end: "", all_day: false, location: "", meet: "", link: "" };
  geminiDocs = () => Promise.resolve([{ meeting: "Daily", start: meeting.start, title: "Notas", url: "https://docs.google.com/z" }]);
  await mount([meeting]);
  expect(screen.getByRole("region", { name: "resumo do dia" }).textContent).toContain("anotações do Gemini: https://docs.google.com/z");
});

test("Gemini notes unavailable (no Google account) leaves the rest of the summary intact", async () => {
  const meeting = { id: "r", title: "Daily", start: new Date(2026, 8, 18, 9, 0).toISOString(), end: "", all_day: false, location: "", meet: "", link: "" };
  geminiDocs = () => Promise.reject(new Error("sem conta"));
  await mount([meeting]);
  expect(screen.getByRole("region", { name: "resumo do dia" }).textContent).toContain("09:00 Daily");
});
