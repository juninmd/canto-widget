import { expect, test } from "bun:test";
import type { PrConvEntry } from "../../lib/api";
import { commentsByLine, filterThreads, groupThreads } from "./prThreads";

const c = (id: number, extra: Partial<PrConvEntry> = {}): PrConvEntry => ({
  id, author: "ana", bot: false, body: `c${id}`, created_at: `2026-11-0${id}T10:00:00Z`, url: "https://github.com/a/b/pull/1", path: "", line: 0, hunk: "", reply: false, thread: "", resolved: false, resolvable: false, ...extra,
});

test("replies join the thread of their first comment and general comments stand alone", () => {
  const list = groupThreads([c(1, { path: "a.ts", line: 3, thread: "1" }), c(2), c(3, { path: "a.ts", line: 3, thread: "1", reply: true })]);
  expect(list.map((t) => [t.root.id, t.replies.map((r) => r.id), t.inline])).toEqual([[1, [3], true], [2, [], false]]);
});

test("filters keep inline threads by state and can leave the bots out", () => {
  const list = groupThreads([
    c(1, { path: "a.ts", line: 1, thread: "1", resolved: true, resolvable: true }),
    c(2, { path: "b.ts", line: 2, thread: "2", resolvable: true }),
    c(3, { bot: true }),
  ]);
  expect(filterThreads(list, "open", true).map((t) => t.root.id)).toEqual([2]);
  expect(filterThreads(list, "resolved", true).map((t) => t.root.id)).toEqual([1]);
  expect(filterThreads(list, "all", false).map((t) => t.root.id)).toEqual([1, 2]);
});

test("inline threads are indexed by file and line for the diff", () => {
  const map = commentsByLine(groupThreads([c(1, { path: "a.ts", line: 3, thread: "1" }), c(2), c(3, { path: "a.ts", line: 0, thread: "3" })]));
  expect([...map.keys()]).toEqual(["a.ts:3"]);
});
