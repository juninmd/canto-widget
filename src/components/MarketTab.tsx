import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { api, errText, type MarketView } from "../lib/api";
import { formatPrice, quoteLabel, signedPercent } from "../lib/market";
import { useRefreshEvent } from "../lib/useRefreshEvent";
import { fetchedClock } from "../lib/weather";
import { t } from "../i18n";
import ErrorBanner from "./ErrorBanner";
import MarketChart from "./MarketChart";
import MarketDelta from "./MarketDelta";
import Skeleton from "./Skeleton";

/** Live quotes with the day's variation; picking a card puts its curve in the spotlight. */
export default function MarketTab() {
  const [view, setView] = useState<MarketView | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState("");

  const load = useCallback(async (force: boolean) => {
    setLoading(true);
    try {
      setView(await api.marketGet(force));
      setError("");
    } catch (e) {
      setError(errText(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(false);
  }, [load]);
  useRefreshEvent("market", () => void load(false));

  const failure = error || view?.error || "";
  if (view === null || view.quotes.length === 0) {
    return failure ? <ErrorBanner message={failure} busy={loading} onRetry={() => void load(true)} /> : <Skeleton label={t("protos.market.loading")} rows={4} />;
  }

  const hero = view.quotes.find((quote) => quote.symbol === picked) ?? view.quotes[0];
  const up = hero.change >= 0;
  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto pr-0.5">
      {failure && <ErrorBanner message={failure} busy={loading} onRetry={() => void load(true)} />}
      <section
        data-market-hero={hero.symbol}
        className={`wx-glass wx-rise relative shrink-0 overflow-hidden bg-gradient-to-br p-3 ${up ? "from-ok/10" : "from-danger/10"} to-transparent`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] uppercase tracking-wide text-faint">{hero.symbol}</span>
            <h3 className="truncate text-xs text-muted">{quoteLabel(hero.symbol)}</h3>
          </div>
          <span className="flex shrink-0 items-center gap-1.5">
            <MarketDelta change={hero.change} label={t("protos.market.change", { n: signedPercent(hero.change) })} />
            <button
              type="button"
              onClick={() => void load(true)}
              disabled={loading}
              aria-label={t("weather.refresh")}
              className="canto-hit flex h-6 w-6 items-center justify-center rounded-full text-muted hover:bg-hover hover:text-fg disabled:opacity-60"
            >
              <span aria-hidden="true" className={`inline-block text-sm leading-none ${loading ? "wx-spin" : ""}`}>
                ↻
              </span>
            </button>
          </span>
        </div>
        <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-fg">{formatPrice(hero.symbol, hero.price)}</p>
        <div className="-mx-3 -mb-3 mt-2">
          <MarketChart key={hero.symbol} points={hero.points} up={up} width={240} height={56} draw />
        </div>
      </section>
      <h3 className="px-0.5 text-[11px] text-faint">{t("protos.market.quotes")}</h3>
      <ul className="grid shrink-0 grid-cols-2 gap-2">
        {view.quotes.map((quote, index) => (
          <li key={quote.symbol} className="wx-rise" style={{ "--i": index + 1 } as CSSProperties}>
            <button
              type="button"
              data-market-quote={quote.symbol}
              aria-pressed={quote.symbol === hero.symbol}
              onClick={() => setPicked(quote.symbol)}
              className={`wx-glass flex w-full flex-col gap-1 overflow-hidden p-2 pb-0 text-left transition-colors hover:bg-hover focus-visible:outline-2 focus-visible:outline-accent ${
                quote.symbol === hero.symbol ? "ring-1 ring-accent/60" : ""
              }`}
            >
              <span className="flex items-center justify-between gap-1">
                <span className="truncate text-[11px] text-muted">{quoteLabel(quote.symbol)}</span>
                <MarketDelta change={quote.change} />
              </span>
              <span className="text-sm font-semibold tabular-nums text-fg">{formatPrice(quote.symbol, quote.price)}</span>
              <span className="-mx-2">
                <MarketChart points={quote.points} up={quote.change >= 0} width={120} height={24} />
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-auto pb-1 text-center text-[10px] text-faint">
        {t("protos.market.source")}
        {view.fetched_at > 0 && ` · ${t("weather.updated", { time: fetchedClock(view.fetched_at) })}`}
      </p>
    </div>
  );
}
