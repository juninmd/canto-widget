import { useCallback, useEffect, useState } from "react";
import { LOCALE, t } from "../i18n";
import { api, errText, type ActivityStatus } from "../lib/api";
import { categoryOf, secsLabel, setCategoryOverrides, streak, withoutHidden, type Category } from "../lib/activity";
import { readGoal, readOverrides, saveGoal, saveOverrides } from "../lib/activityPrefs";
import { activityText } from "../lib/activitySummary";
import { mergeApps, mergeFocus, weekSeries, type Day } from "../lib/activityView";
import { MOD_KEY } from "../lib/platform";
import { dayStart } from "../lib/summary";
import { useToast } from "../lib/toast";
import ActivityBar, { type Period } from "./ActivityBar";
import ActivityDay from "./ActivityDay";
import ActivityHeat from "./ActivityHeat";
import ActivityList from "./ActivityList";
import ActivityWeek from "./ActivityWeek";
import { ActivityEmpty, ActivityFooter, ActivityLoading, ActivityOff, ActivityUnsupported } from "./ActivityStates";
import { COLUMN, LAYOUT } from "./activityLayout";

const DAY_MS = 86_400_000;
const REFRESH_MS = 60_000;
const ROOT = "@container relative flex h-full min-h-0 flex-col overflow-y-auto pr-1";
const sum = (apps: { secs: number }[]) => apps.reduce((s, a) => s + a.secs, 0);
const codeOf = (d: Day) => sum(d.apps.filter((a) => categoryOf(a.app) === "code"));

/** Where the time went, from the focused-application log Rust keeps once the user opts in. */
export default function ActivityTab({ today, onError }: { today: string; onError: (m: string) => void }) {
  const notify = useToast();
  const [status, setStatus] = useState<ActivityStatus | null>(null);
  const [period, setPeriod] = useState<Period>("today");
  const [week, setWeek] = useState<Day[] | null>(null);
  const [sel, setSel] = useState(0);
  const [goalMin, setGoalMin] = useState(readGoal);
  const [editGoal, setEditGoal] = useState(false);
  const [cats, setCats] = useState(readOverrides);
  const [hidden, setHidden] = useState<ReadonlySet<Category>>(new Set());
  const start = dayStart(today);
  setCategoryOverrides(cats);

  const load = useCallback(async () => {
    try {
      const st = await api.activityStatus();
      setStatus(st);
      if (!st.enabled) return;
      const days = [0, 1, 2, 3, 4, 5, 6].map((i) => start - i * DAY_MS);
      const sums = await Promise.all(days.map((d) => api.activitySummary(d, d + DAY_MS)));
      setWeek(sums.map((s, i) => ({ day: days[i], apps: s.apps, spans: s.spans, idle: s.idle, idleSecs: s.idle_secs, focus: s.focus })));
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

  if (!status || (status.supported && status.enabled && !week)) return <div className={ROOT}><ActivityLoading /></div>;
  if (!status.supported) return <div className={ROOT}><ActivityUnsupported /></div>;
  if (!status.enabled || !week) return <div className={ROOT}><ActivityOff onEnable={() => void enable()} /></div>;

  const dayLabel = (i: number) => (i === 0 ? t("activity.today") : i === 1 ? t("activity.yesterday") : new Date(week[i].day).toLocaleDateString(LOCALE, { weekday: "short", day: "2-digit", month: "2-digit" }));
  const day = week[sel];
  const goalSecs = goalMin * 60;
  const flags = [...week].reverse().map((d, k) => ({ met: goalSecs > 0 && codeOf(d) >= goalSecs, label: t("activity.goalDay", { day: dayLabel(6 - k), time: secsLabel(codeOf(d)) }), selected: 6 - k === sel }));
  const recategorize = (app: string, c: Category) => {
    const next = { ...cats, [app]: c };
    saveOverrides(next);
    setCats(next);
  };
  const pickGoal = (min: number) => {
    saveGoal(min);
    setGoalMin(min);
  };
  async function copy() {
    try {
      await navigator.clipboard.writeText(activityText(dayLabel(sel), withoutHidden(day.apps, hidden), day.focus));
      notify({ message: t("activity.copied") });
    } catch {
      onError(t("activity.copyFailed", { mod: MOD_KEY }));
    }
  }

  const empty = period === "today" ? day.apps.length === 0 : mergeApps(week).length === 0;
  return (
    <div className={ROOT}>
      <ActivityBar
        period={period}
        onPeriod={setPeriod}
        dayLabel={dayLabel(sel)}
        canPrev={sel < week.length - 1}
        canNext={sel > 0}
        onPrev={() => setSel(sel + 1)}
        onNext={() => setSel(sel - 1)}
        onCopy={() => void copy()}
        onRefresh={() => void load()}
        onGoal={() => setEditGoal(true)}
      />
      {empty ? (
        <ActivityEmpty />
      ) : period === "today" ? (
        <ActivityDay
          day={day}
          before={week[sel + 1]}
          hidden={hidden}
          onToggle={(c) => setHidden((h) => new Set(h.has(c) ? [...h].filter((x) => x !== c) : [...h, c]))}
          nowSec={sel === 0 ? Math.floor(Date.now() / 1000) : null}
          goal={{ codeSecs: codeOf(day), minutes: goalMin, streakDays: streak(week.slice(sel).map(codeOf), goalSecs), days: flags, editing: editGoal, onEditing: setEditGoal, onGoal: pickGoal }}
          onRecategorize={recategorize}
        />
      ) : (
        <div className={LAYOUT}>
          <div className={COLUMN}>
            <ActivityWeek series={weekSeries(week, new Set(), goalSecs)} goalMin={goalMin} />
          </div>
          <div className={COLUMN}>
            <ActivityHeat days={week} />
            <ActivityList apps={mergeApps(week)} focus={mergeFocus(week)} scope="week" onRecategorize={recategorize} />
          </div>
        </div>
      )}
      <ActivityFooter />
    </div>
  );
}
