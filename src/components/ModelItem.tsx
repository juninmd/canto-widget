import { api, type ModelRow } from "../lib/api";
import { barWidth, formatPrice, formatScore, formatSpeed, modelUrl, type ModelSort } from "../lib/models";
import type { CSSProperties } from "react";
import { t } from "../i18n";
import CountUp from "./CountUp";

/** One ranked model: the bar is relative to the best score on screen, not to 100; the metric being sorted by is the one that lights up. */
export default function ModelItem({ row, max, sort, index = 0 }: { row: ModelRow; max: number; sort: ModelSort; index?: number }) {
  const leader = row.rank === 1;
  const top = row.rank <= 3;
  const score = formatScore(row.score);
  const on = (metric: ModelSort) => (sort === metric ? "font-semibold text-accent-text" : "");
  return (
    <li data-model={row.id} data-flip={row.id} style={{ "--i": Math.min(index, 10) } as CSSProperties}>
      <button
        type="button"
        onClick={() => void api.openLink(modelUrl(row.id))}
        title={t("models.openTitle", { name: row.name })}
        className="canto-hit grid w-full grid-cols-[1.75rem_minmax(0,1fr)_auto] items-start gap-2.5 rounded-xl border border-edge bg-panel px-2.5 py-2 text-left hover:bg-hover active:bg-active"
      >
        <span
          title={t("uima.rankTitle", { n: row.rank })}
          className={`grid size-7 place-items-center rounded-lg text-xs font-bold tabular-nums ${leader ? "bg-accent text-on-accent" : top ? "bg-accent/15 text-accent-text" : "bg-edge/70 text-faint"}`}
        >
          {row.rank}
        </span>
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-xs font-semibold text-fg">{row.name}</span>
            {row.badge && (
              <span className="shrink-0 rounded-full bg-accent/15 px-1.5 text-[9px] font-semibold tracking-wide text-accent-text uppercase">
                {t(`models.badge.${row.badge}`)}
              </span>
            )}
          </div>
          {row.creator && <div className="truncate text-[10px] text-faint">{row.creator}</div>}
          <div aria-hidden="true" className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-edge">
            <div className={`canto-grow-x h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none ${top ? "bg-accent" : "bg-muted/60"}`} style={{ width: `${barWidth(row.score, max)}%` }} />
          </div>
          <div className="mt-1 flex flex-wrap gap-x-3 text-[10.5px] text-muted tabular-nums">
            <span className={on("price")}>{row.price === null ? t("models.noPrice") : t("models.price", { price: formatPrice(row.price) })}</span>
            {row.speed !== null && <span className={on("speed")}>{t("models.speed", { n: formatSpeed(row.speed) })}</span>}
          </div>
        </div>
        <span className={`text-right text-sm font-bold tabular-nums ${sort === "intelligence" ? "text-accent-text" : "text-fg"}`} title={t("models.scoreTitle", { score })}>
          <CountUp value={row.score} format={formatScore} />
        </span>
      </button>
    </li>
  );
}
