import type { DriveFilter, DriveKind, DrivePage } from "./api";

const TTL_MS = 5 * 60_000;
const MAX_ENTRIES = 30;
const pages = new Map<string, { page: DrivePage; at: number }>();

export const driveKey = (filter: DriveFilter, kind: DriveKind, search: string, folder: string) =>
  [folder ? "" : filter, kind, search.trim(), folder].join("|");

/** The pages already loaded for a listing, while still fresh; going back into a folder costs no request. */
export function cachedPage(key: string, now = Date.now()): DrivePage | null {
  const hit = pages.get(key);
  if (!hit || now - hit.at > TTL_MS) return null;
  pages.delete(key);
  pages.set(key, hit);
  return hit.page;
}

/** Keeps the latest listings, dropping the least recently used past the cap. */
export function rememberPage(key: string, page: DrivePage, now = Date.now()) {
  pages.delete(key);
  pages.set(key, { page, at: now });
  while (pages.size > MAX_ENTRIES) pages.delete(pages.keys().next().value as string);
}

export const forgetPages = () => pages.clear();
