import { useCallback, useEffect, useState } from "react";
import { api, errText, type MarketGroup, type MarketView } from "../lib/api";
import { marketState, visibleQuotes, type MarketSort } from "../lib/market";
import { useRefreshEvent } from "../lib/useRefreshEvent";
import { fetchedClock } from "../lib/weather";
import { t } from "../i18n";
import ErrorBanner from "./ErrorBanner";
import MarketHero from "./MarketHero";
import MarketRow from "./MarketRow";
import Skeleton from "./Skeleton";

const GROUPS: (MarketGroup | "all")[] = ["all", "fx", "index", "crypto"];
const SORTS: MarketSort[] = ["default", "gainers", "losers"];

/** Live quotes as a watchlist: the pick goes to the spotlight, the rest can be filtered by kind and sorted by move. */
export default function MarketTab() {
  const [view, setView] = useState<MarketView | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState("");
  const [group, setGroup] = useState<MarketGroup | "all">("all");
  const [sort, setSort] = useState<MarketSort>("default");

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

  const shown = visibleQuotes(view.quotes, group, sort);
  const hero = shown.find((quote) => quote.symbol === picked) ?? shown[0] ?? view.quotes[0];
  const ups = view.quotes.filter((quote) => quote.change >= 0).length;
  const downs = view.quotes.length - ups;
  const state = marketState(hero, Date.now() / 1000);
  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto pr-0.5">
      {failure && <ErrorBanner message={failure} busy={loading} onRetry={() => void load(true)} />}
      <div className="flex shrink-0 items-center gap-2 text-[11px] text-muted">
        {state && (
          <span data-market-state={state.kind} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-edge py-0.5 pl-1.5 pr-2">
            <span aria-hidden="true" className={`size-1.5 rounded-full ${state.kind === "closed" ? "bg-faint" : "canto-endpoint bg-ok"}`} />
            {state.kind === "always" ? t("protos.market.state.always") : t(`protos.market.state.${state.kind}`, { time: state.at })}
          </span>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5" data-market-breadth>
          <div aria-hidden="true" className="flex h-1 overflow-hidden rounded-full bg-edge">
            <span className="canto-grow-x bg-ok" style={{ width: `${(ups / view.quotes.length) * 100}%` }} />
            <span className="bg-danger" style={{ width: `${(downs / view.quotes.length) * 100}%` }} />
          </div>
          <span className="flex justify-between text-[10px] tabular-nums">
            <span className="text-ok">▲ {t("protos.market.up", { n: ups })}</span>
            <span className="text-danger">{t("protos.market.down", { n: downs })} ▼</span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => void load(true)}
          disabled={loading}
          aria-label={t("weather.refresh")}
          className="canto-hit flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted hover:bg-hover hover:text-fg disabled:opacity-60"
        >
          <span aria-hidden="true" className={`inline-block text-sm leading-none ${loading ? "wx-spin" : ""}`}>
            ↻
          </span>
        </button>
      </div>
      <div role="group" aria-label={t("protos.market.groups")} className="flex shrink-0 gap-1 rounded-[10px] border border-edge bg-ink p-0.5">
        {GROUPS.map((g) => (
          <button
            key={g}
            type="button"
            aria-pressed={g === group}
            onClick={() => setGroup(g)}
            className={`flex-1 rounded-lg py-1 text-[11px] transition-colors ${g === group ? "bg-panel font-semibold text-fg shadow-sm" : "text-muted hover:text-fg"}`}
          >
            {t(`protos.market.group.${g}`)}
          </button>
        ))}
      </div>
      <MarketHero key={hero.symbol} quote={hero} />
      <div className="flex shrink-0 items-center justify-between px-0.5 text-[11px] text-faint">
        <h3>{t("protos.market.watching")}</h3>
        <button
          type="button"
          data-market-sort={sort}
          onClick={() => setSort(SORTS[(SORTS.indexOf(sort) + 1) % SORTS.length])}
          className="rounded-md px-1.5 py-0.5 text-muted hover:bg-hover hover:text-fg"
        >
          {t(`protos.market.sort.${sort}`)} ⇅
        </button>
      </div>
      <ul className="shrink-0 overflow-hidden rounded-[14px] border border-edge bg-ink">
        {shown.map((quote, index) => (
          <MarketRow key={quote.symbol} quote={quote} index={index} picked={quote.symbol === hero.symbol} onPick={() => setPicked(quote.symbol)} />
        ))}
      </ul>
      <p className="mt-auto pb-1 text-center text-[10px] text-faint">
        {t("protos.market.source")}
        {view.fetched_at > 0 && ` · ${t("weather.updated", { time: fetchedClock(view.fetched_at) })}`}
        {` · ${t("protos.market.delay")}`}
      </p>
    </div>
  );
}
