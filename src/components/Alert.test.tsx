import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { AgendaItem } from "../lib/api";

const calls: string[] = [];
const args: Record<string, unknown>[] = [];
let watched: string[] = [];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, a?: Record<string, unknown>) => {
    calls.push(cmd);
    args.push(a ?? {});
    if (cmd === "status_alerts_get") return Promise.resolve(watched);
    if (cmd === "status_alerts_set") return Promise.resolve((a as { ids: string[] }).ids);
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
