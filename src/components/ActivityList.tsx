import { useState } from "react";
import { t } from "../i18n";
import { appName, CATEGORIES, categoryOf, CATEGORY_COLOR, secsLabel, type Category } from "../lib/activity";
import type { ActivityFocus } from "../lib/api";
import type { Apps } from "../lib/activityView";

type Tab = "apps" | "tasks";
const sum = (items: { secs: number }[]) => items.reduce((s, i) => s + i.secs, 0);

function Meter({ pct, className }: { pct: number; className: string }) {
  return (
    <span className="col-span-3 col-start-2 h-1 overflow-hidden rounded-full bg-edge">
      <span className={`block h-full rounded-full ${className}`} style={{ width: `${pct}%` }} />
    </span>
  );
}

/** The most used applications, or the tasks the focus timer ran on; tapping an application lets the user move it to another category. */
export default function ActivityList({ apps, focus, scope, onRecategorize }: {
  apps: Apps;
  focus: ActivityFocus[];
  scope: "day" | "week";
  onRecategorize: (app: string, c: Category) => void;
}) {
  const [tab, setTab] = useState<Tab>("apps");
  const [editing, setEditing] = useState<string | null>(null);
  const appsTotal = sum(apps);
  const tasksTotal = sum(focus);
  return (
    <section className="rounded-2xl border border-edge bg-panel p-3.5" aria-label={t("activity.listLabel")}>
      <div role="group" aria-label={t("activity.listLabel")} className="mb-2.5 flex gap-1 rounded-xl border border-edge bg-ink p-1">
        {(["apps", "tasks"] as const).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={tab === k}
            onClick={() => {
              setTab(k);
              setEditing(null);
            }}
            className={`canto-hit min-h-[28px] flex-1 rounded-lg px-2 text-xs ${tab === k ? "bg-panel font-semibold text-fg shadow-[0_1px_0_var(--color-edge)]" : "text-muted hover:text-fg"}`}
          >
            {t(k === "apps" ? "activity.tabApps" : "activity.tabTasks")}
          </button>
        ))}
      </div>
      {tab === "apps" ? (
        <ul className="flex flex-col gap-0.5">
          {apps.slice(0, 7).map((a) => {
            const open = editing === a.app;
            const cat = categoryOf(a.app);
            return (
              <li key={a.app}>
                <button type="button" aria-expanded={open} onClick={() => setEditing(open ? null : a.app)} className="canto-hit grid w-full grid-cols-[0.625rem_minmax(0,1fr)_auto_2.6rem] items-center gap-x-2 gap-y-1 rounded-lg px-1.5 py-1.5 text-left hover:bg-hover active:bg-active">
                  <span className={`h-2.5 w-2.5 rounded-[3px] ${CATEGORY_COLOR[cat]}`} />
                  <span className="truncate text-[12.5px] text-fg" title={a.app}>{appName(a.app)}</span>
                  <span className="font-mono text-xs tabular-nums text-muted">{secsLabel(a.secs)}</span>
                  <span className="text-right font-mono text-[11px] tabular-nums text-faint">{Math.round((a.secs / appsTotal) * 100)}%</span>
                  <Meter pct={(a.secs / apps[0].secs) * 100} className={CATEGORY_COLOR[cat]} />
                </button>
                {open && (
                  <div role="group" aria-label={t("activity.recat", { app: appName(a.app) })} className="flex flex-wrap items-center gap-1.5 pb-2 pl-[1.625rem] pr-1.5 pt-0.5">
                    <span className="text-[11px] text-faint">{t("activity.recat", { app: appName(a.app) })}</span>
                    {CATEGORIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        aria-pressed={cat === c}
                        onClick={() => onRecategorize(a.app, c)}
                        className={`canto-hit inline-flex min-h-[24px] items-center gap-1.5 rounded-full border px-2.5 text-[11.5px] ${cat === c ? "border-fg text-fg" : "border-edge text-muted hover:text-fg"}`}
                      >
                        <span className={`h-2 w-2 rounded-sm ${CATEGORY_COLOR[c]}`} />
                        {t(`activity.cat.${c}` as const)}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : focus.length === 0 ? (
        <p className="px-1.5 py-1 text-xs text-faint">{t(scope === "day" ? "activity.noTasksDay" : "activity.noTasksWeek")}</p>
      ) : (
        <ul className="flex flex-col gap-0.5">
          {focus.map((f) => (
            <li key={f.task} className="grid grid-cols-[0.625rem_minmax(0,1fr)_auto_2.6rem] items-center gap-x-2 gap-y-1 px-1.5 py-1.5">
              <span className="h-2.5 w-2.5 rounded-[3px] bg-accent" />
              <span className={`truncate text-[12.5px] ${f.title === null ? "italic text-faint" : "text-fg"}`} title={f.title ?? undefined}>{f.title ?? t("activity.taskGone")}</span>
              <span className="font-mono text-xs tabular-nums text-muted">{secsLabel(f.secs)}</span>
              <span className="text-right font-mono text-[11px] tabular-nums text-faint">{Math.round((f.secs / tasksTotal) * 100)}%</span>
              <Meter pct={(f.secs / focus[0].secs) * 100} className="bg-accent" />
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 px-1.5 text-[11px] text-faint">{t(tab === "apps" ? "activity.recatHint" : "activity.tasksHint")}</p>
    </section>
  );
}
