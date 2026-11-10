import { expect, test } from "bun:test";
import { blankEndpoint, certDays, chart, draftError, stats, summarize, targetLabel } from "./health";
import type { HealthSample, HealthView } from "./healthTypes";

const s = (ms: number | null, cert_days: number | null = null): HealthSample => ({ at: 0, ms, err: ms === null ? "x" : null, cert_days });

test("stats ignore failed readings and report uptime", () => {
  expect(stats([s(100), s(200), s(null), s(300)])).toEqual({ median: 200, p95: 300, peak: 300, uptime: 75 });
  expect(stats([s(null)])).toBeNull();
  expect(stats([])).toBeNull();
});

test("the chart breaks the line at an outage and marks it", () => {
  const c = chart([s(100), s(120), s(null), s(110)], 500, 372, 150);
  expect(c.line.match(/M/g)?.length).toBe(2);
  expect(c.down).toHaveLength(1);
  expect(c.last).not.toBeNull();
});

test("the limit line and the data share one scale", () => {
  const c = chart([s(100), s(900)], 500, 372, 150);
  const at = (v: number) => c.ticks.find((t) => t.label === v)?.y;
  expect(c.limitY).toBeLessThan(at(0)!);
  expect(c.limitY).toBeGreaterThan(c.last!.y);
});

test("no tail dot when the latest reading failed, and empty data does not throw", () => {
  expect(chart([s(100), s(null)], 500, 372, 150).last).toBeNull();
  expect(chart([], 500, 372, 150).line).toBe("");
});

test("drafts are checked per kind", () => {
  const http = { ...blankEndpoint("http"), name: "API", url: "https://api.exemplo.dev/health" };
  expect(draftError(http)).toBeNull();
  expect(draftError({ ...http, url: "ftp://x" })).toBe("url");
  expect(draftError({ ...http, name: " " })).toBe("name");
  const tcp = { ...blankEndpoint("tcp"), name: "DB", host: "db.interno", port: 5432 };
  expect(draftError(tcp)).toBeNull();
  expect(draftError({ ...tcp, port: 70000 })).toBe("port");
  expect(draftError({ ...tcp, host: "db interno" })).toBe("host");
  expect(blankEndpoint("dns").port).toBe(443);
  expect(blankEndpoint("dns").alert_cert).toBe(true);
});

test("labels and summary", () => {
  expect(targetLabel({ ...blankEndpoint("tcp"), host: "db", port: 5432 })).toBe("db:5432");
  const view = (health: HealthView["health"], days: number | null): HealthView => ({
    endpoint: { ...blankEndpoint("dns"), host: "x.dev" },
    health,
    samples: [s(10, days)],
  });
  expect(summarize([view("down", null), view("slow", 3), view("up", 90)])).toEqual({ down: 1, slow: 1, cert: 1 });
  expect(certDays([s(10, 7)])).toBe(7);
});
