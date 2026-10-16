import { api, type SteamRow } from "../lib/api";
import { steamUrl } from "../lib/steam";
import { t } from "../i18n";

/** One game: the title opens its store page; the review, the discount badge and the price sit on the right. */
export default function SteamRowItem({ row }: { row: SteamRow }) {
  return (
    <li data-steam={row.appid}>
      <button
        type="button"
        onClick={() => void api.openLink(steamUrl(row.appid)).catch(() => {})}
        title={t("steam.row.open", { name: row.name })}
        className="canto-hit flex w-full items-baseline gap-2 rounded-lg border border-edge bg-ink/60 px-2.5 py-1.5 text-left hover:bg-hover active:bg-active"
      >
        <span className="min-w-0 flex-1 truncate text-sm text-fg">{row.name}</span>
        {row.review !== null && (
          <span
            className="shrink-0 text-[11px] text-faint"
            title={row.review_label || t("steam.row.review", { n: row.review })}
          >
            {row.review}%
          </span>
        )}
        {row.discount > 0 && (
          <span
            title={t("steam.row.discount", { n: row.discount })}
            className="shrink-0 rounded bg-accent/15 px-1.5 text-[11px] font-semibold text-accent-text"
          >
            -{row.discount}%
          </span>
        )}
        <span className="shrink-0 text-xs text-muted">
          {row.original && <s className="mr-1 text-faint">{row.original}</s>}
          {row.price}
        </span>
      </button>
    </li>
  );
}
