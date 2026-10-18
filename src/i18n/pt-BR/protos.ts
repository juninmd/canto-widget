// As abas de protótipo também são áreas de texto: os rótulos moram aqui, e não no app.ts, para não deslocar as
// chaves já traduzidas nos catálogos gerados (scripts/expand-languages.py divide por ordem).
export const protos = {
  "protos.tab.market": "Mercado",
  "protos.badge": "protótipo",
  "protos.needs": "o que falta: {text}",
  "protos.market.quotes": "cotações",
  "protos.market.change": "{n}% no dia",
  "protos.market.watchlist": "lista de acompanhamento",
  "protos.market.needs": "Banco Central (PTAX) e CoinGecko, ambos sem chave, com cache de 15 min por citação",
} as const;
