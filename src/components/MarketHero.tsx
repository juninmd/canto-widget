import { useEffect, useState } from "react";
import { api, type MarketHistory, type MarketQuote, type MarketRange } from "../lib/api";
import { RANGES, formatPrice, pointTime, priceDigits, priceUnit, quoteGlyph, quoteLabel, signedMove, signedPercent } from "../lib/market";
import { t } from "../i18n";
import MarketSpotChart from "./MarketSpotChart";
import MarketStats from "./MarketStats";
import PriceTick from "./PriceTick";

/** The picked asset in the spotlight: price, the move over the chosen period, its curve and the day's numbers. */
export default function MarketHero({ quote }: { quote: MarketQuote }) {
  const [range, setRange] = useState<MarketRange>("1d");
  const [history, setHistory] = useState<{ key: string; curve: MarketHistory } | null>(null);
  const [failed, setFailed] = useState("");
  const [attempt, setAttempt] = useState(0);
  const key = `${quote.symbol}|${range}`;

  useEffect(() => {
    if (range === "1d") return;
    let live = true;
    api
      .marketHistory(quote.symbol, range)
      .then((curve) => live && (setHistory({ key, curve }), setFailed("")))
      .catch(() => live && setFailed(key));
    return () => {
      live = false;
    };
  }, [quote.symbol, range, key, attempt]);

  const longer = range !== "1d" && history?.key === key && failed !== key ? history.curve : null;
  const loading = range !== "1d" && !longer && failed !== key;
  const points = longer?.points ?? quote.points;
  const times = longer?.times ?? quote.times;
  const shown = longer ? range : "1d";
  const baseline = longer ? longer.points[0] : (quote.prev_close ?? quote.points[0] ?? quote.price);
  const delta = quote.price - baseline;
  const percent = baseline === 0 ? 0 : (delta / baseline) * 100;
  const up = delta >= 0;
  const unit = priceUnit(quote);
  const name = quoteLabel(quote.symbol);
  const digits = priceDigits(quote, quote.price);

  return (
    <section
      data-market-hero={quote.symbol}
      className={`wx-glass wx-rise relative flex shrink-0 flex-col gap-2 overflow-hidden bg-gradient-to-br p-3 ${up ? "from-ok/10" : "from-danger/10"} to-transparent`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-hover text-[11px] font-bold text-fg">
            {quoteGlyph(quote.symbol)}
          </span>
          <div className="min-w-0">
            <span className="block text-[10px] uppercase tracking-wide text-faint">{quote.symbol}</span>
            <h3 className="truncate text-[13px] font-semibold text-fg">{name}</h3>
          </div>
        </div>
        <div role="group" aria-label={t("protos.market.periods")} className="flex shrink-0 gap-0.5">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={r === range}
              onClick={() => setRange(r)}
              className={`canto-hit rounded-md px-1.5 py-0.5 text-[11px] font-medium transition-colors ${
                r === range ? (up ? "bg-ok/15 text-ok" : "bg-danger/15 text-danger") : "text-muted hover:bg-hover hover:text-fg"
              }`}
            >
              {t(`protos.market.range.${r}`)}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <p className="text-[28px] font-semibold leading-none tabular-nums tracking-tight text-fg">
          {unit.before && <span className="mr-1 text-[13px] font-medium text-muted">{unit.before}</span>}
          <PriceTick key={quote.symbol} value={quote.price} text={formatPrice(quote, quote.price)} className="rounded px-0.5 -mx-0.5" />
          {unit.after && <span className="ml-1 text-[13px] font-medium text-muted">{unit.after}</span>}
        </p>
        <span data-market-move className={`text-xs font-semibold tabular-nums ${up ? "text-ok" : "text-danger"}`}>
          {signedMove(quote, delta, quote.price)} ({signedPercent(percent)}%) <span className="font-normal text-faint">{t(`protos.market.since.${shown}`)}</span>
        </span>
      </div>
      <div className={loading ? "opacity-50 transition-opacity" : "transition-opacity"} aria-busy={loading}>
        <MarketSpotChart
          key={`${quote.symbol}|${shown}`}
          points={points}
          times={times}
          baseline={baseline}
          up={up}
          label={t("protos.market.chart", { name })}
          price={(value) => formatPrice(quote, value, digits)}
          time={(seconds) => pointTime(shown, seconds)}
        />
      </div>
      {failed === key && (
        <p className="flex items-center gap-2 text-[11px] text-warn">
          <span className="min-w-0 flex-1">{t("protos.market.history_error")}</span>
          <button
            type="button"
            data-market-retry
            onClick={() => {
              setFailed("");
              setAttempt((n) => n + 1);
            }}
            className="canto-hit shrink-0 rounded-md px-1.5 font-semibold hover:bg-hover"
          >
            {t("common.retry")}
          </button>
        </p>
      )}
      <MarketStats quote={quote} />
    </section>
  );
}
