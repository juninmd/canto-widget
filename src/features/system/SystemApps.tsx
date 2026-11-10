import { useState, type CSSProperties } from "react";
import { bytes, fixed, matchApps, sortApps, type AppSort } from "./system";
import type { SystemApp } from "./systemTypes";
import { t } from "../../i18n";
import { Badge } from "./SystemBits";
import { AppsIcon, SubIcon } from "./SystemIcons";
import { CrossIcon, SearchIcon } from "../../components/Icons";

const SORTS: AppSort[] = ["cpu", "memory"];
const FIRST = 6;
const TINT = ["bg-accent/15 text-accent-text", "bg-cat-meet/15 text-cat-meet", "bg-warn/15 text-warn", "bg-danger/12 text-danger", "bg-hover text-muted"];

/** The heaviest apps, each row's tint as long as its share of the heaviest one; a filter, a CPU/Memória switch and "ver todos". */
export default function SystemApps({ apps, by, onSort }: { apps: SystemApp[]; by: AppSort; onSort: (by: AppSort) => void }) {
  const [query, setQuery] = useState("");
  const [all, setAll] = useState(false);
  const found = sortApps(matchApps(apps, query), by, apps.length);
  const list = all || query ? found : found.slice(0, FIRST);
  const value = (a: SystemApp) => (by === "cpu" ? a.cpu : a.memory);
  const top = Math.max(...found.map(value), 0) || 1;
  const sortLabel = (s: AppSort) => (s === "cpu" ? t("system.sub.cpu") : t("system.sub.memory"));
  return (
    <section data-system-apps={by} className="wx-glass wx-rise flex shrink-0 flex-col gap-2 p-2.5" style={{ "--i": 3 } as CSSProperties}>
      <div className="flex items-center gap-2 text-[11px] text-muted">
        <h3 className="flex flex-1 items-center gap-2 text-[12px] font-semibold text-fg">
          <Badge icon={<AppsIcon />} />
          {t("system.apps.title")}
          <span className="text-[10.5px] font-normal text-faint tabular-nums">{apps.length}</span>
        </h3>
        <div role="group" aria-label={t("system.apps.sortBy")} className="flex gap-0.5 rounded-lg border border-edge bg-ink/60 p-0.5">
          {SORTS.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={by === s}
              aria-label={t("system.apps.sort", { by: sortLabel(s) })}
              onClick={() => onSort(s)}
              className={`canto-hit inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-colors ${by === s ? "bg-raised font-semibold text-accent-text shadow-[var(--shadow-raised)]" : "hover:bg-hover hover:text-fg"}`}
            >
              <SubIcon sub={s} size={12} />
              {sortLabel(s)}
            </button>
          ))}
        </div>
      </div>
      <label className="canto-field flex h-7 items-center gap-1.5 px-2 text-[11.5px] text-muted">
        <SearchIcon />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && query && (e.stopPropagation(), setQuery(""))}
          placeholder={t("system.apps.search")}
          aria-label={t("system.apps.search")}
          className="min-w-0 flex-1 bg-transparent text-fg outline-none placeholder:text-faint"
        />
        {query && (
          <button
            type="button"
            aria-label={t("system.apps.clear")}
            onClick={() => setQuery("")}
            className="canto-hit grid place-items-center rounded text-faint hover:text-fg"
          >
            <CrossIcon />
          </button>
        )}
      </label>
      {apps.length === 0 ? (
        <p className="px-1 py-2 text-[11px] text-faint">{t("system.apps.empty")}</p>
      ) : list.length === 0 ? (
        <p className="px-1 py-2 text-[11px] text-faint">{t("system.apps.noMatch", { q: query.trim() })}</p>
      ) : (
        <ul className="flex flex-col gap-0.5">
          {list.map((app, i) => (
            <li key={app.name} className="canto-raise relative flex min-h-8 items-center gap-2 overflow-hidden rounded-lg px-2 text-[12px] hover:bg-hover/50">
              <span
                aria-hidden="true"
                className="canto-grow-x absolute inset-y-0 left-0 rounded-lg bg-accent/10 transition-[width] duration-700"
                style={{ width: `${(value(app) / top) * 100}%`, "--i": i } as CSSProperties}
              />
              <span
                aria-hidden="true"
                className={`relative grid size-5 shrink-0 place-items-center rounded-md text-[10px] font-bold uppercase ${TINT[app.name.charCodeAt(0) % TINT.length]}`}
              >
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
      {!query && found.length > FIRST && (
        <button
          type="button"
          aria-expanded={all}
          onClick={() => setAll(!all)}
          className="canto-hit self-center rounded-md px-2 text-[11px] text-accent-text hover:bg-hover"
        >
          {all ? t("system.apps.less") : t("system.apps.more", { n: found.length })}
        </button>
      )}
    </section>
  );
}
