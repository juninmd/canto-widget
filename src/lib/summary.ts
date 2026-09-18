import type { AgendaItem, Task } from "./api";
import { hour } from "./agenda";

function longDate(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" });
}

/** Plain text, ready to paste into chat or email: no markdown that could break at the destination. */
export function daySummary(day: string, tasks: Task[], agenda: AgendaItem[]): string {
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
  if (lines.length === 2) lines.push("Nada registrado hoje.");
  return lines.join("\n").trimEnd();
}
