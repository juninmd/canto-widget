import { expect, test } from "bun:test";
import { hasRecentIncident, isTroubled, sortByLastIncident } from "./status";

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
