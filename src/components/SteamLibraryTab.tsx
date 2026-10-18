import { useCallback, useEffect, useRef, useState } from "react";
import { api, errText, type SteamLibrary } from "../lib/api";
import { count, playtime, steamUrl } from "../lib/steam";
import { useRefreshEvent } from "../lib/useRefreshEvent";
import { t } from "../i18n";
import ErrorBanner from "./ErrorBanner";
import Skeleton from "./Skeleton";
import SteamThumb from "./SteamThumb";

/** Every game the account owns, most played first; needs the Web API key, so it says so when absent.
 *  The list is paged by 100 in Rust, and the summary always tells how many matched and how long. */
export default function SteamLibraryTab() {
  const [typed, setTyped] = useState("");
  const [term, setTerm] = useState("");
  const [view, setView] = useState<SteamLibrary | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const page = useRef(0);

  const run = useCallback(
    async (force: boolean) => {
      page.current = 0;
      setBusy(true);
      try {
        setView(await api.steamLibrary(term, 0, force));
        setError("");
      } catch (e) {
        setError(errText(e));
      } finally {
        setBusy(false);
      }
    },
    [term],
  );

  async function loadMore() {
    if (loadingMore || !view) return;
    setLoadingMore(true);
    try {
      const next = page.current + 1;
      const list = await api.steamLibrary(term, next, false);
      page.current = next;
      const seen = new Set(view.items.map((game) => game.appid));
      setView({ ...list, items: [...view.items, ...list.items.filter((game) => !seen.has(game.appid))] });
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
  useRefreshEvent("steam", () => void run(true));

  if (!view) {
    return error ? <ErrorBanner message={error} onRetry={() => void run(true)} busy={busy} /> : <Skeleton label={t("steam.loading")} rows={6} />;
  }

  const refresh = (
    <button
      type="button"
      onClick={() => void run(true)}
      disabled={busy}
      className="canto-hit shrink-0 rounded-lg border border-edge px-2 text-xs text-muted hover:bg-hover hover:text-fg disabled:opacity-50"
    >
      {t("steam.refresh")}
    </button>
  );

  if (!view.has_key) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-faint">{t("steam.library.noKey")}</p>
        <div className="flex">{refresh}</div>
      </div>
    );
  }

  const shown = view.items.length;
  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setTerm(typed);
        }}
        className="flex gap-1"
      >
        <input
          data-testid="steam-library-search"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={t("steam.catalog.placeholder")}
          aria-label={t("steam.library.search")}
          className="canto-field min-w-0 flex-1 px-2 py-1 text-xs"
        />
        <button
          type="submit"
          className="canto-hit min-h-7 shrink-0 rounded-lg border border-edge px-2 text-xs text-muted hover:bg-hover hover:text-fg"
        >
          {t("steam.library.search")}
        </button>
        {refresh}
      </form>
      <p className="text-[11px] text-muted">
        {shown < view.total
          ? t("steam.library.showing", { shown: count(shown), n: count(view.total), time: playtime(view.minutes) })
          : t("steam.library.summary", { n: count(view.total), time: playtime(view.minutes) })}
      </p>
      {error && <ErrorBanner message={error} onRetry={() => void run(true)} busy={busy} />}
      {view.items.length === 0 ? (
        <p className="text-xs text-faint">{t("steam.library.empty")}</p>
      ) : (
        <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
          {view.items.map((game) => (
            <li key={game.appid} data-steam={game.appid}>
              <button
                type="button"
                onClick={() => void api.openLink(steamUrl(game.appid)).catch(() => {})}
                title={t("steam.row.open", { name: game.name })}
                className="canto-hit flex w-full items-center gap-2 rounded-lg border border-edge bg-ink/60 p-1.5 text-left hover:bg-hover active:bg-active"
              >
                <SteamThumb art={game.art} name={game.name} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm text-fg">{game.name}</span>
                  <span className="text-[11px] text-faint">{t("steam.recent.total", { time: playtime(game.total_min) })}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {shown < view.total && (
        <button
          type="button"
          onClick={() => void loadMore()}
          disabled={loadingMore}
          className="canto-hit min-h-7 shrink-0 self-start rounded-lg border border-edge px-2 text-xs text-muted hover:bg-hover hover:text-fg disabled:opacity-50"
        >
          {t("steam.loadMore")}
        </button>
      )}
    </div>
  );
}
