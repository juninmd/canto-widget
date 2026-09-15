import type { AgendaItem, Task } from "./api";
import { hora } from "./agenda";

function dataLonga(dia: string): string {
  const [a, m, d] = dia.split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" });
}

/** Texto puro, pronto para colar em chat ou e-mail: nada de markdown que quebre no destino. */
export function resumoDoDia(dia: string, tarefas: Task[], agenda: AgendaItem[]): string {
  const feitas = tarefas.filter((t) => t.done);
  const abertas = tarefas.filter((t) => !t.done);
  const linhas = [`Resumo de ${dataLonga(dia)}`, ""];
  const secao = (titulo: string, itens: string[]) => {
    if (itens.length === 0) return;
    linhas.push(`${titulo} (${itens.length})`, ...itens.map((i) => `- ${i}`), "");
  };
  secao("Concluído", feitas.map((t) => t.title));
  secao("Pendente", abertas.map((t) => (t.hora ? `${t.title} (${t.hora})` : t.title)));
  secao("Reuniões", agenda.map((e) => `${hora(e)} ${e.titulo}`));
  if (linhas.length === 2) linhas.push("Nada registrado hoje.");
  return linhas.join("\n").trimEnd();
}
