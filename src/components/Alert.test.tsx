import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { AgendaItem, Guest } from "../lib/api";

const calls: string[] = [];
const args: Record<string, unknown>[] = [];
let watched: string[] = [];
let vaultLocked = false;
let notesPage: { total: number; items: unknown[] } = { total: 0, items: [] };

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, a?: Record<string, unknown>) => {
    calls.push(cmd);
    args.push(a ?? {});
    if (cmd === "status_alerts_get") return Promise.resolve(watched);
    if (cmd === "status_alerts_set") return Promise.resolve((a as { ids: string[] }).ids);
    if (cmd === "notes_search") return vaultLocked ? Promise.reject("cofre trancado") : Promise.resolve(notesPage);
    if (cmd === "note_save") return Promise.resolve({ id: "n-new", ...(a as object) });
    return Promise.resolve(null);
  },
}));

const { default: Alert } = await import("./Alert");

const event: AgendaItem = {
  id: "e1",
  title: "Daily",
  start: "2026-09-09T09:00:00-03:00",
  end: "2026-09-09T09:15:00-03:00",
  all_day: false,
  location: "",
  meet: "https://meet.google.com/aaa-bbbb-ccc",
  link: "",
};

const outage: AgendaItem = {
  id: "status:github",
  title: "GitHub",
  start: new Date(Date.now() - 18 * 60_000).toISOString(),
  end: "",
  all_day: false,
  location: "",
  meet: "",
  link: "https://www.githubstatus.com",
  description: "Partial System Outage",
  tag: "major",
};

type Handlers = { onDismiss?: (id: string) => void; onCompleted?: () => void; onOpenModels?: () => void };

async function show(events: AgendaItem[], handlers: Handlers = {}) {
  let view!: ReturnType<typeof render>;
  await act(async () => {
    view = render(<Alert events={events} onDismiss={handlers.onDismiss ?? (() => {})} {...handlers} />);
  });
  return view;
}

beforeEach(() => {
  calls.length = 0;
  args.length = 0;
  watched = [];
  vaultLocked = false;
  notesPage = { total: 0, items: [] };
});

afterEach(cleanup);

test("Esc dismisses the alert on screen and releases it in Rust", async () => {
  const closed: string[] = [];
  await show([event], { onDismiss: (id) => closed.push(id) });

  await act(async () => {
    fireEvent.keyDown(window, { key: "Escape" });
  });

  expect(closed).toEqual(["e1"]);
  expect(args[calls.indexOf("alert_close")]).toEqual({ id: "e1" });
});

test("focus lands on the primary action, not the close button", async () => {
  await show([event]);
  expect(document.activeElement?.textContent).toBe("entrar no Meet");
});

test("the Esc listener leaves along with the alert", async () => {
  const { unmount } = await show([event]);
  await act(async () => {
    unmount();
  });
  calls.length = 0;
  args.length = 0;

  await act(async () => {
    fireEvent.keyDown(window, { key: "Escape" });
  });

  expect(calls).toHaveLength(0);
});

test("doesn't open Meet on its own, only on click", async () => {
  await show([event]);
  expect(calls).not.toContain("open_link");

  await act(async () => {
    fireEvent.click(screen.getByText("entrar no Meet"));
  });
  expect(calls).toContain("open_link");
});

test("a task reminder completes the right task directly from the alert", async () => {
  const { toEvent } = await import("../lib/reminders");
  const reminder = toEvent({ id: "t9", title: "tomar remédio", done: false, day: "2026-09-14", created_at: 1, updated_at: 1, hora: "08:30" });
  const closed: string[] = [];
  await show([reminder], { onDismiss: (id) => closed.push(id) });
  expect(screen.getByText("lembrete de tarefa")).toBeTruthy();
  expect(screen.queryByText("entrar no Meet")).toBeNull();
  const complete = screen.getByRole("button", { name: "concluir tarefa" });
  expect(document.activeElement).toBe(complete);
  await act(async () => {
    fireEvent.click(complete);
  });
  expect(args[calls.indexOf("task_complete")]).toEqual({ id: "t9" });
  expect(calls).toContain("alert_close");
  expect(closed).toEqual(["task:t9"]);
});

test("snoozing hands that alert back to Rust for 10 minutes and hides it", async () => {
  const closed: string[] = [];
  await show([event], { onDismiss: (id) => closed.push(id) });
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "adiar 10 min" }));
  });
  expect(args[calls.indexOf("alert_snooze")]).toEqual({ id: "e1", minutes: 10 });
  expect(calls).not.toContain("alert_close");
  expect(closed).toEqual(["e1"]);
});

test("the meeting alert brings who organized, the agenda and the attached notes", async () => {
  const detailed: AgendaItem = {
    ...event,
    organizer: "Ana Souza",
    guests: 4,
    description: "Pauta:\nRoadmap do trimestre",
    attachments: [{ title: "Anotações do Gemini", url: "https://docs.google.com/document/d/abc", mime: "" }],
  };
  await show([detailed]);
  expect(screen.getByText("organizado por Ana Souza · 4 convidados")).toBeTruthy();
  expect(screen.getByText(/Roadmap do trimestre/)).toBeTruthy();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "📄 Anotações do Gemini" }));
  });
  expect(args[calls.indexOf("open_link")]).toEqual({ url: "https://docs.google.com/document/d/abc" });
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "entrar no Meet" }));
});

test("dismissing one alert closes only that id, not the others waiting", async () => {
  const closed: string[] = [];
  await show([outage, event], { onDismiss: (id) => closed.push(id) });
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "fechar" }));
  });
  expect(closed).toEqual(["status:github"]);
  expect(args.filter((_, i) => calls[i] === "alert_close")).toEqual([{ id: "status:github" }]);
});

test("a lone alert has no strip to pick from", async () => {
  await show([event]);
  expect(screen.queryByRole("group", { name: "avisos pendentes" })).toBeNull();
});

test("the meeting alert shows the whole description and every listed guest instead of clipping them", async () => {
  const long = Array.from({ length: 12 }, (_, i) => `Item ${i + 1} da pauta`).join("\n");
  const guest = (name: string, response: Guest["response"]): Guest => ({ name, email: `${name}@ex.com`, response, organizer: false, optional: false, me: false });
  const full: AgendaItem = {
    ...event,
    description: long,
    guests: 7,
    attendees: [guest("Ana", "accepted"), guest("Bia", "declined"), guest("Caio", "tentative"), guest("Duda", "needsAction")],
  };
  await show([full]);
  const desc = screen.getByText(/Item 12 da pauta/);
  expect(desc.className).not.toContain("line-clamp");
  for (const name of ["Ana", "Bia", "Caio", "Duda"]) expect(screen.getByText(name)).toBeTruthy();
  expect(screen.getByText("+3 não listados")).toBeTruthy();
});

test("a meeting alert lists earlier notes with the same title and starts today's note in one click", async () => {
  vaultLocked = false;
  notesPage = {
    total: 2,
    items: [
      { id: "n1", title: "Daily · 02/09", body: "", tags: [], created_at: 0, updated_at: 0 },
      { id: "n2", title: "Compras", body: "falei da Daily ontem", tags: [], created_at: 0, updated_at: 0 },
    ],
  };
  await show([{ ...event, attendees: [{ name: "Ana", email: "a@ex.com", response: "accepted", organizer: false, optional: false, me: false }], description: "Pauta do dia" }]);
  expect(await screen.findByText("📝 Daily · 02/09")).toBeTruthy();
  expect(screen.queryByText(/Compras/)).toBeNull();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /criar nota da reunião/ }));
  });
  const saved = args[calls.lastIndexOf("note_save")] as { title: string; body: string; tags: string[] };
  expect(saved.title.startsWith("Daily · ")).toBe(true);
  expect(saved.body).toContain("## Convidados\n\n- Ana");
  expect(saved.body).toContain("## Pauta\n\nPauta do dia");
  expect(saved.tags).toEqual(["reunião"]);
  expect(await screen.findByText(/nota criada: Daily · /)).toBeTruthy();
});

test("with the vault locked the meeting alert shows no note prep at all", async () => {
  vaultLocked = true;
  await show([event]);
  await act(async () => {});
  expect(screen.queryByRole("button", { name: /criar nota da reunião/ })).toBeNull();
  vaultLocked = false;
});

test("the snooze button defaults to 10 minutes and its dropdown picks 1 or 5, snoozing at once", async () => {
  for (const minutes of [1, 5]) {
    localStorage.clear();
    calls.length = 0;
    args.length = 0;
    const closed: string[] = [];
    const view = await show([event], { onDismiss: (id) => closed.push(id) });
    expect(screen.queryByRole("menu")).toBeNull();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "escolher quanto tempo adiar" }));
    });
    const items = screen.getAllByRole("menuitem").map((i) => i.textContent);
    expect(items).toEqual(["1 min", "5 min", "10 min"]);
    await act(async () => {
      fireEvent.click(screen.getByRole("menuitem", { name: `adiar ${minutes} min` }));
    });
    expect(args[calls.indexOf("alert_snooze")]).toEqual({ id: "e1", minutes });
    expect(closed).toEqual(["e1"]);
    expect(screen.queryByRole("menu")).toBeNull();
    view.unmount();
  }
});

test("the last value picked becomes the main button the next time", async () => {
  localStorage.clear();
  let view = await show([event]);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "escolher quanto tempo adiar" }));
  });
  await act(async () => {
    fireEvent.click(screen.getByRole("menuitem", { name: "adiar 5 min" }));
  });
  view.unmount();
  calls.length = 0;
  args.length = 0;
  view = await show([event]);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "adiar 5 min" }));
  });
  expect(args[calls.indexOf("alert_snooze")]).toEqual({ id: "e1", minutes: 5 });
  localStorage.clear();
});

test("Esc closes the dropdown first and only a second Esc dismisses the alert", async () => {
  localStorage.clear();
  const closed: string[] = [];
  await show([event], { onDismiss: (id) => closed.push(id) });
  const chevron = screen.getByRole("button", { name: "escolher quanto tempo adiar" });
  await act(async () => {
    fireEvent.click(chevron);
  });
  expect(chevron.getAttribute("aria-expanded")).toBe("true");
  await act(async () => {
    fireEvent.keyDown(screen.getAllByRole("menuitem")[0], { key: "Escape" });
  });
  expect(screen.queryByRole("menu")).toBeNull();
  expect(closed).toEqual([]);
  await act(async () => {
    fireEvent.keyDown(window, { key: "Escape" });
  });
  expect(closed).toEqual(["e1"]);
});

test("the main action records its outcome, a plain close and a mute record theirs", async () => {
  const { toEvent } = await import("../lib/reminders");
  const reminder = toEvent({ id: "t9", title: "tomar remédio", done: false, day: "2026-09-14", created_at: 1, updated_at: 1, hora: "08:30" });
  await show([reminder]);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "concluir tarefa" }));
  });
  expect(args[calls.indexOf("alert_close")]).toEqual({ id: "task:t9", outcome: "done" });
});

test("silencing a service tells Rust it was muted", async () => {
  watched = ["github"];
  await show([outage]);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "silenciar" }));
  });
  expect(args[calls.indexOf("alert_close")]).toEqual({ id: "status:github", outcome: "muted" });
});

test("a pop-up window that has no focus never asks for it: that would pull the game in front out of full screen", async () => {
  const original = document.hasFocus;
  document.hasFocus = () => false;
  try {
    await show([event]);
    expect(document.activeElement?.tagName, "the page took keyboard focus in a window the user is not using").toBe("BODY");
  } finally {
    document.hasFocus = original;
  }
});
