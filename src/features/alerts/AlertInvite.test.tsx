import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { AgendaItem } from "../../lib/api";

const sent: { cmd: string; args: Record<string, unknown> }[] = [];
let failWith = "";
mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    sent.push({ cmd, args: args ?? {} });
    if (cmd === "agenda_respond" && failWith) return Promise.reject(failWith);
    return Promise.resolve(null);
  },
}));
mock.module("@tauri-apps/api/event", () => ({ emit: () => Promise.resolve(), listen: () => Promise.resolve(() => {}) }));
mock.module("./sound", () => ({ playAlert: () => {} }));

const { default: Alert } = await import("./Alert");
const { kindOf } = await import("./alerts");

const invite: AgendaItem = {
  id: "invite:e9",
  title: "Revisão de arquitetura",
  start: new Date(Date.now() + 2 * 86_400_000).toISOString(),
  end: "",
  all_day: false,
  location: "",
  meet: "",
  link: "https://calendar.google.com/event?eid=e9",
  organizer: "Ana Souza",
  response: "needsAction",
};

const dismissed: string[] = [];
async function show() {
  await act(async () => {
    render(<Alert events={[invite]} onDismiss={(id) => dismissed.push(id)} />);
  });
}

beforeEach(() => {
  sent.length = 0;
  dismissed.length = 0;
  failWith = "";
});
afterEach(cleanup);

test("an invite shows the day of the event, not only the hour", async () => {
  await show();
  const { whenLabel } = await import("../agenda/agenda");
  const label = whenLabel(invite);
  expect(label).toContain("·");
  expect(screen.getByText(label)).toBeTruthy();
});

test("an invite is its own kind, never the 'meeting starting' alert", () => {
  expect(kindOf(invite)).toBe("invite");
  expect(kindOf({ ...invite, id: "e9" })).toBe("meeting");
});

test("an invite names who invited and answers with the real event id, then closes", async () => {
  await show();
  expect(screen.getAllByText("novo convite").length).toBeGreaterThan(0);
  expect(screen.getByText("Ana Souza")).toBeTruthy();
  expect(screen.queryByText(/adiar/)).toBeNull();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "aceitar" }));
  });
  expect(sent.find((c) => c.cmd === "agenda_respond")?.args).toEqual({ eventId: "e9", answer: "accepted" });
  expect(dismissed).toEqual(["invite:e9"]);
});

test("a failed answer keeps the invite open and says why", async () => {
  failWith = "reconecte o Google em Ajustes";
  await show();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "recusar" }));
  });
  expect(sent.find((c) => c.cmd === "agenda_respond")?.args).toEqual({ eventId: "e9", answer: "declined" });
  expect(dismissed).toEqual([]);
  expect(screen.getByRole("alert").textContent).toContain("reconecte o Google");
});
