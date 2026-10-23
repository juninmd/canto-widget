import { expect, test } from "bun:test";
import type { MarketQuote } from "./api";
import { formatPrice, marketState, priceUnit, quoteGlyph, quoteLabel, rangePosition, signedMove, signedPercent, visibleQuotes } from "./market";

const fx = { symbol: "USD/BRL", group: "fx" } as const;

test("reais keep cents, cheap currencies and coins get four digits, indexes and big coins are whole", () => {
  expect(formatPrice(fx, 5.4237)).toBe("5,42");
  expect(formatPrice({ symbol: "JPY/BRL", group: "fx" }, 0.03612)).toBe("0,0361");
  expect(formatPrice({ symbol: "EUR/USD", group: "fx" }, 1.0832)).toBe("1,0832");
  expect(formatPrice({ symbol: "IBOV", group: "index" }, 132540.4)).toBe("132.540");
  expect(formatPrice({ symbol: "BTC/USD", group: "crypto" }, 118402.9)).toBe("118.403");
  expect(formatPrice({ symbol: "ETH/USD", group: "crypto" }, 3412.5)).toBe("3.413");
  expect(formatPrice({ symbol: "SOL/USD", group: "crypto" }, 182.456)).toBe("182,46");
  expect(formatPrice({ symbol: "DOGE/USD", group: "crypto" }, 0.16234)).toBe("0,1623");
});

test("currencies are named in the UI language, brands and tickers stay as they are", () => {
  expect(quoteLabel("USD/BRL")).toBe("Dólar");
  expect(quoteLabel("GBP/BRL")).toBe("Libra");
  expect(quoteLabel("ARS/BRL")).toBe("Peso argentino");
  expect(quoteLabel("IBOV")).toBe("Ibovespa");
  expect(quoteLabel("ETH/USD")).toBe("Ethereum");
  expect(quoteLabel("S&P 500")).toBe("S&P 500");
  expect(quoteGlyph("BTC/USD")).toBe("₿");
  expect(quoteGlyph("DAX")).toBe("DE");
});

test("the variation carries its sign, the move in price units one more digit for currencies", () => {
  expect(signedPercent(0.31)).toBe("+0,31");
  expect(signedPercent(-0.4444)).toBe("-0,44");
  expect(signedPercent(0)).toBe("+0,0");
  expect(signedMove(fx, 0.0167, 5.42)).toBe("+0,0167");
  expect(signedMove({ symbol: "IBOV", group: "index" }, -586.2, 132540)).toBe("-586");
});

test("the unit goes before a price and after an index", () => {
  expect(priceUnit({ group: "fx", currency: "BRL" })).toEqual({ before: "R$", after: "" });
  expect(priceUnit({ group: "crypto", currency: "USD" })).toEqual({ before: "US$", after: "" });
  expect(priceUnit({ group: "index", currency: "BRL" })).toEqual({ before: "", after: "pts" });
});

test("a session says open until its end and closed outside it; coins never close", () => {
  const session: [number, number] = [1_000, 2_000];
  expect(marketState({ group: "index", session }, 1_500)?.kind).toBe("open");
  expect(marketState({ group: "index", session }, 2_500)?.kind).toBe("closed");
  expect(marketState({ group: "crypto", session: null }, 0)).toEqual({ kind: "always" });
  expect(marketState({ group: "fx", session: null }, 0)).toBeNull();
});

test("the watchlist filters by group and sorts by the day's move", () => {
  const q = (symbol: string, group: MarketQuote["group"], change: number) => ({ symbol, group, change }) as MarketQuote;
  const all = [q("USD/BRL", "fx", 0.3), q("IBOV", "index", -0.4), q("BTC/USD", "crypto", 1.2)];
  expect(visibleQuotes(all, "index", "default").map((x) => x.symbol)).toEqual(["IBOV"]);
  expect(visibleQuotes(all, "all", "gainers").map((x) => x.symbol)).toEqual(["BTC/USD", "USD/BRL", "IBOV"]);
  expect(visibleQuotes(all, "all", "losers")[0].symbol).toBe("IBOV");
  expect(all[0].symbol).toBe("USD/BRL");
});

test("the ruler marker stays on the bar", () => {
  expect(rangePosition(5, 0, 10)).toBe(50);
  expect(rangePosition(12, 0, 10)).toBe(100);
  expect(rangePosition(1, 1, 1)).toBe(50);
});
