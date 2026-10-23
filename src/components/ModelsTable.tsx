import { useState } from "react";
import type { ModelRow } from "../lib/api";
import { formatContext, formatPrice, formatReleased, formatScore, formatSeconds, formatSpeed } from "../lib/models";
import { METRICS, SERIES, bestValue, value, type MetricKey } from "../lib/modelsCompare";
import { t } from "../i18n";

export const METRIC_LABEL: Record<MetricKey, string> = {
  score: "models.sheet.intelligence",
  coding: "models.sheet.coding",
  math: "models.sheet.math",
  input_price: "models.sheet.input",
  output_price: "models.sheet.output",
  price: "models.sheet.blended",
  speed: "models.sheet.speed",
  ttft: "models.sheet.ttft",
  context: "models.sheet.context",
  released: "models.sheet.released",
};

export function formatMetric(row: ModelRow, key: MetricKey): string {
  const v = row[key];
  if (v === null) return "—";
  if (key === "released") return formatReleased(v as string);
  const n = v as number;
  if (key === "input_price" || key === "output_price" || key === "price") return t("models.usd", { price: formatPrice(n) });
  if (key === "speed") return t("models.speed", { n: formatSpeed(n) });
  if (key === "ttft") return t("models.seconds", { n: formatSeconds(n) });
  if (key === "context") return formatContext(n);
  return formatScore(n);
}

type Line = { group: string; label: string; cells: string[]; best: boolean[] };

function lines(rows: readonly ModelRow[]): Line[] {
  const out: Line[] = METRICS.map((m) => {
    const best = bestValue(rows, m);
    return {
      group: m.group,
      label: t(METRIC_LABEL[m.key] as "models.sheet.math"),
      cells: rows.map((r) => formatMetric(r, m.key)),
      best: rows.map((r) => best !== null && value(r, m.key) === best),
    };
  });
  const yesNo = (v: boolean | null) => (v === null ? "—" : v ? t("models.yes") : t("models.no"));
  const none = rows.map(() => false);
  out.push({ group: "sheet", label: t("models.filter.open"), cells: rows.map((r) => yesNo(r.open_weights)), best: none });
  out.push({ group: "sheet", label: t("models.sheet.reasoning"), cells: rows.map((r) => yesNo(r.reasoning)), best: none });
  out.push({ group: "sheet", label: t("models.sheet.creator"), cells: rows.map((r) => r.creator || "—"), best: none });
  return out;
}

/** Every field side by side, best value per row in the accent; "só diferenças" hides the rows where all agree. */
export default function ModelsTable({ rows }: { rows: readonly ModelRow[] }) {
  const [onlyDiff, setOnlyDiff] = useState(false);
  const shown = lines(rows).filter((l) => !onlyDiff || new Set(l.cells).size > 1);
  let group = "";
  return (
    <>
      <div className="flex items-center justify-between text-[10px] font-semibold tracking-wider text-faint uppercase">
        <span>{t("models.cmp.table")}</span>
        <label className="flex items-center gap-1.5 text-[10.5px] font-normal tracking-normal text-muted normal-case">
          <input type="checkbox" checked={onlyDiff} onChange={(e) => setOnlyDiff(e.target.checked)} className="accent-[var(--color-accent)]" />
          {t("models.cmp.onlyDiff")}
        </label>
      </div>
      <div className="overflow-x-auto rounded-xl border border-edge bg-panel">
        <table className="w-full border-collapse text-[10.5px] tabular-nums">
          <thead>
            <tr>
              <th className="sticky left-0 bg-panel" />
              {rows.map((r, i) => (
                <th key={r.id} className="px-2 py-1.5 text-right font-semibold whitespace-nowrap text-fg">
                  <i aria-hidden="true" className="mr-1 inline-block size-[7px] rounded-full" style={{ background: SERIES[i] }} />
                  {r.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((l) => {
              const head = l.group !== group;
              group = l.group;
              return [
                head && (
                  <tr key={`g-${l.group}`}>
                    <td colSpan={rows.length + 1} className="border-t border-edge bg-ink px-2 py-1 text-[9.5px] tracking-wider text-faint uppercase">
                      {t(`models.group.${l.group}` as "models.group.sheet")}
                    </td>
                  </tr>
                ),
                <tr key={l.label}>
                  <td className="sticky left-0 border-t border-edge bg-panel px-2 py-1.5 whitespace-nowrap text-faint">{l.label}</td>
                  {l.cells.map((c, i) => (
                    <td key={rows[i].id} className={`border-t border-edge px-2 py-1.5 text-right whitespace-nowrap ${l.best[i] ? "font-bold text-accent-text" : "text-fg"}`}>
                      {c}
                    </td>
                  ))}
                </tr>,
              ];
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
