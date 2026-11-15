import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { Forge } from "./forge";

/** Icons Rust already embedded, by source URL. Shared by every row: an organization's icon is fetched once. */
const have = new Map<string, string>();
/** Icons that failed once this session: the initial stays, and the forge isn't asked again on every scroll. */
const missing = new Set<string>();
const BATCH = 60;

export const clearRepoAvatars = () => {
  have.clear();
  missing.clear();
};

/** Only `data:` images get through: the CSP blocks remote ones, and Rust already embeds them this way. */
const isPhoto = (v: string | undefined): v is string => !!v && v.startsWith("data:image/");

/**
 * Icons for the rows in view. The request waits a beat so a fast scroll doesn't ask for rows it already left, and
 * goes in one batch; a failure keeps the initials.
 */
export function useRepoAvatars(forge: Forge, urls: string[]): (url: string) => string | undefined {
  const [, tick] = useState(0);
  const key = urls.join("\n");
  useEffect(() => {
    const want = [...new Set(key.split("\n"))].filter((u) => u && !have.has(u) && !missing.has(u)).slice(0, BATCH);
    if (want.length === 0) return;
    let alive = true;
    const timer = setTimeout(() => {
      api
        .repoAvatars(forge, want)
        .then((got) => {
          for (const u of want) {
            const v = got?.[u];
            if (isPhoto(v)) have.set(u, v);
            else missing.add(u);
          }
          if (alive) tick((n) => n + 1);
        })
        .catch(() => want.forEach((u) => missing.add(u)));
    }, 150);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [forge, key]);
  return (url) => have.get(url);
}
