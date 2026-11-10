import { afterEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, render } from "@testing-library/react";

const item = (id: string) => ({ id, title: `Alerta ${id}`, start: "", end: "", all_day: false, location: "", meet: "", link: "" });
let payload = [item("a1"), item("a2")];
let log = [{ item: item("a0"), outcome: "done", at: 1 }];
let reads = 0;

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string) => {
    reads++;
    // Fresh copies, as the IPC hands back on every call.
    if (cmd === "alert_payload") return Promise.resolve(structuredClone(payload));
    if (cmd === "alert_log") return Promise.resolve(structuredClone(log));
    return Promise.resolve(null);
  },
}));
mock.module("@tauri-apps/api/event", () => ({ listen: () => Promise.resolve(() => {}) }));

const { useAlertList } = await import("./useAlertList");

// Stands in for the app below the hook: React may call the hook's owner once before bailing out,
// but a bail-out never reaches the children, which is where the cost is.
let renders = 0;
function Tree() {
  renders++;
  return null;
}
let seen: ReturnType<typeof useAlertList> | null = null;
function Probe() {
  seen = useAlertList(true);
  return <Tree />;
}

async function focus() {
  await act(async () => {
    window.dispatchEvent(new Event("focus"));
    await new Promise((ok) => setTimeout(ok, 10));
  });
}

afterEach(cleanup);

test("a focus that brings back the same alerts does not re-render the app", async () => {
  render(<Probe />);
  await act(async () => {
    await new Promise((ok) => setTimeout(ok, 10));
  });
  const before = renders;
  const alerts = seen!.alerts;
  for (let i = 0; i < 5; i++) await focus();
  expect(reads).toBeGreaterThanOrEqual(12);
  expect(renders).toBe(before);
  expect(seen!.alerts).toBe(alerts);

  // A real change still comes through.
  payload = [...payload, item("a3")];
  log = [...log, { item: item("a1"), outcome: "done", at: 2 }];
  await focus();
  expect(renders).toBeGreaterThan(before);
  expect(seen!.alerts.map((a) => a.id)).toEqual(["a1", "a2", "a3"]);
  expect(seen!.log.length).toBe(2);
});
