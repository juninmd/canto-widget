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
  response: "tentative",
  attendees: [
    { name: "Ana Souza", email: "ana@example.com", response: "accepted", organizer: true, optional: false, me: false },
    { name: "Eu", email: "eu@example.com", response: "tentative", organizer: false, optional: false, me: true },
    { name: "Caio Dias", email: "caio@example.com", response: "declined", organizer: false, optional: true, me: false },
  ],
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

test("the card shows my answer as a badge and the details list each guest with theirs", () => {
  render(<AgendaTab agenda={agenda({ items: [planning] })} onError={() => {}} />);
  expect(screen.getByText("você talvez vá")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: /Planejamento da sprint/ }));
  const list = screen.getByRole("region", { name: "Convidados" });
  expect(list.textContent).toContain("1 sim · 1 não · 1 talvez · 0 aguardando");
  expect(list.textContent).toContain("Ana Souza · organizador");
  expect(list.textContent).toContain("Caio Dias · opcional");
  expect(list.textContent).toContain("recusou");
  expect(list.textContent).toContain("+3 não listados");
  expect(screen.getAllByText("AS").length).toBe(2);
});

test("an event I'm not invited to shows no badge nor guest list", () => {
  render(<AgendaTab agenda={agenda({ items: [{ ...planning, response: "", attendees: [] }] })} onError={() => {}} />);
  expect(screen.queryByText(/você aceitou|você recusou|você talvez vá|sem resposta sua/)).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: /Planejamento da sprint/ }));
  expect(screen.queryByRole("region", { name: "Convidados" })).toBeNull();
});
