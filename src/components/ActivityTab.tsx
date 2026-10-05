import { useCallback, useEffect, useState } from "react";
import { LOCALE, t } from "../i18n";
import { api, errText, type ActivityStatus } from "../lib/api";
import { categoryOf, secsLabel, setCategoryOverrides, streak, withoutHidden, type Category } from "../lib/activity";
import { readGoal, readOverrides, saveGoal, saveOverrides } from "../lib/activityPrefs";
import { activityText } from "../lib/activitySummary";
import { MOD_KEY } from "../lib/platform";
import { dayStart } from "../lib/summary";
import ActivityGoal from "./ActivityGoal";
import ActivityHead from "./ActivityHead";
import { TodayView, WeekView, type Day } from "./ActivityViews";
import Skeleton from "./Skeleton";

const DAY_MS = 86_400_000;
const REFRESH_MS = 60_000;

type Period = "today" | "week";
type Loaded = { week: Day[] };

/** Where the time went, from the focused-application log Rust keeps once the user opts in. */
export default function ActivityTab({ today, onError }: { today: string; onError: (m: string) => void }) {
  const [status, setStatus] = useState<ActivityStatus | null>(null);
  const [period, setPeriod] = useState<Period>("today");
  const [data, setData] = useState<Loaded | null>(null);
  const [sel, setSel] = useState(0);
  const [goalMin, setGoalMin] = useState(readGoal);
  const [cats, setCats] = useState(readOverrides);
  const [copied, setCopied] = useState(false);
  const [hidden, setHidden] = useState<ReadonlySet<Category>>(new Set());
  const start = dayStart(today);
  setCategoryOverrides(cats);

  const load = useCallback(async () => {
    try {
      const st = await api.activityStatus();
      setStatus(st);
      if (!st.enabled) return;
      const days = [0, 1, 2, 3, 4, 5, 6].map((i) => start - i * DAY_MS);
      const [todaySummary, ...rest] = await Promise.all(days.map((d) => api.activitySummary(d, d + DAY_MS)));
      setData({ week: [todaySummary, ...rest].map((s, i) => ({ day: days[i], apps: s.apps, spans: s.spans, idle: s.idle, idleSecs: s.idle_secs })) });
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

  const toggle = (c: Category) => setHidden((h) => new Set(h.has(c) ? [...h].filter((x) => x !== c) : [...h, c]));
  const recategorize = (app: string, c: Category) => {
    const next = { ...cats, [app]: c };
    saveOverrides(next);
    setCats(next);
  };
  const pickGoal = (min: number) => {
    saveGoal(min);
    setGoalMin(min);
  };
  const sumOf = (apps: { secs: number }[]) => apps.reduce((s, a) => s + a.secs, 0);
  const codeOf = (d: Day) => sumOf(d.apps.filter((a) => categoryOf(a.app) === "code"));
  const shownDay = data.week[sel];
  const before = data.week[sel + 1];
  const weekApps = Object.entries(
    data.week.flatMap((d) => d.apps).reduce<Record<string, number>>((m, a) => ({ ...m, [a.app]: (m[a.app] ?? 0) + a.secs }), {}),
  ).map(([app, secs]) => ({ app, secs })).sort((a, b) => b.secs - a.secs);
  const all = period === "today" ? shownDay.apps : weekApps;
  const shown = withoutHidden(all, hidden);
  const weekDays = data.week.filter((d) => sumOf(d.apps) > 0).length;
  const caption = period === "today" ? (shownDay.idleSecs > 0 ? t("activity.totalIdle", { time: secsLabel(sumOf(shown)), idle: secsLabel(shownDay.idleSecs) }) : t("activity.total", { time: secsLabel(sumOf(shown)) })) : t("activity.weekAvg", { time: secsLabel(sumOf(shown) / Math.max(1, weekDays)) });
  const dayLabel = sel === 0 ? t("activity.today") : sel === 1 ? t("activity.yesterday") : new Date(shownDay.day).toLocaleDateString(LOCALE, { weekday: "short", day: "2-digit", month: "2-digit" });

  async function copy() {
    try {
      await navigator.clipboard.writeText(activityText(dayLabel, shown));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      onError(t("activity.copyFailed", { mod: MOD_KEY }));
    }
  }

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto pr-1">
      <div className="flex items-center justify-between gap-2 text-[11px] text-faint">
        <div role="group" aria-label={t("activity.periodLabel")} className="flex overflow-hidden rounded-lg border border-edge text-xs">
          {(["today", "week"] as const).map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={period === p}
              onClick={() => setPeriod(p)}
              className={`min-h-[24px] px-3 ${period === p ? "bg-edge font-semibold text-accent-text" : "text-muted hover:text-fg"}`}
            >
              {t(p === "today" ? "activity.day" : "activity.week")}
            </button>
          ))}
        </div>
        <span className="flex items-center gap-2">
          <span className="rounded-full border border-accent px-1.5 text-accent-text" title={t("activity.privacyHint")}>
            {t("activity.privacy")}
          </span>
          <button type="button" onClick={() => void load()} className="canto-hit min-h-[24px] rounded-md px-1.5 hover:bg-hover hover:text-fg active:bg-active">
            {t("activity.refresh")}
          </button>
        </span>
      </div>
      {period === "today" && (
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="flex items-center gap-1">
            <button type="button" aria-label={t("activity.prevDay")} disabled={sel >= data.week.length - 1} onClick={() => setSel(sel + 1)} className="canto-hit min-h-[24px] rounded-md px-2 hover:bg-hover disabled:opacity-30">‹</button>
            <span className="min-w-[6rem] text-center font-semibold text-fg">{dayLabel}</span>
            <button type="button" aria-label={t("activity.nextDay")} disabled={sel === 0} onClick={() => setSel(sel - 1)} className="canto-hit min-h-[24px] rounded-md px-2 hover:bg-hover disabled:opacity-30">›</button>
          </span>
          <button type="button" onClick={() => void copy()} className="canto-hit min-h-[24px] rounded-md px-1.5 text-faint hover:bg-hover hover:text-fg">
            {copied ? t("activity.copied") : t("activity.copy")}
          </button>
        </div>
      )}
      {all.length === 0 ? (
        <p className="px-2 py-6 text-center text-xs text-faint">{t("activity.empty")}</p>
      ) : (
        <>
          <ActivityHead all={all} shown={shown} hidden={hidden} onToggle={toggle} reference={period === "today" && before ? sumOf(withoutHidden(before.apps, hidden)) : null} caption={caption} />
          {period === "today" && <ActivityGoal codeSecs={codeOf(shownDay)} goalMin={goalMin} days={streak(data.week.slice(sel).map(codeOf), goalMin * 60)} onGoal={pickGoal} />}
          {shown.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-faint">{t("activity.noneSelected")}</p>
          ) : period === "today" ? (
            <TodayView spans={withoutHidden(shownDay.spans, hidden)} idle={shownDay.idle} apps={shown} yesterdaySpans={before ? withoutHidden(before.spans, hidden) : []} dayStartMs={start - sel * DAY_MS} nowSec={sel === 0 ? Math.floor(Date.now() / 1000) : null} onRecategorize={recategorize} />
          ) : (
            <WeekView days={data.week.map((d) => ({ ...d, apps: withoutHidden(d.apps, hidden), spans: withoutHidden(d.spans, hidden) }))} />
          )}
        </>
      )}
    </div>
  );
}
