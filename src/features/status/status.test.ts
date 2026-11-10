import { expect, test } from "bun:test";
import { canAlert, hasRecentIncident, isTroubled, level, sortByLastIncident } from "./status";

const svc = (id: string, times: number[], error: string | null = null) => ({
  id,
  label: id,
  items: times.map((t) => ({ title: id, link: "", published_at: t })),
  error,
});

test("services are ordered by their last incident, newest first; those without any go last in original order", () => {
  const sorted = sortByLastIncident([svc("a", []), svc("b", [100, 300]), svc("c", [200]), svc("d", [], "falhou"), svc("e", [])]);
  expect(sorted.map((s) => s.id)).toEqual(["b", "c", "a", "d", "e"]);
});

test("an incident in the last 24h marks the service as having problems", () => {
  const now = 10 * 24 * 3600_000;
  expect(hasRecentIncident(svc("a", [now - 3600_000]), now)).toBe(true);
  expect(hasRecentIncident(svc("a", [now - 25 * 3600_000]), now)).toBe(false);
  expect(hasRecentIncident(svc("a", []), now)).toBe(false);
});

test("the live Statuspage indicator wins over the 24h history rule", () => {
  const now = 10 * 24 * 3600_000;
  const recent = svc("a", [now - 3600_000]);
  expect(isTroubled({ ...recent, live: { indicator: "none", description: "All Systems Operational" } }, now)).toBe(false);
  expect(isTroubled({ ...svc("b", []), live: { indicator: "major", description: "Partial Outage" } }, now)).toBe(true);
  expect(isTroubled({ ...svc("c", []), live: { indicator: "maintenance", description: "Scheduled" } }, now)).toBe(false);
  expect(isTroubled(recent, now)).toBe(true);
});

test("a component whose latest update says it recovered is not trouble (Magalu Cloud / Site24x7 feeds)", () => {
  const now = 10 * 24 * 3600_000;
  const item = (title: string, ago: number) => ({ title, link: "", published_at: now - ago });
  const magalu = (items: ReturnType<typeof item>[]) => ({ id: "magalu", label: "Magalu Cloud", items, error: null });
  expect(hasRecentIncident(magalu([item("Block Storage - Operational", 3600_000)]), now)).toBe(false);
  expect(hasRecentIncident(magalu([item("Block Storage - Operacional", 3600_000)]), now)).toBe(false);
  expect(
    hasRecentIncident(magalu([item("Block Storage - Operational", 600_000), item("Block Storage - Major Outage", 3600_000)]), now),
  ).toBe(false);
  expect(
    hasRecentIncident(magalu([item("Block Storage - Operational", 600_000), item("Kubernetes - Degraded Performance", 3600_000)]), now),
    "another component is still degraded",
  ).toBe(true);
  expect(hasRecentIncident(magalu([item("Block Storage - Major Outage", 600_000)]), now)).toBe(true);
  expect(
    hasRecentIncident(
      magalu([item("Magalu Cloud - Docs - Operational", 600_000), item("Magalu Cloud - API - Major Outage", 3600_000)]),
      now,
    ),
    "API and Docs are different components even though both names contain a dash",
  ).toBe(true);
});

test("the real Magalu Cloud feed of 2026-09-23 (all components Operational) is not trouble", () => {
  const now = Date.parse("2026-09-23T15:00:00-03:00");
  const at = (d: string) => Date.parse(d);
  const feed = [
    ["Block Storage - Operational", "2026-09-17T02:00:00-03:00"],
    ["Block Storage - Operational", "2026-09-23T02:00:00-03:00"],
    ["DBaaS - Operational", "2026-09-23T02:00:00-03:00"],
    ["Magalu Cloud - API - Operational", "2026-09-21T15:00:00-03:00"],
    ["Magalu Cloud - Console - Operational", "2026-09-23T06:00:00-03:00"],
    ["Object Storage - Operational", "2026-09-23T02:00:00-03:00"],
    ["Virtual Machine - Operational", "2026-09-23T02:00:00-03:00"],
    ["k8s - Operational", "2026-09-23T02:00:00-03:00"],
  ].map(([title, date]) => ({ title, link: "https://status.magalu.cloud", published_at: at(date) }));
  expect(hasRecentIncident({ id: "magalu", label: "Magalu Cloud", items: feed, error: null }, now)).toBe(false);
});

test("Google Cloud's RESOLVED titles are not trouble", () => {
  const now = 10 * 24 * 3600_000;
  const gcp = {
    id: "gcp",
    label: "Google Cloud",
    items: [{ title: "RESOLVED: Multiple products in us-central1-b are experiencing network service degradation.", link: "", published_at: now - 3600_000 }],
    error: null,
  };
  expect(hasRecentIncident(gcp, now)).toBe(false);
});

test("level: live indicator first, then feed errors, then the history rule", () => {
  const now = 10 * 24 * 3600_000;
  const live = (indicator: "none" | "minor" | "major" | "critical" | "maintenance") => ({
    ...svc("s", []),
    live: { indicator, description: "" },
  });
  expect(level(live("critical"), now)).toBe("down");
  expect(level(live("major"), now)).toBe("down");
  expect(level(live("minor"), now)).toBe("degraded");
  expect(level(live("maintenance"), now)).toBe("maintenance");
  expect(level(live("none"), now)).toBe("ok");
  expect(level(svc("e", [], "sem resposta"), now)).toBe("unknown");
  expect(level(svc("r", [now - 3600_000]), now)).toBe("recent");
  expect(level(svc("q", [now - 30 * 3600_000]), now)).toBe("ok");
  expect(canAlert(live("none"))).toBe(true);
  expect(canAlert(svc("x", []))).toBe(false);
});
