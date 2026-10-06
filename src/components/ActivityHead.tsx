import { t } from "../i18n";
import { byCategory, CATEGORY_COLOR, secsLabel, type Category } from "../lib/activity";

type Apps = { app: string; secs: number }[];
const catLabel = (c: Category) => t(`activity.cat.${c}` as const);
const sum = (apps: Apps) => apps.reduce((s, a) => s + a.secs, 0);

/** Total, change against the reference, the share per category and the chips that hide a category. */
export default function ActivityHead({ all, shown, hidden, onToggle, reference, caption }: {
  all: Apps;
  shown: Apps;
  hidden: ReadonlySet<Category>;
  onToggle: (c: Category) => void;
  reference: number | null;
  caption: string;
}) {
  const total = sum(shown);
  const cats = byCategory(shown);
  const diff = reference === null ? null : total - reference;
  const present = byCategory(all);
  return (
    <section className="flex flex-col gap-2.5 rounded-xl border border-edge p-3">
      <div className="grid grid-cols-[auto_1fr] items-center gap-3">
        <div>
          <div className="font-mono text-2xl font-bold leading-none tabular-nums text-fg">{secsLabel(total)}</div>
          {diff !== null && Math.abs(diff) >= 60 && (
            <div className={`mt-1 text-[11px] ${diff > 0 ? "text-ok" : "text-muted"}`}>
              {diff > 0 ? "▲ " : "▼ "}
              {t(diff > 0 ? "activity.vsYesterday" : "activity.vsYesterdayLess", { time: secsLabel(Math.abs(diff)) })}
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex h-2.5 overflow-hidden rounded-full bg-edge" role="img" aria-label={caption}>
            {cats.map((c) => (
              <span key={c.category} className={CATEGORY_COLOR[c.category]} title={`${catLabel(c.category)} ${secsLabel(c.secs)}`} style={{ width: `${(c.secs / total) * 100}%` }} />
            ))}
          </div>
          <span className="text-[11px] leading-tight text-faint">{caption}</span>
        </div>
      </div>
      <div role="group" aria-label={t("activity.filterLabel")} className="flex flex-wrap gap-1.5">
        {present.map((c) => {
          const on = !hidden.has(c.category);
          return (
            <button
              key={c.category}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(c.category)}
              className={`canto-hit inline-flex min-h-[24px] items-center gap-1.5 rounded-full border border-edge px-2 text-[11px] ${on ? "text-fg" : "text-faint line-through opacity-60"}`}
            >
              <span className={`h-2 w-2 rounded-full ${CATEGORY_COLOR[c.category]}`} />
              {catLabel(c.category)}
              <span className="font-mono tabular-nums text-muted">{secsLabel(c.secs)}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
