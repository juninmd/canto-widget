import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import type { AgendaItem } from "../lib/api";

let notes: { id: string; title: string; updated_at: number }[] = [];
mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string) => Promise.resolve(cmd === "notes_search" ? { total: notes.length, items: notes } : null),
}));
const { default: MaxSide } = await import("./MaxSide");

afterEach(() => {
  cleanup();
  notes = [];
});

const event = (id: string, title: string): AgendaItem => ({
  id,
  title,
  start: new Date(Date.now() + 3_600_000).toISOString(),
  end: new Date(Date.now() + 5_400_000).toISOString(),
  all_day: false,
  location: "",
  meet: "",
  link: "",
});

test("lists today's agenda and the latest notes", async () => {
  notes = [{ id: "n1", title: "Ideias para a retro", updated_at: Date.now() - 12 * 60_000 }];
  render(<MaxSide agenda={[event("a", "Revisão de PRs")]} privacy={false} version={0} />);
  expect(screen.getByText("agenda de hoje")).toBeDefined();
  expect(screen.getByText("Revisão de PRs")).toBeDefined();
  expect(await screen.findByText("Ideias para a retro")).toBeDefined();
});

test("says so when there is nothing to show", async () => {
  render(<MaxSide agenda={[]} privacy={false} version={0} />);
  expect(screen.getByText("nenhum evento hoje")).toBeDefined();
  expect(await screen.findByText("nenhuma nota ainda")).toBeDefined();
});

test("privacy mode blurs note titles but keeps the agenda usable", async () => {
  notes = [{ id: "n1", title: "Segredo", updated_at: Date.now() }];
  render(<MaxSide agenda={[]} privacy={true} version={0} />);
  expect((await screen.findByText("Segredo")).className).toContain("blur-sm");
});
