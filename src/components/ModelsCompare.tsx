import { useMemo } from "react";
import type { ModelRow } from "../lib/api";
import { BAR_METRICS, METRICS, SERIES, bestValue, value, verdicts, type Verdict } from "../lib/modelsCompare";
import { formatScore } from "../lib/models";
import { LOCALE, t } from "../i18n";
import ModelPicker from "./ModelPicker";
import ModelsRadar from "./ModelsRadar";
import ModelsTable, { METRIC_LABEL, formatMetric } from "./ModelsTable";

const SECTION = "text-[10px] font-semibold tracking-wider text-faint uppercase";
const times = (n: number) => n.toLocaleString(LOCALE, { maximumFractionDigits: 1 });

function sentence(v: Verdict, name: string): string {
  if (v.kind === "smartest") return t("models.v.smartest", { name, gap: formatScore(v.gap), other: v.other });
  if (v.kind === "tie") return t("models.v.tie", { name, other: v.other, score: formatScore(v.score) });
  if (v.kind === "cheapest") return t("models.v.cheapest", { name, times: times(v.times), other: v.other });
  if (v.kind === "fastest") return t("models.v.fastest", { name, times: times(v.times), other: v.other });
  return t("models.v.unmeasured", { names: v.names });
}

function Bars({ rows }: { rows: readonly ModelRow[] }) {
  return BAR_METRICS.map((key) => {
    const metric = METRICS.find((m) => m.key === key)!;
    const best = bestValue(rows, metric);
    const max = Math.max(0, ...rows.map((r) => value(r, key) ?? 0));
    return (
      <div key={key} data-metric={key} className="flex flex-col gap-1 rounded-xl border border-edge bg-panel px-2.5 py-2">
        <div className="flex justify-between text-[11px]">
          <span className="font-semibold text-fg">{t(METRIC_LABEL[key] as "models.sheet.math")}</span>
          <span className="text-[10px] text-faint">{metric.better === "max" ? t("models.cmp.higher") : t("models.cmp.lower")}</span>
        </div>
        {rows.map((r, i) => {
          const v = value(r, key);
          const win = best !== null && v === best;
          return (
            <div key={r.id} className="grid grid-cols-[1fr_4.5rem] items-center gap-2 text-[10.5px] tabular-nums">
              <div aria-hidden="true" className="h-[7px] overflow-hidden rounded-full bg-edge">
                {v !== null && max > 0 && <div className="canto-grow-x h-full rounded-full" style={{ width: `${Math.max(3, (v / max) * 100)}%`, background: SERIES[i], ["--i" as string]: i }} />}
              </div>
              <span className={`text-right ${win ? "font-bold text-fg" : "text-muted"}`}>
                {win && <span className="mr-0.5 text-[9px] text-accent-text">★</span>}
                {formatMetric(r, key)}
              </span>
            </div>
          );
        })}
      </div>
    );
  });
}

/** Side by side: who leads in a sentence, the shape of each model, one bar per metric and the full table. */
export default function ModelsCompare({ rows, picked, onChange }: { rows: readonly ModelRow[]; picked: readonly string[]; onChange: (ids: string[]) => void }) {
  // Stable while the pick is unchanged, so the full table below keeps its memoized lines.
  const chosen = useMemo(() => picked.map((id) => rows.find((r) => r.id === id)).filter((r): r is ModelRow => r !== undefined), [rows, picked]);
  const color = (id: string) => SERIES[chosen.findIndex((r) => r.id === id)];
  const name = (id: string) => chosen.find((r) => r.id === id)?.name ?? id;
  return (
    <div className="flex flex-col gap-2.5">
      <ModelPicker rows={rows} picked={chosen} onChange={onChange} />
      {chosen.length < 2 ? (
        <div className="rounded-xl border border-dashed border-edge px-3 py-7 text-center text-xs text-faint">
          {t("models.cmp.empty")}
          <br />
          <span className="text-[10.5px]">{t("models.cmp.emptyHint")}</span>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-1.5 rounded-xl border border-edge bg-ink px-2.5 py-2 text-[11.5px] text-muted">
            <span className={SECTION}>{t("models.cmp.summary")}</span>
            {verdicts(chosen).map((v) => (
              <p key={v.kind} data-verdict={v.kind} className="flex items-baseline gap-2">
                <i aria-hidden="true" className="size-[7px] shrink-0 rounded-full" style={{ background: color(v.id) }} />
                <span>{sentence(v, name(v.id))}</span>
              </p>
            ))}
          </div>
          <span className={SECTION}>{t("models.cmp.overview")}</span>
          <ModelsRadar pool={rows} picked={chosen} />
          <span className={SECTION}>{t("models.cmp.byMetric")}</span>
          <Bars rows={chosen} />
          <ModelsTable rows={chosen} />
          <p className="text-center text-[10px] text-faint">{t("models.cmp.radarNote")}</p>
        </>
      )}
    </div>
  );
}
