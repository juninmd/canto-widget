import type { CSSProperties } from "react";
import { api, type PlayGame } from "../lib/api";
import { ago, diskSize, playtime, steamUrl } from "../lib/steam";
import { t } from "../i18n";
import { PlayIcon } from "./Icons";
import SteamArt from "./SteamArt";

export type PlayView = "list" | "cards" | "grid";

function Tags({ game, dots = false }: { game: PlayGame; dots?: boolean }) {
  const tags = [
    game.recent_min > 0 && { key: "recent", label: t("steam.play.recent"), tone: "bg-accent/15 text-accent-text", dot: "bg-accent" },
    game.installed && { key: "inst", label: t("steam.play.installed"), tone: "bg-[#66c0f4]/15 text-[#66c0f4]", dot: "bg-[#66c0f4]" },
  ].filter(Boolean) as { key: string; label: string; tone: string; dot: string }[];
  if (dots) {
    return (
      <span className="flex gap-1">
        {tags.map((tag) => (
          <span key={tag.key} title={tag.label} className={`size-2 rounded-full ring-2 ring-black/40 ${tag.dot}`} />
        ))}
      </span>
    );
  }
  return (
    <>
      {tags.map((tag) => (
        <span key={tag.key} className={`shrink-0 rounded px-1.5 text-[9.5px] font-bold uppercase tracking-wide ${tag.tone}`}>
          {tag.label}
        </span>
      ))}
    </>
  );
}

/** One game in the chosen view: a row with the header beside it, a card with the header across, or
 *  a vertical cover in the grid. Clicking opens the store; the Play button launches through Steam. */
export default function SteamPlayItem({
  game,
  view,
  index,
  maxMinutes,
  onError,
}: {
  game: PlayGame;
  view: PlayView;
  index: number;
  maxMinutes: number;
  onError: (m: string) => void;
}) {
  const open = () => void api.openLink(steamUrl(game.appid)).catch(() => {});
  const launch = () => void api.steamLaunch(game.appid).catch((e) => onError(String(e)));
  const style = { "--i": index } as CSSProperties;
  const when = game.last_played > 0 ? ago(game.last_played) : t("steam.play.never");
  const share = maxMinutes > 0 ? Math.max(4, (game.total_min / maxMinutes) * 100) : 0;
  const bar = (
    <span className="block h-[3px] overflow-hidden rounded bg-edge">
      <span className="steam-bar block h-full rounded" style={{ ...style, width: `${share}%` }} />
    </span>
  );
  const play = (extra: string) => (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        launch();
      }}
      aria-label={t("steam.play.launchName", { name: game.name })}
      title={t("steam.play.launch")}
      className={`canto-hit grid shrink-0 place-items-center rounded-lg transition ${extra}`}
    >
      <PlayIcon />
    </button>
  );

  if (view === "grid") {
    return (
      <li data-steam={game.appid} style={style} className="steam-tile group relative min-w-0">
        <button type="button" onClick={open} title={t("steam.row.open", { name: game.name })} className="canto-hit block w-full min-w-0 text-left">
          <SteamArt art={game.cover} name={game.name} className="steam-lift aspect-[2/3] w-full rounded-xl border border-edge" />
          <span className="mt-1 block truncate text-[11px] font-semibold text-fg">{game.name}</span>
          <span className="block truncate text-[10px] text-faint tabular-nums">
            {playtime(game.total_min)} · {when}
          </span>
        </button>
        <span className="absolute left-1.5 top-1.5">
          <Tags game={game} dots />
        </span>
        {play("absolute left-1/2 top-[30%] size-9 -translate-x-1/2 rounded-full bg-accent text-on-accent opacity-0 shadow-lg group-hover:opacity-100 focus-visible:opacity-100")}
      </li>
    );
  }

  if (view === "cards") {
    return (
      <li data-steam={game.appid} style={style} className="steam-rise group relative">
        <button
          type="button"
          onClick={open}
          title={t("steam.row.open", { name: game.name })}
          className="steam-lift canto-hit relative block w-full overflow-hidden rounded-2xl border border-edge text-left"
        >
          <SteamArt art={game.art} name={game.name} className="aspect-[460/215] w-full" />
          <span className="steam-card-shade absolute inset-x-0 bottom-0 flex flex-col gap-0.5 px-3 pb-2.5 pt-7 pr-24 text-white">
            <span className="truncate text-sm font-bold">{game.name}</span>
            <span className="truncate text-[11px] text-white/75 tabular-nums">
              {t("steam.play.total", { time: playtime(game.total_min) })} · {when}
            </span>
            {bar}
          </span>
          <span className="absolute left-2 top-2 flex gap-1">
            <Tags game={game} />
          </span>
        </button>
        <button
          type="button"
          onClick={launch}
          aria-label={t("steam.play.launchName", { name: game.name })}
          className="canto-hit absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1.5 text-xs font-bold text-on-accent opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
        >
          <PlayIcon />
          {t("steam.play.launch")}
        </button>
      </li>
    );
  }

  return (
    <li data-steam={game.appid} style={style} className="steam-rise group relative">
      <button
        type="button"
        onClick={open}
        title={t("steam.row.open", { name: game.name })}
        className="canto-hit flex w-full items-center gap-2.5 rounded-xl border border-edge bg-ink/60 p-1.5 pr-11 text-left transition hover:translate-x-0.5 hover:border-line hover:bg-hover"
      >
        <SteamArt art={game.art} name={game.name} className="aspect-[460/215] w-32 shrink-0 rounded-lg" />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-semibold text-fg">{game.name}</span>
          <span className="truncate text-[11px] text-faint tabular-nums">
            {playtime(game.total_min)} · {when}
            {game.installed && game.size_bytes > 0 && <> · {t("steam.play.size", { size: diskSize(game.size_bytes) })}</>}
          </span>
          <span className="flex gap-1">
            <Tags game={game} />
          </span>
          {bar}
        </span>
      </button>
      {play("absolute right-2 top-1/2 size-7 -translate-y-1/2 bg-accent/15 text-accent-text opacity-0 group-hover:opacity-100 focus-visible:opacity-100")}
    </li>
  );
}
