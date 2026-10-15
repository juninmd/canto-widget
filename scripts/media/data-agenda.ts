import type { Page } from "@playwright/test";
import type { AgendaItem, Guest, Rsvp } from "../../src/lib/api";

const at = (day: number, h: number, m = 0) => new Date(2026, 9, day, h, m).toISOString();
const guest = (name: string, response: Rsvp, extra: Partial<Guest> = {}): Guest => ({
  name,
  email: `${name.split(" ")[0]!.toLowerCase()}@example.com`,
  response,
  organizer: false,
  optional: false,
  me: false,
  ...extra,
});

export const roster: Guest[] = [
  guest("Ana Exemplo", "accepted", { organizer: true }),
  guest("Eu", "accepted", { me: true, email: "eu@example.com" }),
  guest("Bruno Teste", "accepted"),
  guest("Carla Modelo", "tentative"),
  guest("Diego Amostra", "needsAction"),
  guest("Eva Prado", "declined", { optional: true }),
];

const event = (id: string, title: string, day: number, from: [number, number], to: [number, number], extra: Partial<AgendaItem> = {}): AgendaItem => ({
  id,
  title,
  start: at(day, ...from),
  end: at(day, ...to),
  all_day: false,
  location: "",
  meet: "",
  link: "https://calendar.google.com/calendar/event?eid=demo",
  response: "accepted",
  ...extra,
});

const MEET = "https://meet.example.com/abc-defg-hij";

/** Friday 9 and Saturday 10 October 2026: a meeting in progress, a clash, a declined lunch and free gaps between. */
export const EVENTS: AgendaItem[] = [
  { ...event("home", "Home office", 9, [0, 0], [23, 59]), all_day: true },
  event("daily", "Daily do time", 9, [9, 30], [9, 45], { meet: MEET }),
  event("plan", "Planejamento da sprint", 9, [10, 0], [10, 45], {
    meet: MEET,
    location: "Sala Orion",
    organizer: "Ana Exemplo",
    creator: "Ana Exemplo",
    guests: 6,
    description: "Pauta:\n1. Bloqueios da sprint anterior\n2. Priorização do backlog\n3. Metas e responsáveis",
    attachments: [{ title: "Anotações do Gemini", url: "https://docs.google.com/document/d/demo", mime: "" }],
    attendees: roster,
  }),
  event("cafe", "Café com fornecedor", 9, [10, 30], [11, 0], { location: "Recepção", response: "tentative" }),
  event("lunch", "Almoço do time", 9, [12, 0], [13, 0], { response: "declined" }),
  event("arch", "Revisão de arquitetura", 9, [14, 0], [15, 0], { meet: MEET }),
  event("one", "1:1 com a liderança", 9, [17, 0], [17, 30], { meet: MEET }),
  event("tomorrow-a", "Treino de futsal", 10, [9, 0], [10, 0], { location: "Quadra do bairro" }),
  event("tomorrow-b", "Almoço em família", 10, [12, 30], [14, 0], { response: "tentative" }),
];

/** Answers the agenda command by the range asked for, as Google does; the e2e mock returns one fixed list. */
export async function seedAgenda(page: Page, events: AgendaItem[] = EVENTS) {
  await page.addInitScript((list: AgendaItem[]) => {
    const w = window as unknown as { __TAURI_INTERNALS__: { invoke: (cmd: string, args?: Record<string, string>) => Promise<unknown> } };
    const base = w.__TAURI_INTERNALS__.invoke;
    w.__TAURI_INTERNALS__.invoke = async (cmd, args = {}) => {
      if (cmd === "agenda_today") {
        const [from, to] = [Date.parse(args.timeMin!), Date.parse(args.timeMax!)];
        return list.filter((e) => Date.parse(e.start) < to && Date.parse(e.end) > from);
      }
      return base(cmd, args);
    };
  }, events);
}
