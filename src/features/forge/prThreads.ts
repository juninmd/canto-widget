import type { PrConvEntry } from "../../lib/api";

export type Thread = { key: string; root: PrConvEntry; replies: PrConvEntry[]; id: string; inline: boolean; resolved: boolean; resolvable: boolean };
export type ThreadFilter = "all" | "open" | "resolved";

/** Entries arrive oldest first; replies join the thread of their first comment, general comments stand alone. */
export function groupThreads(entries: PrConvEntry[]): Thread[] {
  const out: Thread[] = [];
  const byId = new Map<string, Thread>();
  for (const e of entries) {
    const held = e.thread ? byId.get(e.thread) : undefined;
    if (held) {
      held.replies.push(e);
      continue;
    }
    const th: Thread = { key: `${e.thread || "c"}-${e.id}`, root: e, replies: [], id: e.thread, inline: e.path !== "", resolved: e.resolved, resolvable: e.resolvable };
    if (e.thread) byId.set(e.thread, th);
    out.push(th);
  }
  return out;
}

export function filterThreads(list: Thread[], filter: ThreadFilter, bots: boolean): Thread[] {
  return list.filter((th) => {
    if (!bots && th.root.bot) return false;
    if (filter === "all") return true;
    return th.inline && (filter === "resolved" ? th.resolved : !th.resolved);
  });
}

/** Inline comments by `path:line`, for the diff to show them where they were left. */
export function commentsByLine(list: Thread[]): Map<string, Thread[]> {
  const out = new Map<string, Thread[]>();
  for (const th of list) {
    if (!th.inline || th.root.line <= 0) continue;
    const key = `${th.root.path}:${th.root.line}`;
    out.set(key, [...(out.get(key) ?? []), th]);
  }
  return out;
}
