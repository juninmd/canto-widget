import { type CSSProperties, useCallback, useState } from "react";
import { api, type TopGame } from "../lib/api";
import { count, gameTitle, steamUrl } from "../lib/steam";
import { useSteamView } from "../lib/useSteamView";
import { t } from "../i18n";
import ErrorBanner from "./ErrorBanner";
import Skeleton from "./Skeleton";
import SteamArt from "./SteamArt";
import SteamCountUp from "./SteamCountUp";
import SteamPager from "./SteamPager";

function Row({ game, index, max }: { game: TopGame; index: number; max: number }) {
  const title = gameTitle(game);
  const medal = game.rank <= 3 ? `steam-medal-${game.rank} text-[15px]` : "text-faint text-[13px]";
  return (
    <li data-steam={game.appid} style={{ "--i": index } as CSSProperties} className="steam-rise">
      <button
        type="button"
        onClick={() => void api.openLink(steamUrl(game.appid)).catch(() => {})}
        title={t("steam.row.open", { name: title })}
        className="canto-hit group relative flex w-full items-center gap-2.5 overflow-hidden rounded-xl border border-edge bg-ink/60 py-1.5 pl-1 pr-2 text-left transition hover:translate-x-0.5 hover:border-line"
      >
        <span aria-hidden="true" className="steam-fill absolute inset-y-0 left-0" style={{ "--i": index, width: `${(game.players / max) * 100}%` } as CSSProperties} />
        <span className={`relative w-6 shrink-0 text-center font-extrabold tabular-nums ${medal}`}>{game.rank}</span>
        <SteamArt art={game.art} name={title} className="relative aspect-[460/215] w-20 shrink-0 rounded-md" />
        <span className="relative flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-[13px] font-semibold text-fg">{title}</span>
          <span className="flex items-center gap-1.5 text-[10px]">
            {game.mine && <span className="rounded bg-[#66c0f4]/15 px-1.5 font-bold uppercase tracking-wide text-[#66c0f4]">{t("steam.top.owned")}</span>}
            {game.moved > 0 && <span className="font-bold text-accent-text">▲ {t("steam.top.up", { n: game.moved })}</span>}
            {game.moved < 0 && <span className="font-bold text-danger">▼ {t("steam.top.down", { n: -game.moved })}</span>}
          </span>
        </span>
        <span className="relative flex shrink-0 flex-col items-end">
          <span className="flex items-center gap-1 text-[13px] font-extrabold tabular-nums text-fg" title={t("steam.top.players", { n: count(game.players) })}>
            <span className="steam-dot-live size-1.5 rounded-full bg-red-500" />
            {count(game.players)}
          </span>
          <span className="text-[10px] text-faint tabular-nums">{t("steam.top.peak", { n: count(game.peak) })}</span>
        </span>
      </button>
    </li>
  );
}

/** "Mais jogados": Steam's chart of the games with the most people in them right now, with today's
 *  peak and how each moved since the last look; "só os meus" keeps the games the player has. */
export default function SteamTop() {
  const [page, setPage] = useState(0);
  const [mine, setMine] = useState(false);
  const load = useCallback((force: boolean) => api.steamTop(page, mine, force), [page, mine]);
  const { data, error, busy, run } = useSteamView(load);

  if (!data) {
    return error ? <ErrorBanner message={error} onRetry={() => void run(true)} busy={busy} /> : <Skeleton label={t("steam.loading")} rows={6} />;
  }
  const max = Math.max(1, ...data.items.map((g) => g.players));
  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="steam-live flex shrink-0 items-center gap-2 rounded-xl border border-edge px-3 py-2">
        <span className="steam-dot-live size-2 shrink-0 rounded-full bg-red-500" />
        <span className="min-w-0 flex-1">
          <span className="block text-xl font-extrabold tracking-tight tabular-nums text-fg">
            <SteamCountUp value={data.players} />
          </span>
          <span className="block text-[10.5px] text-faint">{t("steam.top.now")}</span>
        </span>
        <button
          type="button"
          aria-pressed={mine}
          onClick={() => {
            setMine((m) => !m);
            setPage(0);
          }}
          className={`canto-hit shrink-0 rounded-full border px-2.5 text-[11px] transition-colors ${mine ? "border-accent bg-accent font-semibold text-on-accent" : "border-edge bg-ink text-muted hover:text-fg"}`}
        >
          {t("steam.top.mine")}
        </button>
        <button
          type="button"
          onClick={() => void run(true)}
          disabled={busy}
          className="canto-hit min-h-7 shrink-0 rounded-lg border border-edge px-2 text-xs text-muted hover:bg-hover hover:text-fg disabled:opacity-50"
        >
          {t("steam.refresh")}
        </button>
      </div>
      {error && <ErrorBanner message={error} onRetry={() => void run(true)} busy={busy} />}
      {data.items.length === 0 ? (
        <p className="text-xs text-faint">{t("steam.top.empty")}</p>
      ) : (
        <ul key={`${page}:${mine}`} className="steam-swap min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
          {data.items.map((game, i) => (
            <Row key={game.appid} game={game} index={i} max={max} />
          ))}
        </ul>
      )}
      <SteamPager page={page} pages={data.pages} onPage={setPage} />
    </div>
  );
}
