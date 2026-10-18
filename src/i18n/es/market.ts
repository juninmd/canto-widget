import type { market as source } from "../pt-BR/market";

export const market: Record<keyof typeof source, string> = {
  "market.tab": "Mercado",
  "market.quotes": "cotizaciones",
  "market.change": "{n}% en el día",
};
