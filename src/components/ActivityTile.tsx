/** One number with its label and a line of context. */
export default function ActivityTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-edge bg-panel px-2.5 py-2">
      <span className="block text-[10.5px] leading-tight text-faint">{label}</span>
      <b className="mt-0.5 block font-mono text-lg font-bold leading-tight tabular-nums text-fg">{value}</b>
      <span className="mt-0.5 block h-[1.1em] truncate text-[10.5px] leading-[1.1] text-muted">{sub}</span>
    </div>
  );
}
