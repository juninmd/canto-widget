/**
 * Prototype fixtures for the five suggested tabs: invented data only, so the shape of each idea can be judged
 * before any backend exists. Nothing here talks to the network or to the vault.
 */
import { LOCALE } from "../i18n";

export type ProtoCondition = "clear" | "cloudy" | "rain";
export type ProtoHour = { hour: number; temp: number; condition: ProtoCondition };
export type ProtoDay = { offset: number; min: number; max: number; condition: ProtoCondition };
export type ProtoQuote = { symbol: string; label: string; value: string; change: number; points: number[] };
export type ProtoHabit = { id: string; label: string; done: boolean; streak: number; best: number; week: boolean[] };
export type ProtoSnippet = { id: string; title: string; tags: string[]; body: string; uses: number };
export type ProtoRead = { id: string; title: string; source: string; minutes: number; unread: boolean; ago: string };

export const WEATHER = {
  now: 22,
  feels: 24,
  condition: "cloudy" as ProtoCondition,
  rainFrom: "16:00",
  hours: [
    { hour: 12, temp: 22, condition: "cloudy" },
    { hour: 13, temp: 23, condition: "cloudy" },
    { hour: 14, temp: 24, condition: "clear" },
    { hour: 15, temp: 23, condition: "rain" },
    { hour: 16, temp: 21, condition: "rain" },
    { hour: 17, temp: 20, condition: "rain" },
  ] as ProtoHour[],
  days: [
    { offset: 1, min: 17, max: 25, condition: "rain" },
    { offset: 2, min: 16, max: 24, condition: "cloudy" },
    { offset: 3, min: 15, max: 27, condition: "clear" },
    { offset: 4, min: 18, max: 28, condition: "clear" },
  ] as ProtoDay[],
};

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

export const READS: ProtoRead[] = [
  { id: "r1", title: "Como o cache do Cargo decide o que recompilar", source: "blog.exemplo.com", minutes: 6, unread: true, ago: "há 2 h" },
  { id: "r2", title: "Notas sobre escrita técnica curta", source: "texto.exemplo.org", minutes: 4, unread: true, ago: "há 6 h" },
  { id: "r3", title: "O que o Linux faz quando o disco enche", source: "kernel.exemplo.net", minutes: 11, unread: false, ago: "ontem" },
];

/** Signed percentage without the symbol, in the user's locale ("+0,31"); the catalog carries the "%". */
export function signedPercent(value: number): string {
  const abs = Math.abs(value).toLocaleString(LOCALE, { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  return `${value < 0 ? "-" : "+"}${abs}`;
}

/** Points for an SVG polyline: x spread across `width`, y scaled between the smallest and the largest value. */
export function sparkline(values: number[], width: number, height: number): string {
  if (values.length === 0) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const flat = max === min;
  const step = values.length > 1 ? width / (values.length - 1) : 0;
  return values
    .map((value, index) => {
      const ratio = flat ? 0.5 : (value - min) / (max - min);
      return `${(index * step).toFixed(1)},${(height - ratio * height).toFixed(1)}`;
    })
    .join(" ");
}
