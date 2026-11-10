import { expect, test } from "bun:test";
import type { AgendaItem } from "../../lib/api";
import { alertFx } from "./alertFxSpec";

const NOW = new Date("2026-11-01T12:00:00Z");
const item = (id: string, extra: Partial<AgendaItem> = {}): AgendaItem => ({ id, title: "x", start: NOW.toISOString(), end: "", all_day: false, location: "", meet: "", link: "", ...extra });

test("every alert family has its own scene and a way to arrive", () => {
  const scenes = {
    meeting: alertFx(item("e1"), NOW).scene,
    task: alertFx(item("task:1"), NOW).scene,
    mention: alertFx(item("mention:1"), NOW).scene,
    model: alertFx(item("model:m"), NOW).scene,
    digest: alertFx(item("digest:morning"), NOW).scene,
    status: alertFx(item("status:gh", { tag: "minor" }), NOW).scene,
    weather: alertFx(item("weather:rain"), NOW).scene,
  };
  expect(scenes).toEqual({ meeting: "rings", task: "ticks", mention: "bubbles", model: "sparks", digest: "rays", status: "pulse", weather: "weather" });
  expect(alertFx(item("task:1"), NOW).enter).toBe("wx-enter-drop");
});

test("a PR's scene follows what happened to it", () => {
  const pr = (tag: string) => alertFx(item("pr:x", { tag }), NOW);
  expect([pr("ci").scene, pr("conflict").scene, pr("approved").scene, pr("comment").scene, pr("stalled").scene]).toEqual(["bugs", "branches", "sparks", "bubbles", "pulse"]);
  expect(pr("ci").enter).toBe("wx-enter-shake");
  expect(pr("ci").intense && !pr("approved").intense).toBe(true);
});

test("a meeting about to start rings faster, a far one stays calm", () => {
  const soon = alertFx(item("e1", { start: new Date(NOW.getTime() + 60_000).toISOString() }), NOW);
  const far = alertFx(item("e2", { start: new Date(NOW.getTime() + 12 * 60_000).toISOString() }), NOW);
  expect([soon.intense, far.intense]).toEqual([true, false]);
});

test("a service that is down arrives shaking and intense; maintenance stays muted", () => {
  const down = alertFx(item("status:gh", { tag: "critical" }), NOW);
  expect([down.enter, down.intense]).toEqual(["wx-enter-shake", true]);
  expect(alertFx(item("status:gh", { tag: "maintenance" }), NOW).intense).toBe(false);
});
