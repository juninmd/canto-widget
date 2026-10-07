export type HealthKind = "http" | "tcp" | "dns";
export type HealthState = "unknown" | "up" | "slow" | "down";

/** One endpoint as Rust stores it: flat, with `kind` choosing which of `url`, `host` and `port` apply. */
export type HealthEndpoint = {
  id: string;
  name: string;
  kind: HealthKind;
  url?: string;
  host?: string;
  port?: number;
  every_secs: number;
  limit_ms: number;
  alert_down: boolean;
  alert_slow: boolean;
  alert_cert: boolean;
};

/** `ms` is null when the probe failed (`err` says why); `cert_days` only for DNS endpoints. */
export type HealthSample = { at: number; ms: number | null; err: string | null; cert_days: number | null };
export type HealthView = { endpoint: HealthEndpoint; health: HealthState; samples: HealthSample[] };
