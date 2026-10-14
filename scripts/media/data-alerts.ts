import type { AgendaItem } from "../../src/lib/api";
import { roster } from "./data-agenda";

/** One minute before "Revisão de arquitetura": the moment the pop-up rings. */
export const ALERTS_AT = new Date(2026, 9, 9, 13, 59, 0);

const iso = (h: number, m: number) => new Date(2026, 9, 9, h, m).toISOString();
const base = { end: "", all_day: false, location: "", meet: "", link: "" };

export const MEETING: AgendaItem = {
  ...base,
  id: "evt-arch",
  title: "Revisão de arquitetura",
  start: iso(14, 0),
  end: iso(15, 0),
  meet: "https://meet.example.com/abc-defg-hij",
  link: "https://calendar.google.com/calendar/event?eid=demo",
  location: "Sala Orion",
  organizer: "Ana Exemplo",
  guests: roster.length,
  attendees: roster,
  description: "Pauta:\n1. Decisão sobre a fila de eventos\n2. Plano de migração do banco",
};

export const TASK_REMINDER: AgendaItem = { ...base, id: "task:t3", title: "Enviar relatório semanal", start: iso(13, 59) };
export const CI_FAILED: AgendaItem = {
  ...base,
  id: "pr:acme/atlas#479",
  title: "PR #479 · CI falhou",
  start: iso(13, 50),
  link: "https://github.com/acme/atlas/pull/479",
  tag: "ci",
  description: "acme/atlas · fix: backoff exponencial no webhook de cobrança\nFalhou: test (ubuntu) › cargo test",
};
export const OUTAGE: AgendaItem = { ...base, id: "status:aurora", title: "Aurora Cloud", start: iso(13, 34), link: "https://status.example.com/aurora", description: "Armazenamento: leituras falhando em uma região", tag: "critical" };
export const NEW_MODEL: AgendaItem = { ...base, id: "model:aurora", title: "Aurora 4", start: "", organizer: "Lumen Labs", description: "Lumen Labs · #1 com 73,2 pontos", tag: "Novo no top 10 · #1" };

export const alertsBefore = (): AgendaItem[] => [CI_FAILED, MEETING, TASK_REMINDER];
