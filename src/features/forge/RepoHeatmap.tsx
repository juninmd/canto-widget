import type { Contributions } from "../../lib/api";
import { heatmapWeeks } from "./repos";
import { t } from "../../i18n";

const WEEKS = 26;
const SHADE = ["bg-edge/70", "bg-accent/25", "bg-accent/50", "bg-accent/75", "bg-accent"] as const;

/** The profile's contribution squares, last six months: one column per week, darker means busier. */
export default function RepoHeatmap({ calendar }: { calendar: Contributions }) {
  const cols = heatmapWeeks(calendar.days, WEEKS);
  const shown = cols.flat().reduce((n, c) => n + (c?.count ?? 0), 0);
  return (
    <figure className="m-0 space-y-1" aria-label={t("forge.repos.heatmap")}>
      <div role="img" aria-label={t("forge.repos.heatmapSummary", { n: shown })} className="flex gap-[3px] overflow-x-auto pb-0.5">
        {cols.map((col, i) => (
          <div key={i} className="flex shrink-0 flex-col gap-[3px]">
            {col.map((c, j) =>
              c ? (
                <span key={j} title={t("forge.repos.day", { n: c.count, date: c.date })} className={`size-[10px] rounded-[2px] ${SHADE[c.level]}`} />
              ) : (
                <span key={j} className="size-[10px]" />
              ),
            )}
          </div>
        ))}
      </div>
      <figcaption className="flex items-center justify-between text-[10px] text-faint">
        <span>{t("forge.repos.heatmapSummary", { n: shown })}</span>
        <span aria-hidden="true" className="flex items-center gap-[3px]">
          {t("forge.repos.less")}
          {SHADE.map((s) => (
            <span key={s} className={`size-[10px] rounded-[2px] ${s}`} />
          ))}
          {t("forge.repos.more")}
        </span>
      </figcaption>
    </figure>
  );
}
