import { useCallback, useEffect, useState } from "react";
import { errText, type SteamList } from "../lib/api";
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
  /** Shown under the list when the source has more rows than it returned. */
  more?: string;
  rows?: number;
};

/** The shape shared by "ofertas", "em alta" and "catálogo": fetch, refresh, banner and the row list. */
export default function SteamGames({ load, empty, toolbar, more, rows = 8 }: Props) {
  const [list, setList] = useState<SteamList | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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

  useEffect(() => {
    void run(false);
  }, [run]);
  // The tab-level refresh (palette, back online) must reload the list on screen, not just the account.
  useRefreshEvent("steam", () => void run(true));

  if (!list) {
    return error ? <ErrorBanner message={error} onRetry={() => void run(true)} busy={busy} /> : <Skeleton label={t("steam.loading")} rows={rows} />;
  }

  return (
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
      {list.items.length === 0 ? (
        <p className="text-xs text-faint">{empty}</p>
      ) : (
        <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
          {list.items.map((row) => (
            <SteamRowItem key={row.appid} row={row} />
          ))}
        </ul>
      )}
      {list.has_more && more && <p className="text-[11px] text-faint">{more}</p>}
    </div>
  );
}
