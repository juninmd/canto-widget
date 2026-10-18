import { useCallback, useEffect, useState } from "react";
import { api, errText, type MarketView } from "../lib/api";
import { clockLabel } from "../lib/clockLabel";
import { price, signedPercent } from "../lib/market";
import { t } from "../i18n";
import ErrorBanner from "./ErrorBanner";
import Skeleton from "./Skeleton";

const LINK = "canto-hit min-h-[24px] shrink-0 rounded-md px-1.5 hover:bg-hover hover:text-fg active:bg-active";

/** Keyless quotes: the Central Bank's daily rates, bitcoin and the world's main indexes, cached for 15 min. */
export default function MarketTab() {
  const [view, setView] = useState<MarketView | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  if (view === null) {
    return error ? <ErrorBanner message={error} onRetry={() => void load(true)} /> : <Skeleton label={t("common.refreshing")} rows={6} />;
  }

  const problem = view.error;
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between gap-2 text-[11px] text-faint">
        <span className="min-w-0 truncate font-medium text-muted">{t("market.quotes")}</span>
        <span className="flex shrink-0 items-center gap-3">
          {view.fetched_at > 0 && <span>{t("common.updatedAt", { time: clockLabel(view.fetched_at) })}</span>}
          <button type="button" onClick={() => void load(true)} disabled={loading} className={LINK}>
            {loading ? "..." : t("common.refresh")}
          </button>
        </span>
      </div>
      {problem && (
        <ErrorBanner
          message={
            view.fetched_at > 0 && view.quotes.length > 0
              ? t("common.staleFailed", { time: clockLabel(view.fetched_at), error: problem })
              : t("common.loadFailed", { error: problem })
          }
          onRetry={() => void load(true)}
          busy={loading}
        />
      )}
      {view.quotes.length === 0 ? (
        <p className="text-xs text-faint">{t("search.empty")}</p>
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto pr-1">
          {view.quotes.map((quote) => (
            <li
              key={quote.symbol}
              data-market-quote={quote.symbol}
              className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-hover"
            >
              <span className="min-w-0 flex-1 truncate text-xs text-fg">{quote.label}</span>
              <span className="shrink-0 text-xs tabular-nums text-muted">{price(quote.value, quote.decimals)}</span>
              <span
                className={`shrink-0 text-[11px] tabular-nums ${quote.change >= 0 ? "text-accent-text" : "text-danger"}`}
              >
                {t("market.change", { n: signedPercent(quote.change) })}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-auto text-[10px] text-faint">BCB · CoinGecko · CNBC</p>
    </div>
  );
}
