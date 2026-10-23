import { useCallback, useState } from "react";
import { api, type PlayFilter } from "../lib/api";
import { count, playtime } from "../lib/steam";
import { useSteamView } from "../lib/useSteamView";
import { t } from "../i18n";
import ErrorBanner from "./ErrorBanner";
import Skeleton from "./Skeleton";
import SteamChips from "./SteamChips";
import SteamHero from "./SteamHero";
import SteamPager from "./SteamPager";
import SteamPlayItem, { type PlayView } from "./SteamPlayItem";
import SteamViewSwitch from "./SteamViewSwitch";

const VIEW_KEY = "canto.steam.view";

function savedView(): PlayView {
  try {
    const v = localStorage.getItem(VIEW_KEY);
    return v === "list" || v === "grid" ? v : "cards";
  } catch {
    return "cards";
  }
}

/** "Jogue agora": the last game big on top, then every game the player can reach, in pages, as a
 *  list, cards or a grid of covers. The library needs the key; the installed games never do. */
export default function SteamPlay({ onError }: { onError: (m: string) => void }) {
  const [filter, setFilter] = useState<PlayFilter>("all");
  const [typed, setTyped] = useState("");
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(0);
  const [view, setView] = useState<PlayView>(savedView);

  const load = useCallback((force: boolean) => api.steamPlay(filter, term, page, force), [filter, term, page]);
  const { data, error, busy, run } = useSteamView(load);

  function chooseView(next: PlayView) {
    setView(next);
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {
      // A blocked storage only forgets the choice.
    }
  }

  if (!data) {
    return error ? <ErrorBanner message={error} onRetry={() => void run(true)} busy={busy} /> : <Skeleton label={t("steam.loading")} rows={5} />;
  }

  const max = Math.max(0, ...data.items.map((g) => g.total_min));
  const listClass =
    view === "grid" ? "grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] content-start gap-2" : view === "cards" ? "grid gap-2 sm:grid-cols-2" : "space-y-1.5";
  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {data.hero && <SteamHero game={data.hero} onError={onError} />}
        <div className="flex flex-wrap items-center gap-1.5">
          <SteamChips
            label={t("steam.play.filter")}
            value={filter}
            onChange={(f) => {
              setFilter(f);
              setPage(0);
            }}
            options={[
              { key: "all", label: t("steam.play.filter.all"), count: data.counts.all },
              { key: "recent", label: t("steam.play.filter.recent"), count: data.counts.recent },
              { key: "installed", label: t("steam.play.filter.installed"), count: data.counts.installed },
            ]}
          />
          <SteamViewSwitch value={view} onChange={chooseView} />
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setTerm(typed);
            setPage(0);
          }}
          className="flex gap-1"
        >
          <input
            data-testid="steam-play-search"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={t("steam.play.search")}
            aria-label={t("steam.play.search")}
            className="canto-field min-w-0 flex-1 px-2 py-1 text-xs"
          />
          <button
            type="button"
            onClick={() => void run(true)}
            disabled={busy}
            className="canto-hit min-h-7 shrink-0 rounded-lg border border-edge px-2 text-xs text-muted hover:bg-hover hover:text-fg disabled:opacity-50"
          >
            {t("steam.refresh")}
          </button>
        </form>
        <p className="flex justify-between gap-2 text-[11px] text-muted tabular-nums">
          <span>{t("steam.play.summary", { n: count(data.total), time: playtime(data.minutes) })}</span>
          {data.pages > 1 && <span>{t("steam.pager.of", { n: page + 1, total: data.pages })}</span>}
        </p>
        {!data.has_key && <p className="text-[11px] text-faint">{t("steam.play.noKey")}</p>}
        {error && <ErrorBanner message={error} onRetry={() => void run(true)} busy={busy} />}
        {data.items.length === 0 ? (
          <p className="text-xs text-faint">{t("steam.play.empty")}</p>
        ) : (
          <ul key={`${view}:${filter}:${page}:${term}`} className={`steam-swap ${listClass}`}>
            {data.items.map((game, i) => (
              <SteamPlayItem key={game.appid} game={game} view={view} index={i} maxMinutes={max} onError={onError} />
            ))}
          </ul>
        )}
      </div>
      <SteamPager page={page} pages={data.pages} onPage={setPage} />
    </div>
  );
}
