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

const { syncPrefs, mirrorPref, restart } = await import("./prefsMirror");
const { parseHidden } = await import("./tabs");
let reloads = 0;
restart.now = () => void reloads++;

beforeEach(() => {
  calls.length = 0;
  file = {};
  reloads = 0;
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem("canto.language", "pt-BR");
});
afterEach(() => localStorage.clear());

test("after an update empties the webview's storage, the visible tabs come back from the file", async () => {
  file = { "canto.hiddenTabs": '["gitlab"]', "canto.tabLayout": "vertical" };
  await syncPrefs();
  expect(parseHidden(localStorage.getItem("canto.hiddenTabs"))).toEqual(["gitlab"]);
  expect(localStorage.getItem("canto.tabLayout")).toBe("vertical");
  expect(calls.some((c) => c.cmd === "prefs_set" && c.args.key === "canto.hiddenTabs")).toBe(false);
});

test("other choices (theme, language) come back too, and the page reloads once to show them", async () => {
  localStorage.removeItem("canto.language");
  file = { "canto.skin": "noite", "canto.language": "en", "canto.densidade": "compacta" };
  await syncPrefs();
  expect(localStorage.getItem("canto.skin")).toBe("noite");
  expect(localStorage.getItem("canto.language")).toBe("en");
  expect(reloads).toBe(1);
  await syncPrefs();
  expect(reloads).toBe(1);
});

test("an older copy left in the webview loses to the newer one in the file", async () => {
  localStorage.setItem("canto.hiddenTabs", "[]");
  localStorage.setItem("canto.prefsSavedAt", "100");
  file = { "canto.hiddenTabs": '["notes"]', "canto.prefsSavedAt": "200" };
  await syncPrefs();
  expect(localStorage.getItem("canto.hiddenTabs")).toBe('["notes"]');
  expect(calls.some((c) => c.cmd === "prefs_set" && c.args.key === "canto.hiddenTabs")).toBe(false);
});

test("a choice only the webview has, or a newer one, goes to the file", async () => {
  localStorage.setItem("canto.hiddenTabs", "[]");
  localStorage.setItem("canto.tabLayout", "horizontal");
  localStorage.setItem("canto.prefsSavedAt", "300");
  file = { "canto.tabLayout": "vertical", "canto.prefsSavedAt": "200" };
  await syncPrefs();
  expect(localStorage.getItem("canto.tabLayout")).toBe("horizontal");
  const sent = calls.filter((c) => c.cmd === "prefs_set").map((c) => c.args);
  expect(sent).toContainEqual({ key: "canto.hiddenTabs", value: "[]" });
  expect(sent).toContainEqual({ key: "canto.tabLayout", value: "horizontal" });
  expect(reloads).toBe(0);
});

test("after the sync, any changed choice is stamped and copied to the file", async () => {
  await syncPrefs();
  calls.length = 0;
  // happy-dom's storage is a proxy that skips the prototype; a webview calls it.
  const setItem = (key: string, value: string) => Storage.prototype.setItem.call(localStorage, key, value);
  setItem("canto.skin", "papel");
  setItem("canto.skin", "papel");
  setItem("outra.coisa", "x");
  const keys = calls.filter((c) => c.cmd === "prefs_set").map((c) => c.args.key);
  expect(keys).toEqual(["canto.skin", "canto.prefsSavedAt"]);
  expect(Number(localStorage.getItem("canto.prefsSavedAt"))).toBeGreaterThan(0);
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

test("a file slower than the start still brings the saved tabs back", async () => {
  let answer: (saved: Record<string, string>) => void = () => {};
  file = new Promise((done) => (answer = done));
  await syncPrefs();
  expect(localStorage.getItem("canto.hiddenTabs")).toBeNull();
  answer({ "canto.hiddenTabs": '["gitlab"]' });
  await new Promise((done) => setTimeout(done, 0));
  expect(localStorage.getItem("canto.hiddenTabs")).toBe('["gitlab"]');
  expect(reloads).toBe(1);
});
