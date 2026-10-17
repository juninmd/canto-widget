/**
 * Prototype fixtures for the suggested tabs that are still mockups: invented data only, so the shape of each
 * idea can be judged before any backend exists. Nothing here talks to the network or to the vault.
 */
import { LOCALE } from "../i18n";

export type ProtoQuote = { symbol: string; label: string; value: string; change: number; points: number[] };
export type ProtoHabit = { id: string; label: string; done: boolean; streak: number; best: number; week: boolean[] };
export type ProtoSnippet = { id: string; title: string; tags: string[]; body: string; uses: number };

export const HABITS: ProtoHabit[] = [
  { id: "h1", label: "Beber 2 L de água", done: true, streak: 12, best: 31, week: [true, true, true, false, true, true, true] },
  { id: "h2", label: "Alongar 10 min", done: false, streak: 3, best: 9, week: [false, true, true, true, false, false, false] },
  { id: "h3", label: "Ler 20 min", done: true, streak: 7, best: 14, week: [true, true, false, true, true, true, true] },
];

export const MARKET: ProtoQuote[] = [
  { symbol: "USD/BRL", label: "Dólar (PTAX)", value: "5,42", change: 0.31, points: [5.39, 5.41, 5.4, 5.43, 5.42, 5.44, 5.42] },
  { symbol: "EUR/BRL", label: "Euro", value: "5,88", change: -0.12, points: [5.9, 5.91, 5.89, 5.9, 5.88, 5.87, 5.88] },
  { symbol: "BTC/USD", label: "Bitcoin", value: "118.402", change: 1.24, points: [116.1, 117.4, 117.0, 118.2, 117.9, 118.6, 118.4] },
  { symbol: "IBOV", label: "Ibovespa", value: "132.540", change: -0.44, points: [133.2, 133.0, 132.8, 133.1, 132.7, 132.6, 132.5] },
];

export const SNIPPETS: ProtoSnippet[] = [
  { id: "s1", title: "Deploy do homolog", tags: ["deploy", "ssh"], body: "ssh homolog 'cd ~/app && git pull && make deploy'", uses: 23 },
  { id: "s2", title: "Assinatura de e-mail", tags: ["pessoal"], body: "Ana Exemplo · ana@example.com · +55 11 90000-0000", uses: 87 },
  {
    id: "s3",
    title: "Vendas por mês",
    tags: ["sql", "metrica"],
    body: "select date_trunc('month', criado_em) as mes, sum(valor) from pedidos group by 1 order by 1;",
    uses: 5,
  },
];

/** Signed percentage without the symbol, in the user's locale ("+0,31"); the catalog carries the "%". */
export function signedPercent(value: number): string {
  const abs = Math.abs(value).toLocaleString(LOCALE, { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  return `${value < 0 ? "-" : "+"}${abs}`;
}
