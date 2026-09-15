import type { AgendaItem, Repetir, Task } from "./api";

/** Janela em que o lembrete ainda vale: o vigia roda a cada 30 s e pode chegar atrasado. */
const TOLERANCIA_MIN = 2;
export const PREFIXO_TAREFA = "tarefa:";

function inicio(dia: string, hora: string): Date {
  const [a, m, d] = dia.split("-").map(Number);
  const [h, min] = hora.split(":").map(Number);
  return new Date(a, m - 1, d, h, min, 0);
}

/** Chave inclui dia e hora: remarcar a tarefa gera um aviso novo. */
export const chaveLembrete = (t: Task) => `${t.id}@${t.day}T${t.hora}`;

/** Tarefas em aberto cujo horário chegou há menos de 2 min e ainda não avisaram. */
export function lembretesDevidos(tarefas: Task[], jaAvisados: Set<string>, agora = new Date()): Task[] {
  return tarefas.filter((t) => {
    if (t.done || !t.hora || jaAvisados.has(chaveLembrete(t))) return false;
    const passou = (agora.getTime() - inicio(t.day, t.hora).getTime()) / 60_000;
    return passou >= 0 && passou < TOLERANCIA_MIN;
  });
}

/** O overlay de alerta fala a língua da agenda; a tarefa vira um evento com id marcado. */
export function comoEvento(t: Task): AgendaItem {
  const quando = inicio(t.day, t.hora ?? "00:00").toISOString();
  return { id: PREFIXO_TAREFA + t.id, titulo: t.title, inicio: quando, fim: quando, dia_inteiro: false, local: "", meet: "", link: "" };
}

export const ROTULO_REPETIR: Record<Repetir["tipo"], string> = {
  diaria: "todo dia",
  dias_uteis: "dias úteis",
  semanal: "toda semana",
};

/** 0 = domingo, igual ao Rust. */
export function diaDaSemana(dia: string): number {
  const [a, m, d] = dia.split("-").map(Number);
  return new Date(a, m - 1, d).getDay();
}
