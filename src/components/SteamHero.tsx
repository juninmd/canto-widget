import { api, type PlayGame } from "../lib/api";
import { ago, playtime } from "../lib/steam";
import { t } from "../i18n";
import { PlayIcon } from "./Icons";
import SteamArt from "./SteamArt";

/** The last game played, big: its art drifting slowly behind, the playtime and the Play button. */
export default function SteamHero({ game, onError }: { game: PlayGame; onError: (m: string) => void }) {
  const when = game.last_played > 0 ? t("steam.play.played", { when: ago(game.last_played) }) : t("steam.play.never");
  return (
    <div data-steam-hero={game.appid} className="steam-rise relative isolate h-32 shrink-0 overflow-hidden rounded-2xl border border-edge">
      <SteamArt art={game.art} name={game.name} className="steam-kenburns absolute inset-0 -z-20 h-full w-full" />
      <span aria-hidden="true" className="steam-hero-shade absolute inset-0 -z-10" />
      <div className="absolute bottom-3 left-3.5 right-28 text-white">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#66c0f4]">
          <span className="size-1.5 rounded-full bg-[#66c0f4] shadow-[0_0_6px_#66c0f4]" />
          {when}
        </p>
        <h3 className="mt-0.5 truncate text-lg font-extrabold tracking-tight [text-shadow:0_2px_12px_rgb(0_0_0/0.6)]">{game.name}</h3>
        <p className="line-clamp-1 text-[11px] text-white/80">{t("steam.play.total", { time: playtime(game.total_min) })}</p>
        {game.recent_min > 0 && (
          <p className="line-clamp-1 text-[11px] text-white/70">{t("steam.play.twoWeeks", { time: playtime(game.recent_min) })}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => void api.steamLaunch(game.appid).catch((e) => onError(String(e)))}
        aria-label={t("steam.play.launchName", { name: game.name })}
        className="steam-breathe canto-hit absolute bottom-3 right-3 flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-sm font-bold text-on-accent transition-transform hover:scale-105 active:scale-95"
      >
        <PlayIcon />
        {t("steam.play.launch")}
      </button>
    </div>
  );
}
