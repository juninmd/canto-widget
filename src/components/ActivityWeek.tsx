import { LOCALE, t } from "../i18n";
import { CATEGORY_VAR, secsLabel, weekStats } from "../lib/activity";
import type { weekSeries } from "../lib/activityView";
import ActivityTile from "./ActivityTile";

const W = 360;
const H = 170;
const PAD = { left: 28, right: 42, bottom: 28, top: 8 };
const BAR = 29;

/** The last seven days as stacked columns, oldest to newest, with the average line and a dot under each day that met the goal. */
export default function ActivityWeek({ series, goalMin }: { series: ReturnType<typeof weekSeries>; goalMin: number }) {
  const totals = series.map((d) => d.total);
  const { average, best } = weekStats(totals);
  const hoursMax = Math.max(8, Math.ceil(Math.max(...totals) / 3600 / 2) * 2);
  const y = (secs: number) => H - PAD.bottom - (secs / 3600 / hoursMax) * (H - PAD.bottom - PAD.top);
  const gap = (W - PAD.left - PAD.right - series.length * BAR) / series.length;
  const name = (ms: number) => new Date(ms).toLocaleDateString(LOCALE, { weekday: "short" });
  const hourMarks = Array.from({ length: hoursMax / 2 + 1 }, (_, i) => i * 2);
  const onGoal = series.filter((d) => d.met).length;
  return (
    <section className="rounded-2xl border border-edge bg-panel p-3.5" aria-label={t("activity.weekDays")}>
      <h3 className="mb-2.5 flex items-baseline justify-between gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
        {t("activity.weekDays")}
        <span className="text-[10.5px] font-normal normal-case tracking-normal text-faint">{t("activity.weekChartHint")}</span>
      </h3>
      <div className="mb-3 grid grid-cols-3 gap-2">
        <ActivityTile label={t("activity.statAvg")} value={secsLabel(average)} />
        <ActivityTile label={t("activity.statBest")} value={best >= 0 ? secsLabel(totals[best]) : "—"} sub={best >= 0 ? name(series[best].day) : ""} />
        <ActivityTile label={t("activity.statGoal")} value={goalMin ? t("activity.statGoalOf", { n: onGoal }) : "—"} sub={goalMin ? t("activity.statGoalSub", { goal: secsLabel(goalMin * 60) }) : t("activity.goalOff")} />
      </div>
      <svg viewBox={`0 0 ${W} ${H + 16}`} role="img" aria-label={t("activity.weekChartLabel")} className="block h-auto w-full overflow-visible">
        {hourMarks.map((h) => (
          <g key={h}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(h * 3600)} y2={y(h * 3600)} className="stroke-fg/10" />
            <text x={PAD.left - 5} y={y(h * 3600) + 3} textAnchor="end" className="fill-faint font-mono text-[9.5px]">{h}h</text>
          </g>
        ))}
        {series.map((d, i) => {
          const x = PAD.left + gap / 2 + i * (BAR + gap);
          let acc = 0;
          return (
            <g key={d.day}>
              {d.stack.map((c) => {
                const top = y(acc + c.secs);
                const height = Math.max(1, y(acc) - top - 1);
                acc += c.secs;
                return (
                  <rect key={c.category} x={x} y={top} width={BAR} height={height} rx="3" fill={CATEGORY_VAR[c.category]}>
                    <title>{`${name(d.day)} · ${t(`activity.cat.${c.category}` as const)} ${secsLabel(c.secs)} · ${secsLabel(d.total)}`}</title>
                  </rect>
                );
              })}
              <text x={x + BAR / 2} y={H - PAD.bottom + 14} textAnchor="middle" className={`font-sans text-[10.5px] ${i === series.length - 1 ? "fill-fg font-bold" : "fill-faint"}`}>{name(d.day)}</text>
              {goalMin > 0 && <circle cx={x + BAR / 2} cy={H - PAD.bottom + 24} r="3.2" strokeWidth="1.3" className={d.met ? "fill-accent stroke-accent" : "fill-none stroke-line"} />}
            </g>
          );
        })}
        {average > 0 && (
          <g>
            <line x1={PAD.left} x2={W - PAD.right + 4} y1={y(average)} y2={y(average)} strokeDasharray="4 3" strokeWidth="1.3" className="stroke-muted" />
            <text x={W - PAD.right + 7} y={y(average) + 3} className="fill-muted font-mono text-[9.5px]">{t("activity.avgLabel")}</text>
          </g>
        )}
      </svg>
    </section>
  );
}
