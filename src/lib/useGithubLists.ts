import { useCallback, useRef, useState } from "react";
import { api, errText, type GithubFilter, type GithubLists, type GithubSection } from "./api";
import { appendPage, NO_FILTER } from "./github";

const FIRST_PAGES: Record<GithubSection, number> = { review_requested: 1, assigned: 1, my_prs: 1, my_issues: 1 };

export function useGithubLists() {
  const [lists, setLists] = useState<GithubLists | null>(null);
  const [filter, setFilter] = useState<GithubFilter>(NO_FILTER);
  const [loading, setLoading] = useState(false);
  // A new filter hides the old list while it loads; if the search fails, that list and filter come back as they were.
  const [replacing, setReplacing] = useState(false);
  const [loadingMore, setLoadingMore] = useState<GithubSection | null>(null);
  const [error, setError] = useState("");
  const pages = useRef(FIRST_PAGES);
  // A reply for an older filter must not overwrite the list of the current one.
  const seq = useRef(0);

  const load = useCallback(async (next: GithubFilter, keep: boolean) => {
    const id = ++seq.current;
    setError("");
    setLoading(true);
    setReplacing(!keep);
    try {
      const fresh = await api.githubLists(next);
      if (id !== seq.current) return;
      pages.current = FIRST_PAGES;
      setFilter(next);
      setLists(fresh);
    } catch (e) {
      if (id === seq.current) setError(errText(e));
    } finally {
      if (id === seq.current) {
        setLoading(false);
        setReplacing(false);
      }
    }
  }, []);

  const more = useCallback(
    async (section: GithubSection) => {
      const id = seq.current;
      const page = pages.current[section] + 1;
      setLoadingMore(section);
      try {
        const got = await api.githubSection(section, page, filter);
        if (id !== seq.current) return;
        pages.current = { ...pages.current, [section]: page };
        setLists((l) => (l ? { ...l, [section]: appendPage(l[section], got) } : l));
      } catch (e) {
        if (id === seq.current) setError(errText(e));
      } finally {
        setLoadingMore(null);
      }
    },
    [filter],
  );

  const clear = useCallback(() => {
    seq.current++;
    setLists(null);
  }, []);

  return { lists: replacing ? null : lists, filter, loading, loadingMore, error, setError, load, more, clear };
}
