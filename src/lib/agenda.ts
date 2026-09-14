import type { AgendaItem } from "./api";

/** Janela do dia local em RFC3339, do zero-hora ao fim do dia. */
export function janelaDoDia(agora = new Date()): { timeMin: string; timeMax: string } {
  const inicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 0, 0, 0);
  const fim = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59);
  return { timeMin: inicio.toISOString(), timeMax: fim.toISOString() };
}

export function hora(item: AgendaItem): string {
  if (item.dia_inteiro) return "dia inteiro";
  const d = new Date(item.inicio);
  return Number.isNaN(d.getTime())
    ? item.inicio
    : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Minutos que faltam para o evento começar (negativo se já começou). */
export function minutosAte(item: AgendaItem, agora = new Date()): number {
  if (item.dia_inteiro) return Number.POSITIVE_INFINITY;
  const inicio = new Date(item.inicio).getTime();
  if (Number.isNaN(inicio)) return Number.POSITIVE_INFINITY;
  return (inicio - agora.getTime()) / 60000;
}

/**
 * Eventos que merecem o pop-up agora: começam dentro de `antecedencia` minutos,
 * ainda não começaram há mais de 2 min, e nunca foram alertados nesta sessão.
 */
export function paraAlertar(
  itens: AgendaItem[],
  jaAlertados: Set<string>,
  agora = new Date(),
  antecedencia = 1,
): AgendaItem[] {
  return itens.filter((i) => {
    if (jaAlertados.has(i.id)) return false;
    const m = minutosAte(i, agora);
    return m <= antecedencia && m > -2;
  });
}

/** Rótulo de leitura rápida: a cor sozinha não pode ser o único sinal de "agora" (WCAG 1.4.1). */
export function situacao(item: AgendaItem, agora = new Date()): { rotulo: string; agora: boolean } {
  const faltam = minutosAte(item, agora);
  if (!Number.isFinite(faltam)) return { rotulo: "", agora: false };
  const fim = new Date(item.fim).getTime();
  const acabou = Number.isNaN(fim) ? faltam <= -60 : fim <= agora.getTime();
  if (acabou) return { rotulo: "encerrado", agora: false };
  if (faltam <= 0) return { rotulo: "agora", agora: true };
  const min = Math.ceil(faltam);
  const h = Math.floor(min / 60);
  return { rotulo: h ? `em ${h}h${String(min % 60).padStart(2, "0")}` : `em ${min} min`, agora: false };
}
