import { Skeleton as SonidoSkeleton } from "@juninmd/sonido";

/** Placeholder rows while a slow source (Google, GitHub, disk) answers; the shimmer and the announcement are Sonido's. */
export default function Skeleton({ label, rows = 3 }: { label: string; rows?: number }) {
  return <SonidoSkeleton label={label} rows={rows} />;
}
