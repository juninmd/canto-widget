import type { CSSProperties } from "react";
import type { MarketQuote } from "../lib/api";
import { formatPrice, quoteGlyph, quoteLabel } from "../lib/market";
import MarketChart from "./MarketChart";
import MarketDelta from "./MarketDelta";
import PriceTick from "./PriceTick";

/** One line of the watchlist: badge, name and ticker, the day's mini curve, price and variation. */
export default function MarketRow({ quote, picked, index, onPick }: { quote: MarketQuote; picked: boolean; index: number; onPick: () => void }) {
  return (
    <li className="wx-rise border-t border-edge first:border-t-0" style={{ "--i": Math.min(index, 8) } as CSSProperties}>
      <button
        type="button"
        data-market-quote={quote.symbol}
        aria-pressed={picked}
        onClick={onPick}
        className={`grid w-full grid-cols-[1.75rem_minmax(0,1fr)_3.5rem_auto] items-center gap-2.5 px-2.5 py-2 text-left transition-colors hover:bg-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent ${
          picked ? "bg-accent/10 shadow-[inset_3px_0_0_var(--color-accent)]" : ""
        }`}
      >
        <span aria-hidden="true" className="flex size-7 items-center justify-center rounded-lg bg-hover text-[10px] font-bold text-fg">
          {quoteGlyph(quote.symbol)}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-xs font-semibold text-fg">{quoteLabel(quote.symbol)}</span>
          <span className="block truncate text-[10px] text-faint">{quote.symbol}</span>
        </span>
        <MarketChart points={quote.points} up={quote.change >= 0} baseline={quote.prev_close} width={56} height={22} />
        <span className="flex flex-col items-end gap-0.5">
          <PriceTick value={quote.price} text={formatPrice(quote, quote.price)} className="rounded px-0.5 -mx-0.5 text-xs font-semibold tabular-nums text-fg" />
          <MarketDelta change={quote.change} />
        </span>
      </button>
    </li>
  );
}
