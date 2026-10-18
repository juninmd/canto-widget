import type { market as source } from "../pt-BR/market";

export const market: Record<keyof typeof source, string> = {
  "market.tab": "Market",
  "market.quotes": "quotes",
  "market.change": "{n}% today",
};
