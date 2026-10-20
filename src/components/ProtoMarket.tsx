import { useState, type CSSProperties } from "react";
import { t } from "../i18n";
import { MARKET, signedPercent } from "../lib/protos";
import MarketChart from "./MarketChart";
import MarketDelta from "./MarketDelta";
import ProtoFrame from "./ProtoFrame";

const WATCHLIST = ["USD/BRL", "EUR/BRL", "BTC/USD", "IBOV", "PETR4", "ITUB4"];

/** Prototype: keyless quotes with the day's variation; picking a card puts its curve in the spotlight. */
export default function ProtoMarket() {
  const [picked, setPicked] = useState(MARKET[0].symbol);
  const hero = MARKET.find((quote) => quote.symbol === picked) ?? MARKET[0];
  const up = hero.change >= 0;
  return (
    <ProtoFrame needs={t("protos.market.needs")}>
      <section
        data-market-hero={hero.symbol}
        className={`wx-glass wx-rise relative shrink-0 overflow-hidden p-3 bg-gradient-to-br ${up ? "from-ok/10" : "from-danger/10"} to-transparent`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] uppercase tracking-wide text-faint">{hero.symbol}</span>
            <h3 className="truncate text-xs text-muted">{hero.label}</h3>
          </div>
          <MarketDelta change={hero.change} label={t("protos.market.change", { n: signedPercent(hero.change) })} />
        </div>
        <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-fg">{hero.value}</p>
        <div className="-mx-3 -mb-3 mt-2">
          <MarketChart key={hero.symbol} points={hero.points} up={up} width={240} height={56} draw />
        </div>
      </section>
      <h3 className="px-0.5 text-[11px] text-faint">{t("protos.market.quotes")}</h3>
      <ul className="grid shrink-0 grid-cols-2 gap-2">
        {MARKET.map((quote, index) => (
          <li key={quote.symbol} className="wx-rise" style={{ "--i": index + 1 } as CSSProperties}>
            <button
              type="button"
              data-proto-quote={quote.symbol}
              aria-pressed={quote.symbol === hero.symbol}
              onClick={() => setPicked(quote.symbol)}
              className={`wx-glass flex w-full flex-col gap-1 overflow-hidden p-2 pb-0 text-left transition-colors hover:bg-hover focus-visible:outline-2 focus-visible:outline-accent ${
                quote.symbol === hero.symbol ? "ring-1 ring-accent/60" : ""
              }`}
            >
              <span className="flex items-center justify-between gap-1">
                <span className="truncate text-[11px] text-muted">{quote.label}</span>
                <MarketDelta change={quote.change} />
              </span>
              <span className="text-sm font-semibold tabular-nums text-fg">{quote.value}</span>
              <span className="-mx-2">
                <MarketChart points={quote.points} up={quote.change >= 0} width={120} height={24} />
              </span>
            </button>
          </li>
        ))}
      </ul>
      <h3 className="px-0.5 text-[11px] text-faint">{t("protos.market.watchlist")}</h3>
      <div className="flex flex-wrap gap-1.5">
        {WATCHLIST.map((symbol) => {
          const tracked = MARKET.some((quote) => quote.symbol === symbol);
          return (
            <span
              key={symbol}
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                tracked ? "bg-accent/15 text-accent-text" : "border border-dashed border-edge text-faint"
              }`}
            >
              {symbol}
            </span>
          );
        })}
      </div>
    </ProtoFrame>
  );
}
