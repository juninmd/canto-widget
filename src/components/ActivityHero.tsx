import { t } from "../i18n";
import { byCategory, CATEGORY_COLOR, CATEGORY_VAR, secsLabel, type Category } from "../lib/activity";
import { donutArcs, type Apps } from "../lib/activityView";

const R = 52;
const CIRC = 2 * Math.PI * R;
const sum = (apps: Apps) => apps.reduce((s, a) => s + a.secs, 0);
const catLabel = (c: Category) => t(`activity.cat.${c}` as const);

/** The day at a glance: a donut by category with the total inside, the legend that filters, and the change against the day before. */
export default function ActivityHero({ all, shown, hidden, onToggle, reference, idleSecs }: {
  all: Apps;
  shown: Apps;
  hidden: ReadonlySet<Category>;
  onToggle: (c: Category) => void;
  reference: number | null;
  idleSecs: number;
}) {
  const total = sum(shown);
  const allTotal = sum(all);
  const arcs = total ? donutArcs(byCategory(shown), CIRC) : [];
  const diff = reference === null ? null : total - reference;
  return (
    <section className="@container/hero rounded-2xl border border-edge bg-panel p-3.5">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3.5">
        <div className="relative h-32 w-32 shrink-0 @max-[340px]/hero:h-[104px] @max-[340px]/hero:w-[104px]">
          <svg viewBox="0 0 128 128" role="img" aria-label={t("activity.chartLabel")} className="h-full w-full -rotate-90">
            <circle cx="64" cy="64" r={R} fill="none" strokeWidth="14" className="stroke-edge" />
            {arcs.map((a) => (
              <circle
                key={a.category}
                cx="64"
                cy="64"
                r={R}
                fill="none"
                strokeWidth="14"
                stroke={CATEGORY_VAR[a.category]}
                strokeDasharray={`${a.dash} ${CIRC}`}
                strokeDashoffset={-a.offset}
                className="ease-out motion-safe:transition-[stroke-dasharray,stroke-dashoffset] motion-safe:duration-500"
              >
                <title>{`${catLabel(a.category)} ${secsLabel(a.secs)}`}</title>
              </circle>
            ))}
          </svg>
          <div className="absolute inset-0 grid place-content-center text-center">
            <b className="font-mono text-[1.45rem] font-bold leading-none tabular-nums text-fg @max-[340px]/hero:text-xl">{total ? secsLabel(total) : "0"}</b>
            <span className="mt-1 text-[10.5px] text-faint">{t("activity.activeWord")}</span>
          </div>
        </div>
        <div role="group" aria-label={t("activity.legendLabel")} className="flex min-w-0 flex-col gap-px">
          {byCategory(all).map((c) => {
            const on = !hidden.has(c.category);
            return (
              <button
                key={c.category}
                type="button"
                aria-pressed={on}
                onClick={() => onToggle(c.category)}
                className={`canto-hit grid min-h-[24px] grid-cols-[0.625rem_minmax(0,1fr)_auto_auto] items-center gap-2 rounded-lg px-1.5 text-left text-xs hover:bg-hover active:bg-active @max-[340px]/hero:gap-1.5 @max-[340px]/hero:text-[11.5px] ${on ? "" : "opacity-45"}`}
              >
                <span className={`h-2.5 w-2.5 rounded-[3px] ${CATEGORY_COLOR[c.category]}`} />
                <span className={`truncate ${on ? "text-fg" : "text-muted line-through"}`}>{catLabel(c.category)}</span>
                <span className="font-mono tabular-nums text-muted">{secsLabel(c.secs)}</span>
                <span className="w-9 text-right font-mono text-[11px] tabular-nums text-faint @max-[340px]/hero:hidden">{Math.round((c.secs / allTotal) * 100)}%</span>
              </button>
            );
          })}
        </div>
      </div>
      {((diff !== null && Math.abs(diff) >= 60) || idleSecs > 0) && (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-edge pt-2.5 text-xs">
          {diff !== null && Math.abs(diff) >= 60 && (
            <span className={diff > 0 ? "text-ok" : "text-warn"}>
              {diff > 0 ? "▲ " : "▼ "}
              {t(diff > 0 ? "activity.vsYesterday" : "activity.vsYesterdayLess", { time: secsLabel(Math.abs(diff)) })}
            </span>
          )}
          {idleSecs > 0 && <span className="rounded-full bg-hover px-2 py-0.5 text-[11.5px] text-muted">{t("activity.idleTotal", { time: secsLabel(idleSecs) })}</span>}
        </div>
      )}
    </section>
  );
}
