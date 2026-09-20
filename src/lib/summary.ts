import type { AgendaItem, ForgeItem, Task } from "./api";
import { hour } from "./agenda";

/** Local midnight of a `YYYY-MM-DD` day, in ms. */
export function dayStart(day: string): number {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
}

function longDate(day: string): string {
  return new Date(dayStart(day)).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" });
}

/** Plain text, ready to paste into chat or email: no markdown that could break at the destination. */
export function daySummary(day: string, tasks: Task[], agenda: AgendaItem[], opened: ForgeItem[] = []): string {
  const done = tasks.filter((t) => t.done);
  const open = tasks.filter((t) => !t.done);
  const lines = [`Resumo de ${longDate(day)}`, ""];
  const section = (title: string, items: string[]) => {
    if (items.length === 0) return;
    lines.push(`${title} (${items.length})`, ...items.map((i) => `- ${i}`), "");
  };
  section("Concluído", done.map((t) => t.title));
  section("Pendente", open.map((t) => (t.hora ? `${t.title} (${t.hora})` : t.title)));
  section("Reuniões", agenda.map((e) => `${hour(e)} ${e.title}`));
  section("PRs/MRs abertos", opened.map((i) => `${i.reference} ${i.title}${i.draft ? " (rascunho)" : ""}`));
  if (lines.length === 2) lines.push("Nada registrado hoje.");
  return lines.join("\n").trimEnd();
}
