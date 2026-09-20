import { afterEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, render, screen } from "@testing-library/react";

let opened: () => Promise<unknown> = () => Promise.resolve({ items: [], errors: [] });
let args: unknown = null;

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, a: unknown) => {
    if (cmd === "forges_opened_since") {
      args = a;
      return opened();
    }
    return Promise.resolve(null);
  },
}));

const { default: DaySummary } = await import("./DaySummary");

afterEach(cleanup);

async function mount() {
  render(<DaySummary day="2026-09-18" tasks={[]} agenda={[]} onClose={() => {}} onError={() => {}} />);
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
