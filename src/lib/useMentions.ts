import { useCallback, useState } from "react";
import { api, errText, type MentionRow, type MentionsReply } from "./api";
import type { Forge } from "./forge";
import { patchRows } from "./mentions";
import { useLatestRequest } from "./useLatestRequest";

/** Mentions of one forge; nothing is fetched until the first `load`, so the subtab costs no API calls unopened. */
export function useMentions(forge: Forge) {
  const [reply, setReply] = useState<MentionsReply | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [includeDone, setIncludeDone] = useState(false);
  const { bump, isLatest } = useLatestRequest();

  const load = useCallback(
    async (force = false, done = includeDone) => {
      const id = bump();
      setError("");
      setLoading(true);
      try {
        const got = forge === "github" ? await api.githubMentions(force) : await api.gitlabMentions(done);
        if (isLatest(id)) setReply(got);
      } catch (e) {
        if (isLatest(id)) setError(errText(e));
      } finally {
        if (isLatest(id)) setLoading(false);
      }
    },
    [forge, bump, isLatest, includeDone],
  );

  /** Shows the change at once and tells Rust; if Rust refuses, the list comes back as the forge has it. */
  const apply = useCallback(
    async (change: (r: MentionRow) => Partial<MentionRow> | null, save: () => Promise<number>) => {
      setReply((r) => r && { ...r, rows: patchRows(r.rows, change) });
      try {
        const unread = await save();
        setReply((r) => r && { ...r, unread });
      } catch (e) {
        setError(errText(e));
        void load();
      }
    },
    [load],
  );

  const markRead = (ids: string[], read: boolean) => apply((r) => (ids.includes(r.id) && !r.done ? { unread: !read } : null), () => api.mentionRead(ids, read));
  const muteThread = (row: MentionRow, muted: boolean) =>
    apply((r) => (r.url === row.url ? { muted } : null), () => api.mentionMuteThread(row.url, row.title, muted));
  const muteAuthor = (login: string, muted: boolean) =>
    apply((r) => (r.sender?.login.toLowerCase() === login.toLowerCase() ? { muted } : null), () => api.mentionMuteAuthor(login, muted));
  const toggleDone = (value: boolean) => {
    setIncludeDone(value);
    void load(false, value);
  };

  return { reply, rows: reply?.rows ?? null, loading, error, load, loaded: reply !== null, markRead, muteThread, muteAuthor, includeDone, toggleDone };
}

export type MentionsState = ReturnType<typeof useMentions>;
