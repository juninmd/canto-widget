import { useCallback, useRef, useState } from "react";
import { errText, type ForgeFilter, type ForgeList, type ForgeLists, type ForgeSection } from "./api";
import { appendPage, NO_FILTER } from "./forge";

const FIRST_PAGES: Record<ForgeSection, number> = { review_requested: 1, assigned: 1, my_prs: 1, my_issues: 1 };

export type ForgeSource = {
  lists: (filter: ForgeFilter, force: boolean) => Promise<ForgeLists>;
  section: (section: ForgeSection, page: number, filter: ForgeFilter) => Promise<ForgeList>;
};

export function useForgeLists(source: ForgeSource) {
  const [lists, setLists] = useState<ForgeLists | null>(null);
  const [filter, setFilter] = useState<ForgeFilter>(NO_FILTER);
  const [loading, setLoading] = useState(false);
  // A new filter hides the old list while it loads; if the search fails, that list and filter come back as they were.
  const [replacing, setReplacing] = useState(false);
  const [loadingMore, setLoadingMore] = useState<ForgeSection | null>(null);
  const [error, setError] = useState("");
  const pages = useRef(FIRST_PAGES);
  // A reply for an older filter must not overwrite the list of the current one.
  const seq = useRef(0);
  const src = useRef(source);
  src.current = source;

  /** `keep` leaves the current list on screen; `force` skips Rust's cache ("atualizar"). */
  const load = useCallback(async (next: ForgeFilter, keep: boolean, force = false) => {
    const id = ++seq.current;
    setError("");
    setLoading(true);
    setReplacing(!keep);
    try {
      const fresh = await src.current.lists(next, force);
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
    async (section: ForgeSection) => {
      const id = seq.current;
      const page = pages.current[section] + 1;
      setLoadingMore(section);
      try {
        const got = await src.current.section(section, page, filter);
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

export type ForgeListsState = ReturnType<typeof useForgeLists>;
