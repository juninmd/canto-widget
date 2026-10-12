import { useCallback, useState } from "react";
import { api, errText, type MentionRow } from "./api";
import type { Forge } from "./forge";
import { useLatestRequest } from "./useLatestRequest";

/** Mentions of one forge; nothing is fetched until the first `load`, so the subtab costs no API calls unopened. */
export function useMentions(forge: Forge) {
  const [rows, setRows] = useState<MentionRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { bump, isLatest } = useLatestRequest();

  const load = useCallback(
    async (force = false) => {
      const id = bump();
      setError("");
      setLoading(true);
      try {
        const got = forge === "github" ? await api.githubMentions(force) : await api.gitlabMentions();
        if (isLatest(id)) setRows(got);
      } catch (e) {
        if (isLatest(id)) setError(errText(e));
      } finally {
        if (isLatest(id)) setLoading(false);
      }
    },
    [forge, bump, isLatest],
  );

  return { rows, loading, error, load, loaded: rows !== null };
}

export type MentionsState = ReturnType<typeof useMentions>;
