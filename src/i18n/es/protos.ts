import type { protos as source } from "../pt-BR/protos";

export const protos: Record<keyof typeof source, string> = {
  "protos.tab.market": "Mercado",
  "protos.badge": "prototipo",
  "protos.needs": "lo que falta: {text}",
  "protos.market.quotes": "cotizaciones",
  "protos.market.change": "{n}% en el día",
  "protos.market.watchlist": "lista de seguimiento",
  "protos.market.needs": "Banco Central (PTAX) y CoinGecko, ambos sin clave, con caché de 15 min por cotización",
};
