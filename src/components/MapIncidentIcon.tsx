import type { IncidentKind } from "../lib/api";

const PATHS: Record<IncidentKind, string> = {
  accident: "M12 3 2 20h20ZM12 10v4M12 17h.01",
  jam: "M3 9h18v7H3ZM6 9l2-4h8l2 4M7.5 19.5v-2M16.5 19.5v-2",
  works: "M4 20h16M7 20l5-14 5 14M9 14h6",
  closed: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM7 12h10",
  hazard: "M12 3v12M12 19h.01",
};

/** 24×24 stroke icon, colored by `currentColor`, for the pins on the map and the rows under it. */
export default function MapIncidentIcon({ kind, className }: { kind: IncidentKind; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[kind]} />
    </svg>
  );
}
