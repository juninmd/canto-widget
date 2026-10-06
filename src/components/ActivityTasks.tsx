import { t } from "../i18n";
import { secsLabel } from "../lib/activity";
import type { ActivityFocus } from "../lib/api";

/** Where the focus timer's time went, task by task, for the day on screen. */
export default function ActivityTasks({ focus }: { focus: ActivityFocus[] }) {
  if (focus.length === 0) return null;
  return (
    <section className="flex flex-col gap-1.5" aria-label={t("activity.byTask")}>
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted">{t("activity.byTask")}</h3>
        <span className="text-[10px] text-faint">{t("activity.byTaskHint")}</span>
      </div>
      <ul className="flex flex-col gap-2 text-xs">
        {focus.map((f) => (
          <li key={f.task} className="grid grid-cols-[1fr_auto] items-center gap-x-2 gap-y-1">
            <span className={`truncate ${f.title === null ? "italic text-faint" : "text-fg"}`} title={f.title ?? undefined}>
              {f.title ?? t("activity.taskGone")}
            </span>
            <span className="font-mono tabular-nums text-muted">{secsLabel(f.secs)}</span>
            <span className="col-span-2 h-1 overflow-hidden rounded-full bg-edge">
              <span className="block h-full bg-accent" style={{ width: `${(f.secs / focus[0].secs) * 100}%` }} />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
