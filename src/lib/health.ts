import type { HealthEndpoint, HealthKind, HealthSample, HealthView } from "./healthTypes";

export const INTERVALS = [30, 60, 300] as const;
export const LIMITS = [200, 300, 500, 800, 1000, 2000] as const;
/** Same as `CERT_WARN_DAYS` in `health.rs`. */
export const CERT_WARN_DAYS = 14;

export const everyLabel = (secs: number) => (secs >= 60 ? `${secs / 60} min` : `${secs} s`);

export function blankEndpoint(kind: HealthKind): HealthEndpoint {
  return {
    id: "",
    name: "",
    kind,
    url: kind === "http" ? "https://" : undefined,
    host: kind === "http" ? undefined : "",
    port: kind === "tcp" ? undefined : kind === "dns" ? 443 : undefined,
    every_secs: 60,
    limit_ms: 500,
    alert_down: true,
    alert_slow: true,
    alert_cert: kind === "dns",
  };
}

/** The first field that is wrong, or null; Rust validates again, this only avoids a round trip. */
export function draftError(e: HealthEndpoint): "name" | "url" | "host" | "port" | null {
  if (!e.name.trim() || e.name.trim().length > 60) return "name";
  if (e.kind === "http") {
    try {
      const u = new URL((e.url ?? "").trim());
      return u.protocol === "http:" || u.protocol === "https:" ? null : "url";
    } catch {
      return "url";
    }
  }
  if (!/^[A-Za-z0-9._:[\]-]+$/.test((e.host ?? "").trim())) return "host";
  const port = e.port ?? 0;
  return Number.isInteger(port) && port >= 1 && port <= 65535 ? null : "port";
}

export function targetLabel(e: HealthEndpoint): string {
  if (e.kind === "http") return e.url ?? "";
  return `${e.host}:${e.port}`;
}

const pick = (sorted: number[], p: number) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];

export type Stats = { median: number; p95: number; peak: number; uptime: number } | null;

export function stats(samples: HealthSample[]): Stats {
  const ok = samples.flatMap((s) => (s.ms === null ? [] : [s.ms])).sort((a, b) => a - b);
  if (ok.length === 0) return null;
  return { median: pick(ok, 0.5), p95: pick(ok, 0.95), peak: ok[ok.length - 1], uptime: Math.round((ok.length / samples.length) * 1000) / 10 };
}

export const lastOf = (samples: HealthSample[]) => samples[samples.length - 1] ?? null;

/** Days left on the certificate at the latest reading, if any. */
export const certDays = (samples: HealthSample[]) => lastOf(samples)?.cert_days ?? null;

export type Chart = {
  line: string;
  area: string;
  limitY: number;
  ticks: { y: number; label: number }[];
  down: { x: number; w: number }[];
  last: { x: number; y: number } | null;
};

/** One scale for everything drawn: the limit line, the ticks and the points share `max`. */
export function chart(samples: HealthSample[], limit: number, w: number, h: number, pad = { l: 34, r: 8, t: 10, b: 20 }): Chart {
  const values = samples.flatMap((s) => (s.ms === null ? [] : [s.ms]));
  const max = Math.max(limit * 1.15, ...values) * 1.05;
  const bw = w - pad.l - pad.r;
  const bh = h - pad.t - pad.b;
  const n = Math.max(samples.length, 2);
  const x = (i: number) => pad.l + (i / (n - 1)) * bw;
  const y = (v: number) => pad.t + bh - (v / max) * bh;
  const runs: [number, number][][] = [];
  const down: Chart["down"] = [];
  let open = false;
  samples.forEach((s, i) => {
    if (s.ms === null) {
      open = false;
      down.push({ x: x(i) - bw / n / 2, w: bw / n });
      return;
    }
    if (!open) runs.push([]);
    open = true;
    runs[runs.length - 1].push([x(i), y(s.ms)]);
  });
  const pts = (r: [number, number][]) => r.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join("L");
  const base = pad.t + bh;
  const step = max > 1500 ? 500 : max > 700 ? 250 : 100;
  const ticks = [];
  for (let v = 0; v <= max; v += step) ticks.push({ y: y(v), label: v });
  const lastRun = runs[runs.length - 1];
  const tail = lastRun && lastOf(samples)?.ms !== null ? lastRun[lastRun.length - 1] : null;
  return {
    line: runs.map((r) => `M${pts(r)}`).join(""),
    area: runs.map((r) => `M${r[0][0].toFixed(1)},${base}L${pts(r)}L${r[r.length - 1][0].toFixed(1)},${base}Z`).join(""),
    limitY: y(limit),
    ticks,
    down,
    last: tail ? { x: tail[0], y: tail[1] } : null,
  };
}

export type Summary = { down: number; slow: number; cert: number };

export function summarize(views: HealthView[]): Summary {
  const cert = views.filter((v) => v.endpoint.kind === "dns" && (certDays(v.samples) ?? Infinity) <= CERT_WARN_DAYS).length;
  return { down: views.filter((v) => v.health === "down").length, slow: views.filter((v) => v.health === "slow").length, cert };
}
