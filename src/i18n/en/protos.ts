import type { protos as source } from "../pt-BR/protos";

export const protos: Record<keyof typeof source, string> = {
  "protos.tab.market": "Market",
  "protos.badge": "prototype",
  "protos.needs": "what is missing: {text}",
  "protos.market.quotes": "quotes",
  "protos.market.change": "{n}% today",
  "protos.market.watchlist": "watchlist",
  "protos.market.needs": "the Central Bank (PTAX) and CoinGecko, both keyless, with a 15 min cache per quote",
};
