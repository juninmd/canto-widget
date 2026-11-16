import type { PrChecks } from "../../lib/api";
import { checkKey } from "./forgeChecks";

const KEY = "canto.ciWatch";
/** Stored titles are for the toast only; the map stays small because a watch ends when the CI does. */
const MAX_WATCHED = 30;

export type Watched = Record<string, string>;
export type Settled = { key: string; title: string; ok: boolean };

export function loadWatched(): Watched {
  try {
    const map: unknown = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    if (typeof map !== "object" || map === null || Array.isArray(map)) return {};
    return Object.fromEntries(Object.entries(map).filter(([, title]) => typeof title === "string")) as Watched;
  } catch {
    return {};
  }
}

function save(map: Watched) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* private mode: the watch lasts until reload */
  }
}

/** Merges into what is stored now, so two mounted lists cannot drop each other's watches. */
export function toggleWatch(repo: string, number: number, title: string): boolean {
  const key = checkKey(repo, number);
  const map = loadWatched();
  if (key in map) delete map[key];
  else if (Object.keys(map).length < MAX_WATCHED) map[key] = title;
  else return false;
  save(map);
  return key in map;
}

/** Watched PRs whose CI just ended, removed from the store; a PR still running (or unknown) stays watched. */
export function takeSettled(results: PrChecks[]): Settled[] {
  const map = loadWatched();
  const done: Settled[] = [];
  for (const r of results) {
    const key = checkKey(r.repo, r.number);
    if (!(key in map) || (r.status !== "success" && r.status !== "failure")) continue;
    done.push({ key, title: map[key], ok: r.status === "success" });
    delete map[key];
  }
  if (done.length > 0) save(map);
  return done;
}
