import { useCallback, useEffect, useState } from "react";
import { api, errText, type SteamRecent } from "../lib/api";
import { playtime, steamUrl } from "../lib/steam";
import { useRefreshEvent } from "../lib/useRefreshEvent";
import { t } from "../i18n";
import ErrorBanner from "./ErrorBanner";
import Skeleton from "./Skeleton";
import SteamThumb from "./SteamThumb";

/** The last five games played in the previous two weeks; needs the Web API key, so it says so when absent. */
export default function SteamRecent() {
  const [view, setView] = useState<SteamRecent | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const run = useCallback(async (force: boolean) => {
    setBusy(true);
    try {
      setView(await api.steamRecent(force));
      setError("");
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void run(false);
  }, [run]);
  useRefreshEvent("steam", () => void run(true));

  if (!view) {
    return error ? <ErrorBanner message={error} onRetry={() => void run(true)} busy={busy} /> : <Skeleton label={t("steam.loading")} rows={5} />;
  }

  const refresh = (
    <button
      type="button"
      onClick={() => void run(true)}
      disabled={busy}
      className="canto-hit ml-auto min-h-7 shrink-0 rounded-lg border border-edge px-2 text-xs text-muted hover:bg-hover hover:text-fg disabled:opacity-50"
    >
      {t("steam.refresh")}
    </button>
  );

  if (!view.has_key) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-faint">{t("steam.recent.noKey")}</p>
        <div className="flex">{refresh}</div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="flex items-center gap-2">{refresh}</div>
      {error && <ErrorBanner message={error} onRetry={() => void run(true)} busy={busy} />}
      {view.items.length === 0 ? (
        <p className="text-xs text-faint">{t("steam.recent.empty")}</p>
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
                  <span className="text-[11px] text-faint">
                    {t("steam.recent.recent", { time: playtime(game.recent_min) })} · {t("steam.recent.total", { time: playtime(game.total_min) })}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
