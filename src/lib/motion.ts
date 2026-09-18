import { useCallback, useRef, useState } from "react";

/** Exit 50ms shorter than the 200ms entrance (NN/g). */
export const EXIT_MS = 150;

/** 0 when the system asks for less motion or doesn't say: the item leaves instantly (WCAG 2.3.3). */
export function exitDuration(): number {
  const canAnimate = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: no-preference)").matches;
  return canAnimate ? EXIT_MS : 0;
}

/**
 * Keeps the item on screen during the exit animation before running the removal.
 * A repeated click on the same item during the exit doesn't trigger the removal twice.
 */
export function useExit() {
  const [leaving, setLeaving] = useState<ReadonlySet<string>>(new Set());
  const inProgress = useRef(new Set<string>());

  const leave = useCallback(async (id: string, remove: () => Promise<unknown>) => {
    if (inProgress.current.has(id)) return;
    inProgress.current.add(id);
    const ms = exitDuration();
    try {
      if (ms) {
        setLeaving((s) => new Set(s).add(id));
        await new Promise((r) => setTimeout(r, ms));
      }
      await remove();
    } finally {
      inProgress.current.delete(id);
      setLeaving((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
    }
  }, []);

  return { leaving, leave };
}

/**
 * Ids that appeared after the first load of a context (day, search). Animating the whole
 * list on every tab, day or search change would be noise; only what the user just created
 * or undid deserves to enter with motion. `context` is `null` until the first load.
 */
export function useNewIds(ids: readonly string[], context: string | null): (id: string) => boolean {
  const base = useRef<{ context: string; seen: Set<string>; fresh: Set<string> } | null>(null);
  if (context !== null) {
    const current = base.current;
    if (current === null || current.context !== context) {
      base.current = { context, seen: new Set(ids), fresh: new Set() };
    } else {
      // Only keeps what's in the list: a widget open for days doesn't accumulate stale ids.
      const present = new Set(ids);
      const fresh = new Set([...current.fresh].filter((id) => present.has(id)));
      for (const id of ids) if (!current.seen.has(id)) fresh.add(id);
      base.current = { context, seen: present, fresh };
    }
  }
  const fresh = base.current?.fresh;
  return (id) => fresh?.has(id) ?? false;
}

export const ENTER_CLASS = "motion-safe:animate-entrar motion-reduce:animate-fade";
export const EXIT_CLASS = "pointer-events-none motion-safe:animate-sair";
