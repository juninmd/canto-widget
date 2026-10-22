import { api, type SteamRow } from "../lib/api";
import { count, gameTitle, money, reviewLabelKey, reviewTone, steamUrl } from "../lib/steam";
import { t } from "../i18n";
import SteamThumb from "./SteamThumb";

const TONE = { good: "text-accent-text", mixed: "text-warn", bad: "text-danger", "": "text-faint" };

/** One game: capsule, title, how the reviews read, and what it costs — with what the discount saves. */
export default function SteamRowItem({ row, rank, currency }: { row: SteamRow; rank?: number; currency: string }) {
  const reviews = count(row.review_count);
  const label = reviewLabelKey(row.review_key);
  const title = gameTitle(row);
  return (
    <li data-steam={row.appid}>
      <button
        type="button"
        onClick={() => void api.openLink(steamUrl(row.appid)).catch(() => {})}
        title={t("steam.row.open", { name: title })}
        className="canto-hit group flex w-full items-center gap-2 rounded-lg border border-edge bg-ink/60 p-1.5 text-left hover:bg-hover active:bg-active"
      >
        <SteamThumb art={row.art} name={title} />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex items-baseline gap-1.5">
            {rank !== undefined && <span className="shrink-0 text-[11px] text-faint">#{rank}</span>}
            <span className="min-w-0 flex-1 truncate text-sm text-fg">{title}</span>
            {row.discount > 0 && (
              <span
                title={t("steam.row.discount", { n: row.discount })}
                className="canto-pop shrink-0 rounded bg-accent/15 px-1.5 text-[11px] font-semibold text-accent-text"
              >
                -{row.discount}%
              </span>
            )}
          </span>
          {row.review !== null && (
            <span className="flex flex-wrap items-baseline gap-x-2 text-[11px]">
              <span className={TONE[reviewTone(row.review_key)]} title={t("steam.row.review", { n: row.review })}>
                {row.review}% {label && <span className="font-medium">{t(label)}</span>}
              </span>
              {row.review_count > 0 && (
                <span className="text-faint">
                  {row.review_count === 1 ? t("steam.row.reviewOne", { n: reviews }) : t("steam.row.reviews", { n: reviews })}
                </span>
              )}
            </span>
          )}
          {row.price && (
            <span className="flex flex-wrap items-baseline gap-1.5 text-xs">
              {row.original && <s className="text-faint">{row.original}</s>}
              <span className="font-semibold text-accent-text">{row.price}</span>
              {row.saved_cents > 0 && (
                <span className="text-[11px] text-muted">{t("steam.row.saved", { value: money(row.saved_cents, currency) })}</span>
              )}
            </span>
          )}
        </span>
      </button>
    </li>
  );
}
