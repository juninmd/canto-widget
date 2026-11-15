import { useCallback, useEffect, useMemo, useState } from "react";
import { api, errText, type Contributions, type RepoPage } from "../../lib/api";
import type { Forge } from "./forge";
import { mergePages } from "./repos";
import { useLatestRequest } from "../../lib/useLatestRequest";

/** What each forge showed last time, so coming back to the subtab paints at once while the sync runs. */
const seen = new Map<Forge, Map<number, RepoPage>>();
const seenCalendar = new Map<Forge, Contributions>();
/** When the last complete sync ended: opening the subtab again within a minute asks for nothing. */
const syncedAt = new Map<Forge, number>();
const FRESH_MS = 60_000;
/** The tree is rebuilt for every batch that lands: a few pages at a time keep 50 of them from being 50 rebuilds. */
const BATCH = 5;

export const clearReposCache = (forge?: Forge) => {
  for (const m of [seen, seenCalendar, syncedAt] as Map<Forge, unknown>[]) {
    if (forge) m.delete(forge);
    else m.clear();
  }
};

const pageApi = (forge: Forge) => (forge === "github" ? api.githubReposPage : api.gitlabReposPage);

/**
 * Repositories of one forge, a page (100) at a time, and, when `stats` is on, its contribution calendar. Nothing is
 * requested until `active`. Opening paints what Rust already holds (RAM or the sealed disk copy), then walks the pages
 * in order: Rust answers from its cache or asks the forge "changed?" (an ETag, free of rate limit), so a 5,000-repository
 * account costs few real downloads after the first time.
 */
export function useRepos(forge: Forge, active: boolean, stats: boolean) {
  const [pages, setPages] = useState<Map<number, RepoPage>>(() => seen.get(forge) ?? new Map());
  const [calendar, setCalendar] = useState<Contributions | null>(() => seenCalendar.get(forge) ?? null);
  const [syncing, setSyncing] = useState(false);
  const [complete, setComplete] = useState(() => syncedAt.has(forge));
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [error, setError] = useState("");
  const [limitedUntil, setLimitedUntil] = useState<number | null>(null);
  const [calendarError, setCalendarError] = useState("");
  const { bump: bumpList, isLatest: listIsLatest } = useLatestRequest();
  const { bump: bumpCal, isLatest: calIsLatest } = useLatestRequest();

  const load = useCallback(
    async (force = false) => {
      const id = bumpList();
      setError("");
      setLimitedUntil(null);
      setSyncing(true);
      let held = seen.get(forge) ?? new Map<number, RepoPage>();
      const keep = (next: Map<number, RepoPage>) => {
        held = next;
        seen.set(forge, next);
        setPages(next);
      };
      try {
        if (held.size === 0 && !force) {
          const cached = await api.reposCached(forge);
          if (!listIsLatest(id)) return;
          if (cached?.length) keep(new Map(cached.map((p) => [p.page, p])));
        }
        let next = new Map(held);
        for (let n = 1; ; n++) {
          const got = await pageApi(forge)(n, force);
          if (!listIsLatest(id)) return;
          next.set(n, got);
          if (got.limited_until) {
            // The forge told us to stop: what is cached stays on screen, and the rest waits for the limit to lift.
            setLimitedUntil(got.limited_until);
            keep(new Map(next));
            setComplete(false);
            return;
          }
          if (!got.has_next) {
            // The list ends here: pages a longer list once had are gone.
            next = new Map([...next].filter(([k]) => k <= n));
            keep(next);
            syncedAt.set(forge, Date.now());
            setComplete(true);
            return;
          }
          if (n % BATCH === 0) keep(new Map(next));
        }
      } catch (e) {
        if (listIsLatest(id)) setError(errText(e));
      } finally {
        if (listIsLatest(id)) setSyncing(false);
      }
    },
    [forge, bumpList, listIsLatest],
  );

  const loadCalendar = useCallback(
    async (force = false) => {
      const id = bumpCal();
      setCalendarError("");
      setCalendarLoading(true);
      try {
        const got = await (forge === "github" ? api.githubContributions(force) : api.gitlabContributions(force));
        if (!calIsLatest(id)) return;
        seenCalendar.set(forge, got);
        setCalendar(got);
      } catch (e) {
        if (calIsLatest(id)) setCalendarError(errText(e));
      } finally {
        if (calIsLatest(id)) setCalendarLoading(false);
      }
    },
    [forge, bumpCal, calIsLatest],
  );

  useEffect(() => {
    if (!active) return;
    const at = syncedAt.get(forge);
    if (at && Date.now() - at < FRESH_MS) return;
    void load();
  }, [active, forge, load]);
  useEffect(() => {
    if (active && stats) void loadCalendar();
  }, [active, stats, loadCalendar]);

  const refresh = useCallback(() => {
    void load(true);
    if (stats) void loadCalendar(true);
  }, [load, loadCalendar, stats]);

  const repos = useMemo(() => mergePages(pages), [pages]);
  const fetchedAt = pages.get(1)?.fetched_at ?? null;
  // "Not complete" with nothing in flight and no error means the rate limit cut the sync short.
  const partial = !complete && !syncing && !error && repos.length > 0;

  return { repos, loaded: pages.size > 0, fetchedAt, calendar, syncing, partial, loading: syncing || calendarLoading, calendarLoading, error, limitedUntil, calendarError, load, loadCalendar, refresh };
}

export type ReposState = ReturnType<typeof useRepos>;
