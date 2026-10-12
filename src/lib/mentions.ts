import type { MentionRow } from "./api";

export type MentionView = { text: string; unreadOnly: boolean; showMuted: boolean };

export const ALL_MENTIONS: MentionView = { text: "", unreadOnly: false, showMuted: false };

const fold = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

/** What the row says about itself: title, where it lives, who wrote it and what. */
function haystack(r: MentionRow): string {
  return fold([r.title, r.reference, r.sender?.login, r.sender?.name, r.preview].filter(Boolean).join(" "));
}

/** Each word of the search must show up somewhere in the row, ignoring case and accents. */
export function filterMentions(rows: MentionRow[], view: MentionView): MentionRow[] {
  const words = fold(view.text).split(/\s+/).filter(Boolean);
  return rows.filter((r) => {
    if (r.muted && !view.showMuted) return false;
    if (view.unreadOnly && !r.unread) return false;
    const text = words.length ? haystack(r) : "";
    return words.every((w) => text.includes(w));
  });
}

export const countUnread = (rows: MentionRow[]) => rows.filter((r) => r.unread && !r.muted && !r.done).length;
export const countMuted = (rows: MentionRow[]) => rows.filter((r) => r.muted).length;

/** The same rows after the user read, muted or unmuted something, without waiting for the forge again. */
export function patchRows(rows: MentionRow[], change: (r: MentionRow) => Partial<MentionRow> | null): MentionRow[] {
  return rows.map((r) => {
    const patch = change(r);
    return patch ? { ...r, ...patch } : r;
  });
}
