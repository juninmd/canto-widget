import { t } from "../i18n";
import { MARKET, signedPercent, sparkline } from "../lib/protos";
import ProtoFrame from "./ProtoFrame";

/** Prototype: keyless quotes with the day's variation and a small curve; the watchlist would live in the vault. */
export default function ProtoMarket() {
  return (
    <ProtoFrame needs={t("protos.market.needs")}>
      <h3 className="text-[11px] text-faint">{t("protos.market.quotes")}</h3>
      <ul className="flex flex-col gap-1">
        {MARKET.map((quote) => (
          <li key={quote.symbol} data-proto-quote={quote.symbol} className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-hover">
            <span className="min-w-0 flex-1 truncate text-xs text-fg">{quote.label}</span>
            <span className="shrink-0 text-xs tabular-nums text-muted">{quote.value}</span>
            <span className={`shrink-0 text-[11px] tabular-nums ${quote.change >= 0 ? "text-accent-text" : "text-danger"}`}>
              {t("protos.market.change", { n: signedPercent(quote.change) })}
            </span>
            <svg viewBox="0 0 60 20" className={`h-5 w-16 shrink-0 ${quote.change >= 0 ? "text-accent" : "text-danger"}`} aria-hidden="true">
              <polyline points={sparkline(quote.points, 60, 20)} fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </li>
        ))}
      </ul>
      <h3 className="text-[11px] text-faint">{t("protos.market.watchlist")}</h3>
      <div className="flex flex-wrap gap-1">
        {["USD/BRL", "EUR/BRL", "BTC/USD", "IBOV", "PETR4", "ITUB4"].map((symbol, index) => (
          <span
            key={symbol}
            className={`rounded-full px-2 py-0.5 text-[10px] ${index < 4 ? "bg-edge text-fg" : "border border-dashed border-edge text-faint"}`}
          >
            {symbol}
          </span>
        ))}
      </div>
    </ProtoFrame>
  );
}
