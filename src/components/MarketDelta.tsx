import { signedPercent } from "../lib/market";

/** The day's variation as a tinted pill with its arrow; up and down keep their colors whatever the skin's accent. */
export default function MarketDelta({ change, label }: { change: number; label?: string }) {
  const up = change >= 0;
  return (
    <span
      data-market-delta={up ? "up" : "down"}
      className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
        up ? "bg-ok/15 text-ok" : "bg-danger/15 text-danger"
      }`}
    >
      <span aria-hidden="true">{up ? "▲" : "▼"}</span>
      {label ?? `${signedPercent(change)}%`}
    </span>
  );
}
