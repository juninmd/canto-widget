import { bytes, fixed, sortApps, type AppSort } from "../lib/system";
import type { SystemApp } from "../lib/systemTypes";
import { t } from "../i18n";

const SORTS: AppSort[] = ["cpu", "memory"];

/** The heaviest apps, each row's tint as long as its share of the heaviest one; the header flips the order. */
export default function SystemApps({ apps, by, onSort }: { apps: SystemApp[]; by: AppSort; onSort: (by: AppSort) => void }) {
  const list = sortApps(apps, by);
  const value = (a: SystemApp) => (by === "cpu" ? a.cpu : a.memory);
  const top = Math.max(...list.map(value), 0) || 1;
  const sortLabel = (s: AppSort) => (s === "cpu" ? t("system.sub.cpu") : t("system.sub.memory"));
  return (
    <section data-system-apps={by} className="wx-glass wx-rise flex shrink-0 flex-col gap-1 p-2" style={{ "--i": 3 } as React.CSSProperties}>
      <div className="flex items-center justify-between px-1 text-[11px] text-muted">
        <h3 className="font-semibold text-fg">{t("system.apps.title")}</h3>
        <button
          type="button"
          onClick={() => onSort(SORTS[(SORTS.indexOf(by) + 1) % SORTS.length])}
          aria-label={t("system.apps.sort", { by: sortLabel(SORTS[(SORTS.indexOf(by) + 1) % SORTS.length]) })}
          className="canto-hit rounded-md px-1.5 py-0.5 hover:bg-hover hover:text-fg"
        >
          {sortLabel(by)} ⇅
        </button>
      </div>
      {list.length === 0 ? (
        <p className="px-1 py-2 text-[11px] text-faint">{t("system.apps.empty")}</p>
      ) : (
        <ul className="flex flex-col gap-0.5">
          {list.map((app, i) => (
            <li key={app.name} className="relative flex min-h-8 items-center gap-2 overflow-hidden rounded-lg px-2 text-[12px]">
              <span
                aria-hidden="true"
                className="canto-grow-x absolute inset-y-0 left-0 rounded-lg bg-accent/10"
                style={{ width: `${(value(app) / top) * 100}%`, "--i": i } as React.CSSProperties}
              />
              <span aria-hidden="true" className="relative grid size-5 shrink-0 place-items-center rounded-md bg-hover text-[10px] font-bold uppercase text-muted">
                {app.name.slice(0, 1)}
              </span>
              <span className="relative min-w-0 flex-1 truncate text-fg">
                {app.name}
                {app.count > 1 && <span className="ml-1 text-faint">({app.count})</span>}
              </span>
              <span className="relative shrink-0 tabular-nums text-fg">{by === "cpu" ? `${fixed(app.cpu, 1)}%` : bytes(app.memory)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
