import { expect, test } from "bun:test";
import type { GmailMail, GmailSummary } from "./api";
import { afterAction, leavesView } from "./gmailView";

const mail = (id: string, unread: boolean, starred = false): GmailMail => ({ id, from: id, subject: id, snippet: "", date: 0, link: "", unread, starred });
const S: GmailSummary = { unread: 10, important: [mail("a", true), mail("b", false, true), mail("c", true, true)] };

test("reading leaves the unread views but stays in the inbox, unstarring leaves only the starred view", () => {
  expect(leavesView("important", "read")).toBe(true);
  expect(leavesView("inbox", "read")).toBe(false);
  expect(leavesView("starred", "unstar")).toBe(true);
  expect(leavesView("inbox", "unstar")).toBe(false);
  expect(leavesView("starred", "archive")).toBe(true);
});

test("the unread count follows only the mail that really changed", () => {
  expect(afterAction(S, ["a", "b"], "read", "unread")).toEqual({ unread: 9, important: [mail("c", true, true)] });
  expect(afterAction(S, ["b"], "unread", "inbox").unread).toBe(11);
  expect(afterAction(S, ["a", "c"], "trash", "inbox")).toEqual({ unread: 8, important: [mail("b", false, true)] });
});

test("starring and marking unread change the row in place when it stays in the view", () => {
  const next = afterAction(S, ["a"], "star", "inbox");
  expect(next.important[0]).toEqual(mail("a", true, true));
  expect(afterAction(S, ["b"], "unread", "starred").important[1].unread).toBe(true);
});
