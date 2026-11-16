import type { ForgeItem } from "../../lib/api";

const KEY = "canto.forge.seen";
const MAX = 300;

/** Comment count of each item (by URL) the last time the user looked at it. */
export type Seen = Record<string, number>;

export function parseSeen(raw: string | null): Seen {
  try {
    const map: unknown = raw ? JSON.parse(raw) : {};
    if (typeof map !== "object" || map === null || Array.isArray(map)) return {};
    return Object.fromEntries(Object.entries(map).filter(([, n]) => typeof n === "number"));
  } catch {
    return {};
  }
}

export function loadSeen(): Seen {
  try {
    return parseSeen(localStorage.getItem(KEY));
  } catch {
    return {};
  }
}

function save(seen: Seen): Seen {
  const bounded = Object.fromEntries(Object.entries(seen).slice(-MAX));
  try {
    localStorage.setItem(KEY, JSON.stringify(bounded));
  } catch {
    /* private mode: the badges only last until the tab reloads */
  }
  return bounded;
}

/** An item seen for the first time starts from its current count, so only later activity shows up as news. */
export function rememberItems(items: ForgeItem[]): Seen {
  const seen = loadSeen();
  const fresh = items.filter((it) => !(it.url in seen));
  if (fresh.length === 0) return seen;
  return save({ ...seen, ...Object.fromEntries(fresh.map((it) => [it.url, it.comments])) });
}

export const markSeen = (item: ForgeItem): Seen => save({ ...loadSeen(), [item.url]: item.comments });

/** Comments added since the user last opened the item; zero for an item never seen. */
export const newComments = (seen: Seen, item: ForgeItem): number => Math.max(0, item.comments - (seen[item.url] ?? item.comments));
