import { afterEach, beforeEach, expect, mock, test } from "bun:test";

type Call = { cmd: string; args: Record<string, unknown> };
const calls: Call[] = [];
let file: Record<string, string> | "fail" | Promise<Record<string, string>> = {};

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: Record<string, unknown> = {}) => {
    calls.push({ cmd, args });
    if (file === "fail") return Promise.reject("sem arquivo");
    return Promise.resolve(cmd === "prefs_get" ? file : null);
  },
}));

const { syncPrefs, mirrorPref, PREFS_RESTORED } = await import("./prefsMirror");
const { parseHidden, useHiddenTabs } = await import("./tabs");
const { act, renderHook } = await import("@testing-library/react");

beforeEach(() => {
  calls.length = 0;
  file = {};
  localStorage.clear();
  localStorage.setItem("canto.language", "pt-BR");
});
afterEach(() => localStorage.clear());

test("after an update empties the webview's storage, the visible tabs come back from the file", async () => {
  file = { "canto.hiddenTabs": '["gitlab"]', "canto.tabLayout": "vertical" };
  await syncPrefs();
  expect(parseHidden(localStorage.getItem("canto.hiddenTabs"))).toEqual(["gitlab"]);
  expect(localStorage.getItem("canto.tabLayout")).toBe("vertical");
  expect(calls.some((c) => c.cmd === "prefs_set")).toBe(false);
});

test("a choice only the webview has goes to the file; where both exist the webview wins", async () => {
  localStorage.setItem("canto.hiddenTabs", "[]");
  localStorage.setItem("canto.tabLayout", "horizontal");
  file = { "canto.tabLayout": "vertical" };
  await syncPrefs();
  expect(localStorage.getItem("canto.tabLayout")).toBe("horizontal");
  const sent = calls.filter((c) => c.cmd === "prefs_set").map((c) => c.args);
  expect(sent).toContainEqual({ key: "canto.hiddenTabs", value: "[]" });
  expect(sent).toContainEqual({ key: "canto.tabLayout", value: "horizontal" });
});

test("a missing file leaves the webview's storage alone and never blocks the start", async () => {
  localStorage.setItem("canto.hiddenTabs", '["notes"]');
  file = "fail";
  await syncPrefs();
  expect(localStorage.getItem("canto.hiddenTabs")).toBe('["notes"]');
  mirrorPref("canto.hiddenTabs", "[]");
  await Promise.resolve();
  expect(calls.at(-1)).toEqual({ cmd: "prefs_set", args: { key: "canto.hiddenTabs", value: "[]" } });
});

test("a file slower than the start still brings the saved tabs back, replacing the defaults on screen", async () => {
  let answer: (saved: Record<string, string>) => void = () => {};
  file = new Promise((done) => (answer = done));
  await syncPrefs();
  const { result } = renderHook(() => useHiddenTabs());
  expect(result.current[0]).toContain("steam");
  expect(localStorage.getItem("canto.knownTabs")).toBeNull();
  const restored = new Promise((done) => window.addEventListener(PREFS_RESTORED, done, { once: true }));
  await act(async () => {
    answer({ "canto.hiddenTabs": '["gitlab"]', "canto.knownTabs": JSON.stringify(parseHidden(null).concat("github", "notes")) });
    await restored;
  });
  expect(result.current[0]).toEqual(["gitlab"]);
});
