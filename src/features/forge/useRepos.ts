import { useCallback, useEffect, useState } from "react";
import { api, errText, type Contributions, type RepoList } from "../../lib/api";
import type { Forge } from "./forge";
import { useLatestRequest } from "../../lib/useLatestRequest";

/** What each forge showed last time, so coming back to the subtab paints at once while the refresh runs. */
const seen = new Map<Forge, RepoList>();
const seenCalendar = new Map<Forge, Contributions>();

export const clearReposCache = (forge?: Forge) => {
  if (forge) {
    seen.delete(forge);
    seenCalendar.delete(forge);
  } else {
    seen.clear();
    seenCalendar.clear();
  }
};

/**
 * Repositories of one forge and, when `stats` is on, its contribution calendar. Nothing is fetched until `active`,
 * so the subtab costs no API call unopened; the calendar waits for the statistics toggle.
 */
export function useRepos(forge: Forge, active: boolean, stats: boolean) {
  const [list, setList] = useState<RepoList | null>(() => seen.get(forge) ?? null);
  const [calendar, setCalendar] = useState<Contributions | null>(() => seenCalendar.get(forge) ?? null);
  const [loading, setLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [error, setError] = useState("");
  const [calendarError, setCalendarError] = useState("");
  const { bump: bumpList, isLatest: listIsLatest } = useLatestRequest();
  const { bump: bumpCal, isLatest: calIsLatest } = useLatestRequest();

  const load = useCallback(
    async (force = false) => {
      const id = bumpList();
      setError("");
      setLoading(true);
      try {
        const got = await (forge === "github" ? api.githubRepos(force) : api.gitlabRepos(force));
        if (!listIsLatest(id)) return;
        seen.set(forge, got);
        setList(got);
      } catch (e) {
        if (listIsLatest(id)) setError(errText(e));
      } finally {
        if (listIsLatest(id)) setLoading(false);
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
    if (active) void load();
  }, [active, load]);
  useEffect(() => {
    if (active && stats) void loadCalendar();
  }, [active, stats, loadCalendar]);

  const refresh = useCallback(() => {
    void load(true);
    if (stats) void loadCalendar(true);
  }, [load, loadCalendar, stats]);

  return { list, calendar, loading: loading || calendarLoading, listLoading: loading, calendarLoading, error, calendarError, load, loadCalendar, refresh };
}

export type ReposState = ReturnType<typeof useRepos>;
