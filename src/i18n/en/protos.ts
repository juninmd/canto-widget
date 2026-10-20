import type { protos as source } from "../pt-BR/protos";

export const protos: Record<keyof typeof source, string> = {
  "protos.tab.market": "Market",
  "protos.market.quotes": "quotes",
  "protos.market.change": "{n}% today",
  "protos.market.usd": "Dollar",
  "protos.market.eur": "Euro",
  "protos.market.loading": "checking the quotes",
  "protos.market.source": "data: Yahoo Finance",
};
