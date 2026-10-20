// O Mercado nasceu como protótipo: os rótulos moram aqui, e não no app.ts, para não deslocar as chaves já
// traduzidas nos catálogos gerados (scripts/expand-languages.py divide por ordem).
export const protos = {
  "protos.tab.market": "Mercado",
  "protos.market.quotes": "cotações",
  "protos.market.change": "{n}% no dia",
  "protos.market.usd": "Dólar",
  "protos.market.eur": "Euro",
  "protos.market.loading": "consultando as cotações",
  "protos.market.source": "dados: Yahoo Finance",
} as const;
