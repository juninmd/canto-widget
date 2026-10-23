import type { ModelRow } from "../lib/api";
import { barWidth, formatContext, formatPrice, formatReleased, formatScore, formatSpeed, type ModelSort } from "../lib/models";
import type { CSSProperties } from "react";
import { t } from "../i18n";
import CountUp from "./CountUp";
import { CheckIcon, PlusIcon } from "./Icons";
import ModelDetails from "./ModelDetails";

type Props = {
  row: ModelRow;
  rows: readonly ModelRow[];
  max: number;
  sort: ModelSort;
  index?: number;
  open: boolean;
  picked: boolean;
  onToggle: () => void;
  onPick: () => void;
};

/** One ranked model: the bar is relative to the best score on screen, the sorted metric lights up, and a tap opens its sheet. */
export default function ModelItem({ row, rows, max, sort, index = 0, open, picked, onToggle, onPick }: Props) {
  const leader = row.rank === 1;
  const top = row.rank <= 3;
  const score = formatScore(row.score);
  const on = (metric: ModelSort) => (sort === metric ? "font-semibold text-accent-text" : "");
  const sub = [row.creator, row.released && formatReleased(row.released)].filter(Boolean).join(" · ");
  const pick = picked ? t("models.compareRemove", { name: row.name }) : t("models.compareAdd", { name: row.name });
  return (
    <li
      data-model={row.id}
      data-flip={row.id}
      style={{ "--i": Math.min(index, 10) } as CSSProperties}
      className={`overflow-hidden rounded-xl border bg-panel transition-colors ${open ? "border-accent/50" : "border-edge"}`}
    >
      <div className="flex items-start">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          title={t("models.detailsTitle", { name: row.name })}
          className="canto-hit grid min-w-0 flex-1 grid-cols-[1.75rem_minmax(0,1fr)_auto] items-start gap-2.5 py-2 pr-1 pl-2.5 text-left hover:bg-hover active:bg-active"
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
              {row.open_weights && (
                <span className="shrink-0 rounded-full bg-edge/70 px-1.5 text-[9px] font-semibold tracking-wide text-muted uppercase">{t("models.weightsOpen")}</span>
              )}
            </div>
            {sub && <div className="truncate text-[10px] text-faint">{sub}</div>}
            <div aria-hidden="true" className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-edge">
              <div className={`canto-grow-x h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none ${top ? "bg-accent" : "bg-muted/60"}`} style={{ width: `${barWidth(row.score, max)}%` }} />
            </div>
            <div className="mt-1 flex flex-wrap gap-x-3 text-[10.5px] text-muted tabular-nums">
              <span className={on("price")}>{row.price === null ? t("models.noPrice") : t("models.price", { price: formatPrice(row.price) })}</span>
              {row.speed !== null && <span className={on("speed")}>{t("models.speed", { n: formatSpeed(row.speed) })}</span>}
              {row.context !== null && <span className={on("context")}>{t("models.ctx", { n: formatContext(row.context) })}</span>}
            </div>
          </div>
          <span className={`text-right text-sm font-bold tabular-nums ${sort === "intelligence" ? "text-accent-text" : "text-fg"}`} title={t("models.scoreTitle", { score })}>
            <CountUp value={row.score} format={formatScore} />
          </span>
        </button>
        <button
          type="button"
          onClick={onPick}
          aria-pressed={picked}
          aria-label={pick}
          title={pick}
          className={`canto-hit mt-2 mr-2 ml-1 grid size-7 shrink-0 place-items-center rounded-lg ${picked ? "bg-accent text-on-accent" : "text-faint hover:bg-hover hover:text-fg"}`}
        >
          {picked ? <CheckIcon /> : <PlusIcon />}
        </button>
      </div>
      {open && <ModelDetails row={row} rows={rows} picked={picked} onPick={onPick} />}
    </li>
  );
}
