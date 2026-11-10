import { useId } from "react";
import { smoothCurve } from "../../lib/sparkline";

const W = 300;
/** Same length as `HISTORY` in `sysmon.rs`: the curve fills the width once the last minute is read. */
const SLOTS = 30;

type Props = {
  values: number[];
  /** Fixed top of the scale (100 for a percentage); rates scale to their own peak. */
  max?: number;
  height?: number;
  /** A second curve drawn under the first on the same scale (upload under download, write under read). */
  under?: number[];
  tone?: string;
  underTone?: string;
  label?: string;
};

function xs(n: number): number[] {
  const step = W / (SLOTS - 1);
  return Array.from({ length: n }, (_, i) => W - (n - 1 - i) * step);
}

/** The last minute as a filled curve, newest point on the right edge; empty slots wait on the left. */
export default function SystemSpark({ values, max, height = 36, under, tone = "var(--color-accent)", underTone = "var(--color-cat-meet)", label }: Props) {
  const id = useId();
  const top = max ?? Math.max(1, ...values, ...(under ?? []));
  const range: [number, number] = [0, top];
  const draw = (list: number[]) => (list.length > 1 ? smoothCurve(list.slice(-SLOTS), xs(Math.min(SLOTS, list.length)), height, 3, range) : null);
  const main = draw(values);
  const second = under ? draw(under) : null;
  return (
    <svg viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} className="block w-full" style={{ height }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tone} stopOpacity="0.32" />
          <stop offset="100%" stopColor={tone} stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="0" x2={W} y1={height - 0.5} y2={height - 0.5} stroke="var(--color-edge)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      {second && <path d={second.line} fill="none" stroke={underTone} strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" />}
      {main && (
        <>
          <path d={main.area} fill={`url(#${id})`} />
          <path d={main.line} fill="none" stroke={tone} strokeWidth="1.8" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
