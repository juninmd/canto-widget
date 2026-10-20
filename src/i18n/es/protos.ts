import type { protos as source } from "../pt-BR/protos";

export const protos: Record<keyof typeof source, string> = {
  "protos.tab.market": "Mercado",
  "protos.market.quotes": "cotizaciones",
  "protos.market.change": "{n}% en el día",
  "protos.market.usd": "Dólar",
  "protos.market.eur": "Euro",
  "protos.market.loading": "consultando las cotizaciones",
  "protos.market.source": "datos: Yahoo Finance",
};
