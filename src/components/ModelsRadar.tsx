import type { ModelRow } from "../lib/api";
import { AXES, SERIES, radius, type Axis } from "../lib/modelsCompare";
import { t } from "../i18n";

const W = 360;
const H = 236;
const CX = W / 2;
const CY = 120;
const R = 84;

const LABEL: Record<Axis, string> = {
  score: "models.sheet.intelligence",
  coding: "models.sheet.coding",
  math: "models.sheet.math",
  price: "models.cmp.cost",
  speed: "models.sheet.speed",
};

function point(i: number, r: number): [number, number] {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / AXES.length;
  return [CX + Math.cos(a) * R * r, CY + Math.sin(a) * R * r];
}

const ring = (r: number) => AXES.map((_, i) => point(i, r).join(",")).join(" ");

/** One polygon per picked model over five axes; a missing measure sits at the center rather than being guessed. */
export default function ModelsRadar({ pool, picked }: { pool: readonly ModelRow[]; picked: readonly ModelRow[] }) {
  return (
    <div className="rounded-xl border border-edge bg-ink p-1.5">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("models.cmp.radarLabel")} className="block h-auto w-full">
        {[0.25, 0.5, 0.75, 1].map((r) => (
          <polygon key={r} points={ring(r)} fill="none" stroke="var(--color-edge)" />
        ))}
        {AXES.map((_, i) => {
          const [x, y] = point(i, 1);
          return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="var(--color-edge)" />;
        })}
        {picked.map((m, k) => (
          <polygon
            key={m.id}
            data-radar={m.id}
            className="canto-pop"
            style={{ transformOrigin: `${CX}px ${CY}px`, ["--i" as string]: k }}
            points={AXES.map((a, i) => point(i, radius(pool, a, m[a])).join(",")).join(" ")}
            fill={SERIES[k]}
            fillOpacity={0.14}
            stroke={SERIES[k]}
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
        ))}
        {AXES.map((a, i) => {
          const [x, y] = point(i, 1.2);
          const anchor = Math.abs(x - CX) < 4 ? "middle" : x > CX ? "start" : "end";
          return (
            <text key={a} x={x} y={y + 3} textAnchor={anchor} fill="var(--color-muted)" fontSize={10} fontWeight={500}>
              {t(LABEL[a] as "models.cmp.cost")}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
