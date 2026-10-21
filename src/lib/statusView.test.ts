import { expect, test } from "bun:test";
import type { StatusResult } from "./api";
import { bySeverity, countLevels, matchesFilter } from "./statusView";

const NOW = 1_800_000_000_000;
const svc = (id: string, live?: string, items: StatusResult["items"] = [], error: string | null = null): StatusResult =>
  ({ id, label: id, items, error, ...(live ? { live: { indicator: live, description: live } } : {}) }) as StatusResult;

const down = svc("down", "major");
const down2 = svc("down2", "critical");
const degraded = svc("degraded", "minor");
const recent = svc("recent", undefined, [{ title: "Elevated errors", link: "", published_at: NOW - 3_600_000 }]);
const maintenance = svc("maint", "maintenance");
const ok = svc("ok", "none");
const ok2 = svc("ok2");
const broken = svc("broken", undefined, [], "sem resposta");

test("services sort down, degraded or recent, maintenance, ok, then unreachable, keeping the incoming order inside a rung", () => {
  const sorted = bySeverity([ok, broken, maintenance, recent, ok2, down, degraded, down2], NOW).map((r) => r.id);
  expect(sorted).toEqual(["down", "down2", "recent", "degraded", "maint", "ok", "ok2", "broken"]);
});

test("sorting does not touch the list it was given", () => {
  const input = [ok, down];
  bySeverity(input, NOW);
  expect(input.map((r) => r.id)).toEqual(["ok", "down"]);
});

test("filters group down, degraded and recent as 'problems'; maintenance and ok stand alone", () => {
  expect(matchesFilter("all", "unknown")).toBe(true);
  expect(["down", "degraded", "recent"].every((l) => matchesFilter("problems", l as never))).toBe(true);
  expect(matchesFilter("problems", "maintenance")).toBe(false);
  expect(matchesFilter("ok", "ok")).toBe(true);
  expect(matchesFilter("ok", "unknown")).toBe(false);
  expect(matchesFilter("maintenance", "maintenance")).toBe(true);
});

test("counts feed the chips and the proportional bar", () => {
  const counts = countLevels([down, down2, degraded, recent, maintenance, ok, ok2, broken], NOW);
  expect(counts).toEqual({ all: 8, problems: 4, ok: 2, maintenance: 1, down: 2, warn: 2, unknown: 1 });
});
