import type { protos as source } from "../pt-BR/protos";

export const protos: Record<keyof typeof source, string> = {
  "protos.tab.habits": "Hábitos",
  "protos.tab.market": "Mercado",
  "protos.tab.snippets": "Snippets",
  "protos.badge": "prototipo",
  "protos.needs": "lo que falta: {text}",
  "protos.habits.today": "hoy",
  "protos.habits.streak": "{n} días seguidos",
  "protos.habits.best": "récord: {n}",
  "protos.habits.week": "últimos 7 días",
  "protos.habits.needs": "solo la bóveda, sin red; la racha puede alimentar los avisos de rutina que ya existen",
  "protos.market.quotes": "cotizaciones",
  "protos.market.change": "{n}% en el día",
  "protos.market.watchlist": "lista de seguimiento",
  "protos.market.needs": "Banco Central (PTAX) y CoinGecko, ambos sin clave, con caché de 15 min por cotización",
  "protos.snippets.search": "buscar en los snippets",
  "protos.snippets.copy": "copiar",
  "protos.snippets.paste": "pegar en la app en foco",
  "protos.snippets.uses": "{n} usos",
  "protos.snippets.needs": "solo la bóveda; el atajo de pegar reutiliza la app en foco que la Actividad ya registra",
};
