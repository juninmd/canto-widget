import { expect, test } from "bun:test";
import { hasRecentIncident, sortByLastIncident } from "./status";

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
