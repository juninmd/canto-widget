import type { ModelRow } from "../lib/api";
import { barWidth, formatPrice, formatScore, formatSpeed } from "../lib/models";
import { t } from "../i18n";

/** One ranked model: the bar is relative to the best score on screen, not to 100. */
export default function ModelItem({ row, max }: { row: ModelRow; max: number }) {
  const top = row.rank <= 3;
  const score = formatScore(row.score);
  return (
    <li data-model={row.id} className="flex items-start gap-2 rounded-lg px-1.5 py-1.5 hover:bg-edge/40">
      <span className={`w-7 shrink-0 pt-px text-right text-[11px] tabular-nums ${top ? "font-bold text-accent" : "text-faint"}`}>
        #{row.rank}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-xs font-semibold text-fg">{row.name}</span>
          {row.badge && (
            <span className="shrink-0 rounded-full bg-accent/15 px-1.5 text-[9px] font-semibold tracking-wide text-accent uppercase">
              {t(`models.badge.${row.badge}`)}
            </span>
          )}
          <span className="ml-auto shrink-0 text-xs font-semibold tabular-nums text-fg" title={t("models.scoreTitle", { score })}>
            {score}
          </span>
        </div>
        {row.creator && <div className="truncate text-[10px] text-faint">{row.creator}</div>}
        <div aria-hidden="true" className="mt-1 h-1 overflow-hidden rounded-full bg-edge">
          <div className={`h-full rounded-full ${top ? "bg-accent" : "bg-muted/60"}`} style={{ width: `${barWidth(row.score, max)}%` }} />
        </div>
        <div className="mt-0.5 flex gap-2 text-[10px] text-muted tabular-nums">
          <span>{row.price === null ? t("models.noPrice") : t("models.price", { price: formatPrice(row.price) })}</span>
          {row.speed !== null && <span>{t("models.speed", { n: formatSpeed(row.speed) })}</span>}
        </div>
      </div>
    </li>
  );
}
