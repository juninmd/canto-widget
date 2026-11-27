import { expect, test } from "bun:test";
import { parsePatch } from "./patchLines";

test("a patch becomes numbered lines: added ones count on the new side, removed ones on the old", () => {
  const got = parsePatch("@@ -10,3 +20,3 @@\n keep\n-old\n+new\n+more\n\\ No newline at end of file");
  expect(got.map((l) => [l.kind, l.oldNo, l.newNo])).toEqual([
    ["hunk", null, null],
    ["ctx", 10, 20],
    ["del", 11, null],
    ["add", null, 21],
    ["add", null, 22],
  ]);
  expect(got[2].text).toBe("old");
});

test("each hunk restarts the numbering and an empty patch has no lines", () => {
  const got = parsePatch("@@ -1 +1 @@\n-a\n+b\n@@ -40,2 +40,2 @@\n x\n-y\n+z");
  expect(got.filter((l) => l.kind === "ctx")[0].newNo).toBe(40);
  expect(parsePatch("")).toEqual([]);
});
