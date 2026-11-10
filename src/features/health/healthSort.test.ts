import { expect, test } from "bun:test";
import type { HealthEndpoint, HealthSample, HealthView } from "./healthTypes";
import { worstFirst } from "./healthSort";

const ep = (id: string, kind: HealthEndpoint["kind"] = "http"): HealthEndpoint => ({
  id, name: id, kind, every_secs: 60, limit_ms: 500, alert_down: true, alert_slow: true, alert_cert: false,
});
const sample = (cert_days: number | null): HealthSample => ({ at: 0, ms: 20, err: null, cert_days });
const view = (id: string, health: HealthView["health"], samples: HealthSample[] = [], kind: HealthEndpoint["kind"] = "http"): HealthView => ({
  endpoint: ep(id, kind), health, samples,
});

test("endpoints list down, slow, expiring certificate, waiting, then healthy, each group in the order added", () => {
  const sorted = worstFirst([
    view("up1", "up"),
    view("wait", "unknown"),
    view("slow1", "slow"),
    view("cert", "up", [sample(9)], "dns"),
    view("down1", "down"),
    view("up2", "up", [sample(60)], "dns"),
    view("down2", "down"),
  ]).map((v) => v.endpoint.id);
  expect(sorted).toEqual(["down1", "down2", "slow1", "cert", "wait", "up1", "up2"]);
});

test("an HTTP endpoint is never counted as an expiring certificate", () => {
  expect(worstFirst([view("a", "up"), view("b", "up", [sample(3)])]).map((v) => v.endpoint.id)).toEqual(["a", "b"]);
});
