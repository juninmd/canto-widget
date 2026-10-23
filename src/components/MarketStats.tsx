import type { MarketQuote } from "../lib/api";
import { formatPrice, priceDigits, rangePosition } from "../lib/market";
import { t } from "../i18n";

/** Low and high as a ruler with a marker on today's price, from red at the low end to green at the high end. */
function RangeBar({ label, low, high, price, text }: { label: string; low: number; high: number; price: number; text: (v: number) => string }) {
  return (
    <div className="col-span-2 flex flex-col gap-1" data-market-range={label}>
      <span className="text-[10px] uppercase tracking-wide text-faint">{label}</span>
      <div className="relative h-1 rounded-full bg-gradient-to-r from-danger/60 via-edge to-ok/60">
        <span
          aria-hidden="true"
          className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink bg-fg transition-[left] duration-500"
          style={{ left: `${rangePosition(price, low, high)}%` }}
        />
      </div>
      <span className="flex justify-between text-[10.5px] tabular-nums text-muted">
        <span>{text(low)}</span>
        <span>{text(high)}</span>
      </span>
    </div>
  );
}

/** The day's numbers under the curve; a number Yahoo left out is simply not shown. */
export default function MarketStats({ quote }: { quote: MarketQuote }) {
  const digits = priceDigits(quote, quote.price);
  const text = (value: number) => formatPrice(quote, value, digits);
  const pairs: [string, number | null][] = [
    [t("protos.market.open_price"), quote.open],
    [t("protos.market.prev_close"), quote.prev_close],
  ];
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-dashed border-edge pt-2">
      {pairs.map(([label, value]) =>
        value === null ? null : (
          <div key={label} className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[10px] uppercase tracking-wide text-faint">{label}</span>
            <span className="text-xs font-semibold tabular-nums text-fg">{text(value)}</span>
          </div>
        ),
      )}
      {quote.day_low !== null && quote.day_high !== null && (
        <RangeBar label={t("protos.market.day_range")} low={quote.day_low} high={quote.day_high} price={quote.price} text={text} />
      )}
      {quote.year_low !== null && quote.year_high !== null && (
        <RangeBar label={t("protos.market.year_range")} low={quote.year_low} high={quote.year_high} price={quote.price} text={text} />
      )}
    </div>
  );
}
