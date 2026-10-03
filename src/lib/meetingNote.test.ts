import { expect, test } from "bun:test";
import type { AgendaItem, Note } from "./api";
import { meetingNoteDraft, relatedNotes } from "./meetingNote";

const event: AgendaItem = {
  id: "e1",
  title: "Planejamento",
  start: "2026-10-03T14:00:00-03:00",
  end: "",
  all_day: false,
  location: "",
  meet: "",
  link: "",
};
const note = (id: string, title: string): Note => ({ id, title, body: "", tags: [], created_at: 0, updated_at: 0 });

test("the draft has no guests or agenda sections when the invite has none", () => {
  const { title, body, tags } = meetingNoteDraft(event);
  expect(title.startsWith("Planejamento · ")).toBe(true);
  expect(body).toContain("## Anotações");
  expect(body).not.toContain("## Convidados");
  expect(body).not.toContain("## Pauta");
  expect(tags).toEqual(["reunião"]);
});

test("a guest without a name is listed by e-mail", () => {
  const guest = { name: "", email: "b@ex.com", response: "", organizer: false, optional: false, me: false } as const;
  expect(meetingNoteDraft({ ...event, attendees: [guest] }).body).toContain("- b@ex.com");
});

test("related notes match on the title only, ignoring case, capped at three", () => {
  const notes = [note("1", "PLANEJAMENTO · 01/10"), note("2", "Outra"), note("3", "planejamento q4"), note("4", "Planejamento a"), note("5", "Planejamento b")];
  expect(relatedNotes(notes, event).map((n) => n.id)).toEqual(["1", "3", "4"]);
  expect(relatedNotes(notes, { ...event, title: "  " })).toEqual([]);
});
