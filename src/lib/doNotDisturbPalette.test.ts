import { expect, mock, test } from "bun:test";

const calls: { cmd: string; args?: { untilMs?: number | null } }[] = [];
mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: { untilMs?: number | null }) => {
    calls.push({ cmd, args });
    return Promise.resolve({ active: cmd === "dnd_set", untilMs: args?.untilMs ?? null });
  },
}));

const { PALETTE_PROVIDERS } = await import("./palette");
const { dndCommands } = await import("./doNotDisturb");

test("do not disturb registers its palette actions once", () => {
  expect(PALETTE_PROVIDERS.filter((p) => p === dndCommands)).toHaveLength(1);
  expect(dndCommands().map((c) => c.title)).toEqual([
    "não perturbe por 1 h",
    "não perturbe até amanhã",
    "desligar não perturbe",
  ]);
});

test("the palette actions call Rust with the end computed in the UI", async () => {
  const [hour, , off] = dndCommands();
  const before = Date.now();
  await hour.run();
  await off.run();
  expect(calls[0].cmd).toBe("dnd_set");
  expect(calls[0].args!.untilMs! - before).toBeGreaterThanOrEqual(60 * 60_000);
  expect(calls[0].args!.untilMs! - before).toBeLessThan(60 * 60_000 + 5_000);
  expect(calls[1].cmd).toBe("dnd_clear");
});
