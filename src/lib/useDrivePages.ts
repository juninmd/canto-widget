import { useCallback, useEffect, useRef, useState } from "react";
import { api, errText, type DriveFilter, type DriveKind, type DrivePage } from "./api";
import { cachedPage, driveKey, forgetPages, rememberPage } from "./driveCache";

const SEARCH_PAUSE_MS = 350;

/** A Drive listing a page at a time: served from the cache when fresh, the next page appended on demand. */
export function useDrivePages(filter: DriveFilter, kind: DriveKind, search: string, folder: string) {
  const key = driveKey(filter, kind, search, folder);
  const [shown, setShown] = useState<{ key: string; page: DrivePage } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const request = useRef(0);
  const busy = useRef(false);

  const fetchPage = useCallback(
    async (pageToken: string, before: DrivePage | null) => {
      const id = ++request.current;
      busy.current = true;
      setLoading(true);
      try {
        const page = await api.gdriveList(filter, kind, search, folder, pageToken);
        if (id !== request.current) return;
        const merged = before ? { files: [...before.files, ...page.files], next: page.next } : page;
        rememberPage(key, merged);
        setShown({ key, page: merged });
        setError("");
      } catch (e) {
        if (id === request.current) setError(errText(e));
      } finally {
        if (id === request.current) {
          busy.current = false;
          setLoading(false);
        }
      }
    },
    [key, filter, kind, search, folder],
  );

  const reload = useCallback(() => {
    forgetPages();
    void fetchPage("", null);
  }, [fetchPage]);

  useEffect(() => {
    const hit = cachedPage(key);
    if (hit) {
      request.current++;
      busy.current = false;
      setLoading(false);
      setShown({ key, page: hit });
      return;
    }
    const timer = setTimeout(() => void fetchPage("", null), search ? SEARCH_PAUSE_MS : 0);
    return () => clearTimeout(timer);
  }, [key, search, fetchPage]);

  const current = shown?.key === key ? shown.page : null;
  const more = useCallback(() => {
    if (current?.next && !busy.current) void fetchPage(current.next, current);
  }, [current, fetchPage]);

  // `stale`: the files on screen are still the previous folder's or filter's while this one loads.
  const stale = shown !== null && current === null;
  return { files: shown?.page.files ?? null, stale, next: current?.next ?? "", error, loading, reload, more };
}
