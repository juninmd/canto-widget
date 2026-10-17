import { expect, test } from "bun:test";
import { installedCount, releaseDate, releaseSummary } from "./agents";

test("the summary keeps the first lines and drops the markdown the card would show as symbols", () => {
  const notes = [
    "## What's Changed",
    "",
    "- **fix:** the parser of `[links](https://github.com/x)` no longer breaks",
    "- ship the new flag",
    "- a third line",
    "- a fourth line",
    "- a fifth line",
    "- a sixth line",
    "## ⬇️ Downloads",
    "| Linux | x86_64 |",
  ].join("\n");
  const summary = releaseSummary(notes, 4);
  expect(summary.split("\n")).toEqual([
    "What's Changed",
    "• fix: the parser of links no longer breaks",
    "• ship the new flag",
    "• a third line",
  ]);
  expect(summary).not.toContain("Downloads");
});

test("notes empty or already short come out as they are", () => {
  expect(releaseSummary("")).toBe("");
  expect(releaseSummary("one line")).toBe("one line");
  expect(releaseSummary("\n\n  \n")).toBe("");
});

test("a date GitHub did not send is left out instead of rendered as Invalid Date", () => {
  expect(releaseDate("")).toBe("");
  expect(releaseDate("  ")).toBe("");
  expect(releaseDate("não é data")).toBe("");
  expect(releaseDate("2026-10-16T20:53:06Z")).toContain("2026");
});

test("the header counts only the installed ones", () => {
  expect(installedCount([{ installed: true }, { installed: false }, { installed: true }])).toBe(2);
  expect(installedCount([])).toBe(0);
});
