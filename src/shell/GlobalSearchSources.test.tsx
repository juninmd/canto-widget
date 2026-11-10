import { afterEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { AgendaItem } from "../lib/api";

let transcripts: unknown = [];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string) => {
    if (cmd === "notes_search") return Promise.resolve({ total: 0, items: [] });
    if (cmd === "clip_list") return Promise.resolve({ items: [], max_pinned: 0 });
    if (cmd === "tasks_for_day") return Promise.resolve([]);
    if (cmd === "transcripts_list") return transcripts instanceof Error ? Promise.reject(transcripts) : Promise.resolve(transcripts);
    return Promise.resolve(null);
  },
}));

const { default: GlobalSearch } = await import("./GlobalSearch");

afterEach(() => {
  cleanup();
  transcripts = [];
});

const meeting = (id: string, title: string): AgendaItem => ({ id, title, start: "", end: "", all_day: false, location: "", meet: "", link: "" });

async function search(text: string, props: Partial<React.ComponentProps<typeof GlobalSearch>> = {}) {
  const jumps: [string, string][] = [];
  const errors: string[] = [];
  render(
    <GlobalSearch
      today="2026-09-20"
      privacy={false}
      onNavigate={(target, q) => jumps.push([target, q])}
      onClose={() => {}}
      onError={(m) => errors.push(m)}
      {...props}
    />,
  );
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: text } });
  await act(async () => {
    await new Promise((r) => setTimeout(r, 200));
  });
  return { jumps, errors };
}

test("transcripts are searched and a click opens them with the query", async () => {
  transcripts = [{ name: "retro-da-sprint.md", modified_at: 1, size: 1, preview: "" }];
  const { jumps } = await search("retro");
  expect(screen.getByText("transcrições →")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "retro-da-sprint.md" }));
  expect(jumps).toEqual([["transcripts", "retro"]]);
});

test("today's events are filtered by title, ignoring accents and case, without any command call", async () => {
  const agenda = [meeting("e1", "Reunião de Planejamento"), meeting("e2", "Almoço")];
  const { jumps } = await search("reuniao", { agenda });
  expect(screen.getByRole("button", { name: "Reunião de Planejamento" })).toBeTruthy();
  expect(screen.queryByText("Almoço")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "agenda de hoje →" }));
  expect(jumps).toEqual([["agenda", "reuniao"]]);
});

test("a transcripts folder that cannot be read is an empty group, not an error popup", async () => {
  transcripts = new Error("pasta não encontrada");
  const { errors } = await search("retro");
  expect(errors).toEqual([]);
  expect(screen.getByText("nada encontrado")).toBeTruthy();
});

test("arrows walk from the search field through every result", async () => {
  await search("reuniao", { agenda: [meeting("e1", "Reunião A"), meeting("e2", "Reunião B")] });
  const input = screen.getByRole("searchbox");
  input.focus();
  fireEvent.keyDown(input, { key: "ArrowDown" });
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "agenda de hoje →" }));
  fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Reunião A" }));
  fireEvent.keyDown(document.activeElement!, { key: "ArrowUp" });
  fireEvent.keyDown(document.activeElement!, { key: "ArrowUp" });
  expect(document.activeElement).toBe(input);
});

test("privacy mode blurs transcript and event rows", async () => {
  transcripts = [{ name: "ata-secreta.md", modified_at: 1, size: 1, preview: "" }];
  await search("ata", { privacy: true });
  expect(screen.getByRole("button", { name: "ata-secreta.md" }).className).toContain("blur-sm");
});
