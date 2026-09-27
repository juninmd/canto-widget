import { expect, test } from "bun:test";
import type { AgendaItem } from "./api";
import { buildCommands, nextMeeting, type PaletteContext } from "./paletteCommands";
import { PALETTE_PROVIDERS } from "./palette";
import { TABS } from "../components/TabBar";

const event = (id: string, start: string, end: string, meet = "https://meet.example.com/abc", all_day = false): AgendaItem => ({
  id,
  title: id,
  start,
  end,
  all_day,
  location: "",
  meet,
  link: "",
});

const now = new Date("2026-09-27T10:00:00");

test("the next meeting is the earliest one not over yet that has a call link", () => {
  const items = [
    event("later", "2026-09-27T15:00:00", "2026-09-27T16:00:00"),
    event("over", "2026-09-27T08:00:00", "2026-09-27T09:00:00"),
    event("no-call", "2026-09-27T11:00:00", "2026-09-27T12:00:00", ""),
    event("all-day", "2026-09-27", "2026-09-28", "https://meet.example.com/x", true),
    event("running", "2026-09-27T09:30:00", "2026-09-27T10:30:00"),
  ];
  expect(nextMeeting(items, now)?.id).toBe("running");
  expect(nextMeeting([items[1], items[2]], now)).toBeNull();
});

function ctx(over: Partial<PaletteContext> = {}): PaletteContext {
  const noop = () => {};
  return {
    tabs: TABS.filter((t) => t.id !== "gitlab"),
    privacy: false,
    nextMeeting: null,
    goTab: noop,
    focusNew: noop,
    searchTab: noop,
    globalSearch: noop,
    lock: noop,
    joinMeeting: noop,
    setSkin: noop,
    togglePrivacy: noop,
    toggleFullscreen: noop,
    copySummary: noop,
    help: noop,
    hide: noop,
    ...over,
  };
}

test("one command per visible tab, with the Alt+N the bar uses", () => {
  const list = buildCommands(ctx());
  expect(list.some((c) => c.id === "tab.gitlab")).toBe(false);
  expect(list.find((c) => c.id === "tab.github")?.keys).toEqual(["Alt", "6"]);
});

test("joining a meeting only shows up when there is one, and opens that one", () => {
  expect(buildCommands(ctx()).some((c) => c.id === "meeting.join")).toBe(false);
  let joined = "";
  const next = event("Daily", "2026-09-27T10:00:00", "2026-09-27T10:15:00");
  const list = buildCommands(ctx({ nextMeeting: next, joinMeeting: (e) => (joined = e.id) }));
  const join = list.find((c) => c.id === "meeting.join")!;
  expect(join.title).toBe("Entrar na próxima reunião: Daily");
  void join.run();
  expect(joined).toBe("Daily");
});

test("new task and new note need their tab visible", () => {
  const list = buildCommands(ctx({ tabs: TABS.filter((t) => t.id === "settings") }));
  expect(list.some((c) => c.id === "task.new" || c.id === "note.new")).toBe(false);
});

test("the privacy command says what it will do", () => {
  const list = buildCommands(ctx({ privacy: true }));
  expect(list.find((c) => c.id === "privacy.toggle")?.title).toBe("Desativar modo privacidade");
});

test("other features register actions through the provider array", () => {
  PALETTE_PROVIDERS.push(() => [{ id: "extra", title: "Extra", run: () => {} }]);
  try {
    expect(buildCommands(ctx()).at(-1)?.id).toBe("extra");
  } finally {
    PALETTE_PROVIDERS.pop();
  }
});
