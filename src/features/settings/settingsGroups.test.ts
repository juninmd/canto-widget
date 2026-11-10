import { expect, test } from "bun:test";
import { DESKTOP_ONLY_SECTIONS, forPlatform, GROUPS, parseOpenGroups, sectionMatches } from "./settingsGroups";

test("every section lives in exactly one group", () => {
  const all = GROUPS.flatMap((g) => [...g.sections, ...g.sensitive]);
  expect(new Set(all).size).toBe(all.length);
  expect(all.length).toBe(21);
});

test("search ignores accents and case and needs every word", () => {
  expect(sectionMatches("security", "privacy", "SENHA")).toBe(true);
  expect(sectionMatches("security", "privacy", "seguranca")).toBe(true);
  expect(sectionMatches("security", "privacy", "senha agenda")).toBe(false);
  expect(sectionMatches("skin", "appearance", "theme")).toBe(true);
});

test("a group name matches all of its sections", () => {
  expect(sectionMatches("backup", "data", "contas")).toBe(true);
  expect(sectionMatches("update", "app", "contas")).toBe(false);
});

test("saved groups: first one by default, corrupt data and unknown ids are ignored", () => {
  expect(parseOpenGroups(null)).toEqual(["appearance"]);
  expect(parseOpenGroups("{")).toEqual(["appearance"]);
  expect(parseOpenGroups('["data","nope","app"]')).toEqual(["data", "app"]);
  expect(parseOpenGroups("[]")).toEqual([]);
});

test("a phone keeps no window, tray, shortcut, focused-app or updater setting", () => {
  const phone = forPlatform(GROUPS, true);
  const kept = phone.flatMap((g) => [...g.sections, ...g.sensitive]);
  for (const s of DESKTOP_ONLY_SECTIONS) expect(kept).not.toContain(s);
  expect(kept).toContain("backup");
  expect(kept).toContain("security");
  // "app" had only desktop sections, so the group goes away instead of rendering an empty heading.
  expect(phone.map((g) => g.id)).not.toContain("app");
});

test("the desktop keeps every section", () => {
  expect(forPlatform(GROUPS, false)).toBe(GROUPS);
});
