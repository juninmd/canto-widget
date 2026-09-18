/** Placeholder cards while a slow source (Google, GitHub, disk) answers, shaped like the cards they stand for. */
export default function Skeleton({ label, rows = 3 }: { label: string; rows?: number }) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className="space-y-2">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} aria-hidden="true" className="rounded-lg border border-edge bg-ink/60 p-2 motion-safe:animate-pulse">
          <div className="h-3 w-3/4 rounded bg-edge" />
          <div className="mt-2 h-2.5 w-1/2 rounded bg-edge/70" />
        </div>
      ))}
    </div>
  );
}
