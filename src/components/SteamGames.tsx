import { useCallback, useEffect, useState } from "react";
import { errText, type SteamList } from "../lib/api";
import { mergeGames, money } from "../lib/steam";
import { useRefreshEvent } from "../lib/useRefreshEvent";
import { t } from "../i18n";
import ErrorBanner from "./ErrorBanner";
import Skeleton from "./Skeleton";
import SteamRowItem from "./SteamRowItem";

type Props = {
  /** Must keep its identity between renders: a new one refetches. */
  load: (force: boolean) => Promise<SteamList>;
  empty: string;
  /** Rendered above the list, like the catalog's search box. */
  toolbar?: React.ReactNode;
  /** Numbers the rows: only the "em alta" list is a ranking. */
  numbered?: boolean;
  /** Adds up what the discounts save: only meaningful on a wishlist. */
  totalSaved?: boolean;
  /** Fetches the next page and appends it, for a list the store pages. */
  loadMore?: () => Promise<SteamList>;
  rows?: number;
};

/** The shape shared by "ofertas", "em alta" and "catálogo": fetch, refresh, banner and the row list. */
export default function SteamGames({
  load,
  empty,
  toolbar,
  numbered = false,
  totalSaved = false,
  loadMore,
  rows = 8,
}: Props) {
  const [list, setList] = useState<SteamList | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const run = useCallback(
    async (force: boolean) => {
      setBusy(true);
      try {
        setList(await load(force));
        setError("");
      } catch (e) {
        setError(errText(e));
      } finally {
        setBusy(false);
      }
    },
    [load],
  );

  async function loadAnother() {
    if (!loadMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const next = await loadMore();
      setList((prev) =>
        prev ? { items: mergeGames(prev.items, next.items), has_more: next.has_more, currency: next.currency } : next,
      );
      setError("");
    } catch (e) {
      setError(errText(e));
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    void run(false);
  }, [run]);
  // The tab-level refresh (palette, back online) must reload the list on screen, not just the account.
  useRefreshEvent("steam", () => void run(true));

  if (!list) {
    return error ? <ErrorBanner message={error} onRetry={() => void run(true)} busy={busy} /> : <Skeleton label={t("steam.loading")} rows={rows} />;
  }

  const saved = totalSaved ? list.items.reduce((total, row) => total + row.saved_cents, 0) : 0;  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="flex items-center gap-2">
        {toolbar && <div className="min-w-0 flex-1">{toolbar}</div>}
        <button
          type="button"
          onClick={() => void run(true)}
          disabled={busy}
          className="canto-hit ml-auto min-h-7 shrink-0 rounded-lg border border-edge px-2 text-xs text-muted hover:bg-hover hover:text-fg disabled:opacity-50"
        >
          {t("steam.refresh")}
        </button>
      </div>
      {error && <ErrorBanner message={error} onRetry={() => void run(true)} busy={busy} />}
      {saved > 0 && <p className="text-[11px] text-muted">{t("steam.totalSaved", { value: money(saved, list.currency) })}</p>}
      {list.items.length === 0 ? (
        <p className="text-xs text-faint">{empty}</p>
      ) : (
        <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
          {list.items.map((row, i) => (
            <SteamRowItem key={row.appid} row={row} rank={numbered ? i + 1 : undefined} currency={list.currency} />
          ))}
        </ul>
      )}
      {loadMore && list.has_more && (
        <button
          type="button"
          onClick={() => void loadAnother()}
          disabled={loadingMore}
          className="canto-hit min-h-7 shrink-0 self-start rounded-lg border border-edge px-2 text-xs text-muted hover:bg-hover hover:text-fg disabled:opacity-50"
        >
          {t("steam.loadMore")}
        </button>
      )}
    </div>
  );
}
