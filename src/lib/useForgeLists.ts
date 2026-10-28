import { useCallback, useEffect, useRef, useState } from "react";
import { errText, type ForgeFilter, type ForgeList, type ForgeLists, type ForgeSection } from "./api";
import { appendPage, NO_FILTER, type Forge } from "./forge";
import { patchForgeCache, readForgeCache } from "./forgeCache";
import { useLatestRequest } from "./useLatestRequest";

const FIRST_PAGES: Record<ForgeSection, number> = { review_requested: 1, assigned: 1, my_prs: 1, my_issues: 1 };

export type ForgeSource = {
  lists: (filter: ForgeFilter, force: boolean) => Promise<ForgeLists>;
  section: (section: ForgeSection, page: number, filter: ForgeFilter) => Promise<ForgeList>;
};

export function useForgeLists(source: ForgeSource, forge: Forge) {
  const [seed] = useState(() => readForgeCache(forge));
  const [lists, setLists] = useState<ForgeLists | null>(seed.lists);
  const [filter, setFilter] = useState<ForgeFilter>(seed.filter);
  const [loading, setLoading] = useState(false);
  // A new filter hides the old list while it loads; if the search fails, that list and filter come back as they were.
  const [replacing, setReplacing] = useState(false);
  // Each section paginates on its own: one section's reply must not clear another's "carregando…", and a second
  // click on a section already fetching its next page is ignored (it would ask for the same page twice).
  const [loadingMore, setLoadingMore] = useState<readonly ForgeSection[]>([]);
  const inFlight = useRef(new Map<ForgeSection, object>());
  const [error, setError] = useState("");
  const pages = useRef(FIRST_PAGES);
  // A reply for an older filter must not overwrite the list of the current one.
  const { bump, current: currentId, isLatest } = useLatestRequest();
  const src = useRef(source);
  src.current = source;

  /** `keep` leaves the current list on screen; `force` skips Rust's cache ("atualizar"). */
  const load = useCallback(async (next: ForgeFilter, keep: boolean, force = false) => {
    const id = bump();
    setError("");
    setLoading(true);
    setReplacing(!keep);
    inFlight.current.clear();
    setLoadingMore([]);
    try {
      const fresh = await src.current.lists(next, force);
      if (!isLatest(id)) return;
      pages.current = FIRST_PAGES;
      setFilter(next);
      setLists(fresh);
    } catch (e) {
      if (isLatest(id)) setError(errText(e));
    } finally {
      if (isLatest(id)) {
        setLoading(false);
        setReplacing(false);
      }
    }
  }, []);

  const more = useCallback(
    async (section: ForgeSection) => {
      if (inFlight.current.has(section)) return;
      const token = {};
      inFlight.current.set(section, token);
      const id = currentId();
      const page = pages.current[section] + 1;
      setLoadingMore([...inFlight.current.keys()]);
      try {
        const got = await src.current.section(section, page, filter);
        if (!isLatest(id)) return;
        pages.current = { ...pages.current, [section]: page };
        setLists((l) => (l ? { ...l, [section]: appendPage(l[section], got) } : l));
      } catch (e) {
        if (isLatest(id)) setError(errText(e));
      } finally {
        if (inFlight.current.get(section) === token) {
          inFlight.current.delete(section);
          setLoadingMore([...inFlight.current.keys()]);
        }
      }
    },
    [filter],
  );

  const clear = useCallback(() => {
    bump();
    inFlight.current.clear();
    setLoadingMore([]);
    setLists(null);
    setFilter(NO_FILTER);
    patchForgeCache(forge, { lists: null, filter: NO_FILTER });
  }, [forge]);

  useEffect(() => {
    if (lists) patchForgeCache(forge, { lists, filter });
  }, [forge, lists, filter]);

  return { lists: replacing ? null : lists, filter, seedFilter: seed.filter, loading, loadingMore, error, setError, load, more, clear };
}

export type ForgeListsState = ReturnType<typeof useForgeLists>;
