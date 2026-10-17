import type { protos as source } from "../pt-BR/protos";

export const protos: Record<keyof typeof source, string> = {
  "protos.tab.habits": "Habits",
  "protos.tab.market": "Market",
  "protos.tab.snippets": "Snippets",
  "protos.badge": "prototype",
  "protos.needs": "what is missing: {text}",
  "protos.habits.today": "today",
  "protos.habits.streak": "{n} days in a row",
  "protos.habits.best": "best: {n}",
  "protos.habits.week": "last 7 days",
  "protos.habits.needs": "the vault only, no network; the streak can feed the routine alerts that already exist",
  "protos.market.quotes": "quotes",
  "protos.market.change": "{n}% today",
  "protos.market.watchlist": "watchlist",
  "protos.market.needs": "the Central Bank (PTAX) and CoinGecko, both keyless, with a 15 min cache per quote",
  "protos.snippets.search": "search the snippets",
  "protos.snippets.copy": "copy",
  "protos.snippets.paste": "paste into the focused app",
  "protos.snippets.uses": "{n} uses",
  "protos.snippets.needs": "the vault only; the paste shortcut reuses the focused app Activity already records",
};
