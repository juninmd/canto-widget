import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { AgendaItem } from "../lib/api";

const calls: string[] = [];
const args: Record<string, unknown>[] = [];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, a?: Record<string, unknown>) => {
    calls.push(cmd);
    args.push(a ?? {});
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

beforeEach(() => {
  calls.length = 0;
  args.length = 0;
});

afterEach(cleanup);

test("Esc closes the alert and releases the overlay in Rust", async () => {
  let closed = false;
  await act(async () => {
    render(<Alert event={event} onClose={() => { closed = true; }} />);
  });

  await act(async () => {
    fireEvent.keyDown(window, { key: "Escape" });
  });

  expect(closed).toBe(true);
  expect(calls).toContain("alert_close");
});

test("focus lands on the primary action, not the close button", async () => {
  await act(async () => {
    render(<Alert event={event} onClose={() => {}} />);
  });

  expect(document.activeElement?.textContent).toBe("entrar no Meet");
});

test("the Esc listener leaves along with the alert", async () => {
  const { unmount } = render(<Alert event={event} onClose={() => {}} />);
  await act(async () => {});
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
  await act(async () => {
    render(<Alert event={event} onClose={() => {}} />);
  });
  expect(calls).not.toContain("open_link");

  await act(async () => {
    fireEvent.click(screen.getByText("entrar no Meet"));
  });
  expect(calls).toContain("open_link");
});

test("a task reminder completes the right task directly from the alert", async () => {
  const { toEvent } = await import("../lib/reminders");
  const reminder = toEvent({ id: "t9", title: "tomar remédio", done: false, day: "2026-09-14", created_at: 1, updated_at: 1, hora: "08:30" });
  let closed = false;
  await act(async () => {
    render(<Alert event={reminder} onClose={() => { closed = true; }} />);
  });
  expect(screen.getByText("lembrete de tarefa")).toBeTruthy();
  expect(screen.queryByText("entrar no Meet")).toBeNull();
  const complete = screen.getByRole("button", { name: "concluir tarefa" });
  expect(document.activeElement).toBe(complete);
  await act(async () => {
    fireEvent.click(complete);
  });
  expect(args[calls.indexOf("task_complete")]).toEqual({ id: "t9" });
  expect(calls).toContain("alert_close");
  expect(closed).toBe(true);
});

test("snoozing hands the alert back to Rust for 10 minutes and hides the overlay", async () => {
  let closed = false;
  await act(async () => {
    render(<Alert event={event} onClose={() => { closed = true; }} />);
  });
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "adiar 10 min" }));
  });
  expect(calls).toContain("alert_snooze");
  expect(args[calls.indexOf("alert_snooze")]).toEqual({ minutes: 10 });
  expect(calls).not.toContain("alert_close");
  expect(closed).toBe(true);
});
