import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { AgendaItem } from "../../lib/api";
import type { Agenda } from "./useAgenda";

const sent: Record<string, unknown>[] = [];
let failWith = "";
mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, a?: Record<string, unknown>) => {
    if (cmd === "agenda_respond") {
      sent.push(a ?? {});
      return failWith ? Promise.reject(failWith) : Promise.resolve(null);
    }
    return Promise.resolve(null);
  },
}));

const { default: AgendaTab } = await import("./AgendaTab");

const invite: AgendaItem = {
  id: "e9",
  title: "Revisão de arquitetura",
  start: "2026-09-18T17:00:00Z",
  end: "2026-09-18T18:00:00Z",
  all_day: false,
  location: "",
  meet: "",
  link: "",
  response: "needsAction",
};

let reloads = 0;
const agenda = (items: AgendaItem[]): Agenda => ({
  items,
  loading: false,
  error: "",
  reload: () => Promise.resolve(void (reloads += 1)),
});

beforeEach(() => {
  sent.length = 0;
  failWith = "";
  reloads = 0;
});
afterEach(cleanup);

test("an unanswered invite offers the answers without opening the card, and accepting sends it and reloads", async () => {
  const toasts: string[] = [];
  render(<AgendaTab agenda={agenda([invite])} onError={() => {}} onBooked={(m) => toasts.push(m)} />);
  const group = screen.getByRole("group", { name: "responder ao convite" });
  expect(group.querySelectorAll("button").length).toBe(3);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /Aceitar/ }));
  });
  expect(sent).toEqual([{ eventId: "e9", answer: "accepted" }]);
  expect(reloads).toBeGreaterThan(0);
  expect(toasts).toEqual(["Convite aceito"]);
});

test("declining sends declined; the answer already given is pressed and cannot be sent again", async () => {
  const { rerender } = render(<AgendaTab agenda={agenda([invite])} onError={() => {}} />);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /Recusar/ }));
  });
  expect(sent).toEqual([{ eventId: "e9", answer: "declined" }]);
  rerender(<AgendaTab agenda={agenda([{ ...invite, response: "accepted" }])} onError={() => {}} />);
  // An answered event keeps its buttons inside the details only.
  expect(screen.queryByRole("group", { name: "responder ao convite" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: /Revisão de arquitetura/ }));
  const accepted = screen.getByRole("button", { name: /Aceitar/ });
  expect(accepted.getAttribute("aria-pressed")).toBe("true");
  expect((accepted as HTMLButtonElement).disabled).toBe(true);
});

test("a refusal (an old Google grant without write access) reaches the user instead of vanishing", async () => {
  failWith = "reconecte o Google em Ajustes para liberar Gmail, Tarefas, Drive, Contatos e as respostas da Agenda";
  const errors: string[] = [];
  render(<AgendaTab agenda={agenda([invite])} onError={(m) => errors.push(m)} />);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /Talvez/ }));
  });
  expect(errors.join()).toContain("reconecte o Google");
  expect(reloads).toBe(0);
});
