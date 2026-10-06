import { useState } from "react";
import { t } from "../i18n";
import { appName, CATEGORIES, categoryOf, CATEGORY_COLOR, secsLabel, type Category } from "../lib/activity";

type Apps = { app: string; secs: number }[];

/** The most used applications; tapping one lets the user move it to another category. */
export default function ActivityApps({ apps, onRecategorize }: { apps: Apps; onRecategorize: (app: string, c: Category) => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const total = apps.reduce((s, a) => s + a.secs, 0);
  const top = apps.slice(0, 6);
  return (
    <section className="flex flex-col gap-1">
      <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted">{t("activity.topApps")}</h3>
      <ul className="flex flex-col gap-2 text-xs">
        {top.map((a) => {
          const open = editing === a.app;
          return (
            <li key={a.app} className="flex flex-col gap-1">
              <button type="button" aria-expanded={open} onClick={() => setEditing(open ? null : a.app)} className="canto-hit grid grid-cols-[0.5rem_1fr_auto] items-center gap-x-2 gap-y-1 rounded text-left hover:bg-hover">
                <span className={`h-2 w-2 rounded-full ${CATEGORY_COLOR[categoryOf(a.app)]}`} />
                <span className="truncate text-fg" title={a.app}>{appName(a.app)}</span>
                <span className="font-mono tabular-nums text-muted">
                  {secsLabel(a.secs)}
                  <span className="ml-1.5 text-[11px] text-faint">{Math.round((a.secs / total) * 100)}%</span>
                </span>
                <span className="col-span-2 col-start-2 h-1 overflow-hidden rounded-full bg-edge">
                  <span className={`block h-full ${CATEGORY_COLOR[categoryOf(a.app)]}`} style={{ width: `${(a.secs / top[0].secs) * 100}%` }} />
                </span>
              </button>
              {open && (
                <label className="flex items-center justify-between gap-2 text-[11px] text-faint">
                  {t("activity.recat", { app: appName(a.app) })}
                  <select value={categoryOf(a.app)} onChange={(e) => onRecategorize(a.app, e.target.value as Category)} className="rounded border border-edge bg-panel px-1.5 py-0.5 text-xs text-fg">
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{t(`activity.cat.${c}` as const)}</option>
                    ))}
                  </select>
                </label>
              )}
            </li>
          );
        })}
      </ul>
      <p className="text-[10px] text-faint">{t("activity.recatHint")}</p>
    </section>
  );
}
