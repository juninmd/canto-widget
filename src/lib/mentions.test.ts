import { expect, test } from "bun:test";
import type { MentionRow } from "./api";
import { ALL_MENTIONS, countMuted, countUnread, filterMentions, patchRows } from "./mentions";

const row = (id: string, extra: Partial<MentionRow> = {}): MentionRow => ({
  id,
  title: "Corrige o parser de CSV",
  reference: "acme/atlas#128",
  url: `https://github.com/acme/atlas/pull/${id}`,
  is_pr: true,
  at: "2026-10-12T10:00:00Z",
  sender: { name: "Marina Souza", login: "marina", avatar: "" },
  preview: "consegue olhar o backoff antes da release?",
  unread: true,
  muted: false,
  done: false,
  ...extra,
});

const rows = [
  row("1"),
  row("2", { title: "Cache de relatórios", reference: "acme/api#9", sender: { name: "Caio Prado", login: "caio-prado", avatar: "" }, preview: "o teste de carga passou", unread: false }),
  row("3", { title: "Migração do lote", muted: true }),
];

test("muted rows are hidden unless asked for, and unread-only keeps just the unread", () => {
  expect(filterMentions(rows, ALL_MENTIONS).map((r) => r.id)).toEqual(["1", "2"]);
  expect(filterMentions(rows, { ...ALL_MENTIONS, showMuted: true }).map((r) => r.id)).toEqual(["1", "2", "3"]);
  expect(filterMentions(rows, { ...ALL_MENTIONS, unreadOnly: true }).map((r) => r.id)).toEqual(["1"]);
});

test("every word of the search must match the title, repo, author or text, ignoring case and accents", () => {
  const by = (text: string) => filterMentions(rows, { ...ALL_MENTIONS, text }).map((r) => r.id);
  expect(by("relatorios")).toEqual(["2"]);
  expect(by("CAIO")).toEqual(["2"]);
  expect(by("acme api")).toEqual(["2"]);
  expect(by("backoff release")).toEqual(["1"]);
  expect(by("marina carga")).toEqual([]);
  expect(by("   ")).toEqual(["1", "2"]);
});

test("counts leave out muted and done rows, and a patch changes only the rows it names", () => {
  expect(countUnread(rows)).toBe(1);
  expect(countUnread([...rows, row("4", { done: true })])).toBe(1);
  expect(countMuted(rows)).toBe(1);
  const next = patchRows(rows, (r) => (r.id === "1" ? { unread: false } : null));
  expect(next[0].unread).toBe(false);
  expect(next[1]).toBe(rows[1]);
  expect(rows[0].unread).toBe(true);
});
