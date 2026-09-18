import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { AgendaItem } from "../lib/api";
import type { Agenda } from "../lib/useAgenda";

const opened: string[] = [];
mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, a?: { url?: string }) => {
    if (cmd === "open_link" && a?.url) opened.push(a.url);
    return Promise.resolve(null);
  },
}));

const { default: AgendaTab } = await import("./AgendaTab");

const notes = { title: "Anotações do Gemini", url: "https://docs.google.com/document/d/abc", mime: "" };

const planning: AgendaItem = {
  id: "e1",
  title: "Planejamento da sprint",
  start: "2026-09-18T17:00:00Z",
  end: "2026-09-18T18:00:00Z",
  all_day: false,
  location: "Sala Orion",
  meet: "",
  link: "https://calendar.google.com/event?eid=abc",
  organizer: "Ana Souza",
  creator: "Bruno Lima",
  guests: 6,
  description: "Pauta:\nRiscos & prazos",
  attachments: [notes],
};

function agenda(over: Partial<Agenda>): Agenda {
  return { items: [], loading: false, error: "", reload: () => Promise.resolve(), ...over };
}

beforeEach(() => {
  opened.length = 0;
});
afterEach(cleanup);

test("an event opens its details on click and closes on a second click", async () => {
  render(<AgendaTab agenda={agenda({ items: [planning] })} onError={() => {}} />);
  const card = screen.getByRole("button", { name: /Planejamento da sprint/ });
  expect(card.getAttribute("aria-expanded")).toBe("false");
  expect(screen.queryByText(/organizado por/)).toBeNull();
  fireEvent.click(card);
  expect(card.getAttribute("aria-expanded")).toBe("true");
  expect(screen.getByText("organizado por Ana Souza · criado por Bruno Lima · 6 convidados")).toBeTruthy();
  expect(screen.getByText(/Riscos & prazos/)).toBeTruthy();
  fireEvent.click(card);
  expect(screen.queryByText(/organizado por/)).toBeNull();
});

test("attached Gemini notes and the Calendar page open in the browser", async () => {
  render(<AgendaTab agenda={agenda({ items: [planning] })} onError={() => {}} />);
  fireEvent.click(screen.getByRole("button", { name: /Planejamento da sprint/ }));
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "📄 Anotações do Gemini" }));
    fireEvent.click(screen.getByRole("button", { name: "abrir no Calendar" }));
  });
  expect(opened).toEqual([notes.url, planning.link]);
});

test("the first load shows a busy skeleton, not the empty-agenda message", () => {
  render(<AgendaTab agenda={agenda({ loading: true })} onError={() => {}} />);
  expect(screen.getByRole("status", { name: "carregando a agenda" })).toBeTruthy();
  expect(screen.queryByText(/nenhum evento hoje/)).toBeNull();
});
