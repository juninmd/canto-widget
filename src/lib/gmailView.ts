import type { GmailAction, GmailMail, GmailSummary, GmailView } from "./api";

/** Whether an action takes the mail out of the view it was listed in, so the row should leave. */
export const leavesView = (view: GmailView, action: GmailAction) =>
  action === "archive" ||
  action === "trash" ||
  (action === "read" && (view === "important" || view === "unread")) ||
  (action === "unstar" && view === "starred");

const patch = (mail: GmailMail, action: GmailAction): GmailMail => {
  if (action === "read" || action === "unread") return { ...mail, unread: action === "unread" };
  if (action === "star" || action === "unstar") return { ...mail, starred: action === "star" };
  return mail;
};

/** The list and the inbox's unread count as Gmail will have them once the action lands, without asking again. */
export function afterAction(summary: GmailSummary, ids: string[], action: GmailAction, view: GmailView): GmailSummary {
  const hit = new Set(ids);
  const touched = summary.important.filter((m) => hit.has(m.id));
  const unread = touched.filter((m) => m.unread).length;
  const delta = action === "unread" ? touched.length - unread : action === "read" || action === "archive" || action === "trash" ? -unread : 0;
  const important = leavesView(view, action)
    ? summary.important.filter((m) => !hit.has(m.id))
    : summary.important.map((m) => (hit.has(m.id) ? patch(m, action) : m));
  return { unread: Math.max(0, summary.unread + delta), important };
}
