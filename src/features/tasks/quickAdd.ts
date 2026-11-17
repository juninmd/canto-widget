import type { Priority } from "../../lib/api";

export type QuickTask = { title: string; time: string | null; priority?: Priority; day?: string };
// "14h" alone stays in the title: "Estudar 2h" is a duration, not a reminder.
// Groups: 12-hour clock (2 hour, 3 minute, 4 a/p), "às 14h30" (5, 6), bare "18:00" (7, 8).
const TIME =
  /(^|\s)(?:(?:(?:[àa]s|at)\s+)?(\d{1,2})(?::(\d{2}))?\s?([ap])\.?m\.?|(?:[àa]s|at)\s+(\d{1,2})(?:h|:)(\d{2})?|(\d{1,2}):(\d{2}))(?=\s|$)/i;
const PRIORITY_TOKEN: Record<string, Priority> = {
  alta: "high", high: "high", "1": "high",
  media: "medium", "média": "medium", medium: "medium", "2": "medium",
  baixa: "low", baja: "low", low: "low", "3": "low",
};

/** "!alta", "!média", "!baixa" (or !high/!medium/!low, !1/!2/!3) anywhere sets the priority and leaves the title. */
export function takePriority(input: string): { rest: string; priority?: Priority } {
  let priority: Priority | undefined;
  const rest = input.replace(/(^|\s)!(\p{L}+|[123])(?=\s|$)/giu, (whole, lead: string, word: string) => {
    const found = PRIORITY_TOKEN[word.toLowerCase()];
    if (!found || priority) return whole;
    priority = found;
    return lead;
  });
  return priority ? { rest: rest.replace(/\s+/g, " ").trim(), priority } : { rest: input };
}

const DAY_WORDS: Record<string, number> = {
  hoje: 0, today: 0, hoy: 0,
  "amanhã": 1, amanha: 1, tomorrow: 1, "mañana": 1, manana: 1,
};
const WEEKDAYS: Record<string, number> = {
  dom: 0, domingo: 0, seg: 1, segunda: 1, ter: 2, "terça": 2, terca: 2, qua: 3, quarta: 3,
  qui: 4, quinta: 4, sex: 5, sexta: 5, "sáb": 6, sab: 6, "sábado": 6, sabado: 6,
};
const DAY_TOKEN = /(^|\s)(\p{L}+|\d{1,2}\/\d{1,2})(?=\s|$)/giu;

const ymd = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

/** Resolves one token ("amanhã", "seg", "25/12") to a local YYYY-MM-DD, or null when it is not a day. */
function resolveDay(token: string, now: Date): string | null {
  const w = token.toLowerCase();
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const offset = DAY_WORDS[w];
  if (offset !== undefined) return ymd(new Date(base.getFullYear(), base.getMonth(), base.getDate() + offset));
  const wd = WEEKDAYS[w];
  if (wd !== undefined) {
    const ahead = ((wd - base.getDay() + 7) % 7) || 7; // the same weekday means next week
    return ymd(new Date(base.getFullYear(), base.getMonth(), base.getDate() + ahead));
  }
  const m = /^(\d{1,2})\/(\d{1,2})$/.exec(token);
  if (!m) return null;
  const [d, mo] = [Number(m[1]), Number(m[2])];
  for (const year of [base.getFullYear(), base.getFullYear() + 1]) {
    const c = new Date(year, mo - 1, d);
    if (c.getMonth() !== mo - 1 || c.getDate() !== d) return null; // 31/02 and the like stay in the title
    if (c >= base) return ymd(c);
  }
  return null;
}

/** Takes the first day token ("amanhã", "seg", "dd/mm") out of the text; unknown words stay in the title. */
function takeDay(input: string, now: Date): { rest: string; day?: string } {
  for (const m of input.matchAll(DAY_TOKEN)) {
    const day = resolveDay(m[2], now);
    if (!day) continue;
    const rest = (input.slice(0, m.index) + m[1] + input.slice(m.index + m[0].length)).replace(/\s+/g, " ").trim();
    return rest ? { rest, day } : { rest: input };
  }
  return { rest: input };
}

export function parseQuickTask(raw: string, now = new Date()): QuickTask {
  const { rest: noPriority, priority } = takePriority(raw);
  const { rest, day } = takeDay(noPriority, now);
  const parsed = parseTime(rest);
  // "!alta" alone leaves an empty title on purpose: the caller must ask for one instead of saving "!alta".
  return { ...parsed, ...(priority ? { priority } : {}), ...(day ? { day } : {}) };
}

function parseTime(input: string): QuickTask {
  const m = TIME.exec(input);
  if (!m) return { title: input.trim(), time: null };
  let hour = Number(m[2] ?? m[5] ?? m[7]);
  const minute = Number(m[3] ?? m[6] ?? m[8] ?? 0);
  if (m[4]) {
    if (hour < 1 || hour > 12) return { title: input.trim(), time: null };
    hour = (hour % 12) + (m[4].toLowerCase() === "p" ? 12 : 0);
  }
  if (hour > 23 || minute > 59) return { title: input.trim(), time: null };
  const title = (input.slice(0, m.index) + m[1] + input.slice(m.index + m[0].length)).replace(/\s+/g, " ").trim();
  if (!title) return { title: input.trim(), time: null };
  const pad = (n: number) => String(n).padStart(2, "0");
  return { title, time: `${pad(hour)}:${pad(minute)}` };
}
