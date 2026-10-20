import { expect, test } from "bun:test";
import { formatPrice, quoteLabel, signedPercent } from "./market";

test("currencies keep cents and indexes are whole numbers, in the user's locale", () => {
  expect(formatPrice("USD/BRL", 5.4237)).toBe("5,42");
  expect(formatPrice("IBOV", 132540.4)).toBe("132.540");
  expect(formatPrice("BTC/USD", 118402.9)).toBe("118.403");
});

test("the dollar and the euro are named in the UI language, tickers stay as they are", () => {
  expect(quoteLabel("USD/BRL")).toBe("Dólar");
  expect(quoteLabel("EUR/BRL")).toBe("Euro");
  expect(quoteLabel("IBOV")).toBe("Ibovespa");
  expect(quoteLabel("S&P 500")).toBe("S&P 500");
});

test("the variation carries its sign", () => {
  expect(signedPercent(0.31)).toBe("+0,31");
  expect(signedPercent(-0.4444)).toBe("-0,44");
  expect(signedPercent(0)).toBe("+0,0");
});
