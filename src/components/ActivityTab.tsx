import { useCallback, useEffect, useState } from "react";
import { t } from "../i18n";
import { api, errText, type ActivityStatus, type ActivitySummary } from "../lib/api";
import { byCategory, categoryOf, CATEGORY_COLOR, barBox, hourRange, secsLabel, timelineRows, type Category } from "../lib/activity";
import { dayStart } from "../lib/summary";
import Skeleton from "./Skeleton";

const DAY_MS = 86_400_000;
const REFRESH_MS = 60_000;

type Period = "today" | "week";
type Loaded = { today: ActivitySummary; week: { day: number; apps: ActivitySummary["apps"] }[] };

const catLabel = (c: Category) => t(`activity.cat.${c}` as const);

/** Where the time went, from the focused-application log Rust keeps once the user opts in. */
export default function ActivityTab({ today, onError }: { today: string; onError: (m: string) => void }) {
  const [status, setStatus] = useState<ActivityStatus | null>(null);
  const [period, setPeriod] = useState<Period>("today");
  const [data, setData] = useState<Loaded | null>(null);
  const start = dayStart(today);

  const load = useCallback(async () => {
    try {
      const st = await api.activityStatus();
      setStatus(st);
      if (!st.enabled) return;
      const days = [0, 1, 2, 3, 4, 5, 6].map((i) => start - i * DAY_MS);
      const [todaySummary, ...rest] = await Promise.all(days.map((d) => api.activitySummary(d, d + DAY_MS)));
      setData({ today: todaySummary, week: [todaySummary, ...rest].map((s, i) => ({ day: days[i], apps: s.apps })) });
    } catch (e) {
      onError(errText(e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start]);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  async function enable() {
    try {
      await api.activitySetEnabled(true);
      await load();
    } catch (e) {
      onError(errText(e));
    }
  }

  if (!status) return <Skeleton label={t("activity.loading")} />;
  if (!status.supported) return <p className="px-2 py-6 text-center text-xs text-faint">{t("activity.unsupported")}</p>;
  if (!status.enabled) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm font-semibold text-fg">{t("activity.off")}</p>
        <p className="max-w-xs text-xs text-muted">{t("activity.offBody")}</p>
        <p className="max-w-xs text-[11px] text-faint">{t("activity.privacyHint")}</p>
        <button type="button" onClick={() => void enable()} className="min-h-8 rounded-lg border border-accent px-4 text-xs text-accent-text hover:bg-accent hover:text-on-accent">
          {t("activity.enable")}
        </button>
      </div>
    );
  }
  if (!data) return <Skeleton label={t("activity.loading")} />;

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto pr-1">
      <div className="flex items-center justify-between gap-2 text-[11px] text-faint">
        <span className="flex items-center gap-2">
          <span className="rounded-full border border-accent px-1.5 text-accent-text" title={t("activity.privacyHint")}>
            {t("activity.privacy")}
          </span>
          {t("activity.total", { time: secsLabel(data.today.total_secs) })}
        </span>
        <button type="button" onClick={() => void load()} className="canto-hit min-h-[24px] rounded-md px-1.5 hover:bg-hover hover:text-fg active:bg-active">
          {t("activity.refresh")}
        </button>
      </div>
      <div role="group" aria-label={t("activity.periodLabel")} className="flex self-start overflow-hidden rounded-lg border border-edge text-xs">
        {(["today", "week"] as const).map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={period === p}
            onClick={() => setPeriod(p)}
            className={`min-h-[24px] px-3 ${period === p ? "bg-edge font-semibold text-accent-text" : "text-muted hover:text-fg"}`}
          >
            {t(p === "today" ? "activity.today" : "activity.week")}
          </button>
        ))}
      </div>
      {period === "today" ? <TodayView summary={data.today} dayStartMs={start} /> : <WeekView days={data.week} />}
    </div>
  );
}

function CategoryBars({ apps }: { apps: ActivitySummary["apps"] }) {
  const cats = byCategory(apps);
  const max = Math.max(1, ...cats.map((c) => c.secs));
  return (
    <ul className="flex flex-col gap-1.5">
      {cats.map((c) => (
        <li key={c.category} className="grid grid-cols-[6.5rem_1fr_3rem] items-center gap-2 text-xs">
          <span className="truncate text-muted">{catLabel(c.category)}</span>
          <span className="h-2 overflow-hidden rounded-full bg-edge" role="presentation">
            <span className={`block h-full ${CATEGORY_COLOR[c.category]}`} style={{ width: `${(c.secs / max) * 100}%` }} />
          </span>
          <span className="text-right font-mono tabular-nums text-muted">{secsLabel(c.secs)}</span>
        </li>
      ))}
    </ul>
  );
}

function TodayView({ summary, dayStartMs }: { summary: ActivitySummary; dayStartMs: number }) {
  if (summary.apps.length === 0) return <p className="px-2 py-6 text-center text-xs text-faint">{t("activity.empty")}</p>;
  const daySec = Math.floor(dayStartMs / 1000);
  const range = hourRange(summary.spans, daySec);
  const rows = timelineRows(summary.spans, summary.apps);
  const ticks = [range[0], Math.round((range[0] + range[1]) / 2), range[1]];
  return (
    <>
      <section className="flex flex-col gap-1.5" aria-label={t("activity.timeline")}>
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted">{t("activity.timeline")}</h3>
        {rows.map((r) => (
          <div key={r.app} className="grid grid-cols-[4.5rem_1fr] items-center gap-2 text-[11px]">
            <span className="truncate text-muted" title={r.app}>
              {r.app}
            </span>
            <span className="relative h-3.5 overflow-hidden rounded bg-edge">
              {r.spans.map((s) => {
                const box = barBox(s, daySec, range);
                return <span key={s.start} className={`absolute inset-y-0 ${CATEGORY_COLOR[categoryOf(s.app)]}`} style={{ left: `${box.left}%`, width: `${box.width}%` }} />;
              })}
            </span>
          </div>
        ))}
        <div className="grid grid-cols-[4.5rem_1fr] gap-2 text-[10px] text-faint">
          <span />
          <span className="flex justify-between font-mono tabular-nums">
            {ticks.map((h) => (
              <span key={h}>{h}h</span>
            ))}
          </span>
        </div>
      </section>
      <section className="flex flex-col gap-1.5">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted">{t("activity.byCategory")}</h3>
        <CategoryBars apps={summary.apps} />
      </section>
      <section className="flex flex-col gap-1">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted">{t("activity.topApps")}</h3>
        <ul className="text-xs">
          {summary.apps.slice(0, 5).map((a) => (
            <li key={a.app} className="flex justify-between gap-2 py-0.5">
              <span className="truncate text-fg">{a.app}</span>
              <span className="font-mono tabular-nums text-muted">{secsLabel(a.secs)}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function WeekView({ days }: { days: Loaded["week"] }) {
  const totals = days.map((d) => d.apps.reduce((sum, a) => sum + a.secs, 0));
  const max = Math.max(1, ...totals);
  const label = (ms: number) => new Date(ms).toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "2-digit" });
  return (
    <ul className="flex flex-col gap-2">
      {days.map((d, i) => (
        <li key={d.day} className="grid grid-cols-[5.5rem_1fr_3rem] items-center gap-2 text-xs">
          <span className="truncate text-muted">{label(d.day)}</span>
          <span className="flex h-3 overflow-hidden rounded bg-edge" style={{ width: `${(totals[i] / max) * 100}%`, minWidth: totals[i] ? "2px" : 0 }}>
            {byCategory(d.apps).map((c) => (
              <span key={c.category} className={CATEGORY_COLOR[c.category]} title={`${catLabel(c.category)} ${secsLabel(c.secs)}`} style={{ width: `${(c.secs / totals[i]) * 100}%` }} />
            ))}
          </span>
          <span className="text-right font-mono tabular-nums text-muted">{totals[i] ? secsLabel(totals[i]) : "—"}</span>
        </li>
      ))}
    </ul>
  );
}
