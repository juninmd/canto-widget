import { expect, test } from "bun:test";
import type { DriveFile } from "./api";
import { dayOf, formatBytes, groupByDay, quotaShare } from "./driveExtras";

const NOW = new Date(2026, 9, 23, 10, 0);
const file = (id: string, modified: string): DriveFile => ({
  id, name: id, kind: "doc", link: "", modified, starred: false, editor: "", folder: "", size: 0,
});

test("a change falls in today, yesterday, this week or before", () => {
  expect(dayOf(new Date(2026, 9, 23, 0, 5).toISOString(), NOW)).toBe("today");
  expect(dayOf(new Date(2026, 9, 22, 23, 50).toISOString(), NOW)).toBe("yesterday");
  expect(dayOf(new Date(2026, 9, 18, 9, 0).toISOString(), NOW)).toBe("week");
  expect(dayOf(new Date(2026, 9, 10).toISOString(), NOW)).toBe("older");
  expect(dayOf("", NOW)).toBe("older");
});

test("files group by day, newest bucket first, keeping their order and skipping empty buckets", () => {
  const groups = groupByDay(
    [file("a", new Date(2026, 9, 1).toISOString()), file("b", NOW.toISOString()), file("c", new Date(2026, 9, 2).toISOString())],
    NOW,
  );
  expect(groups.map((g) => [g.day, g.files.map((f) => f.id)])).toEqual([["today", ["b"]], ["older", ["a", "c"]]]);
});

test("bytes read in binary units and the quota share stays between 0 and 1", () => {
  expect(formatBytes(820 * 1024)).toBe("820 KB");
  expect(formatBytes(4_509_715_660)).toBe("4,2 GB");
  expect(formatBytes(-3)).toBe("0 B");
  expect(formatBytes(16_106_127_360)).toBe("15 GB");
  expect(quotaShare(5, 10)).toBe(0.5);
  expect(quotaShare(20, 10)).toBe(1);
  expect(quotaShare(5, 0)).toBe(0);
});
