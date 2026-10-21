import type { ReactNode } from "react";

export type StateTone = "ok" | "bad" | "warn" | "violet" | "neutral";

const TONE: Record<StateTone, { pill: string; dot: string }> = {
  ok: { pill: "bg-ok/15 text-ok", dot: "bg-ok" },
  bad: { pill: "bg-danger/15 text-danger", dot: "bg-danger" },
  warn: { pill: "bg-warn/15 text-warn", dot: "bg-warn" },
  violet: { pill: "bg-cat-chat/15 text-cat-chat", dot: "bg-cat-chat" },
  neutral: { pill: "bg-edge text-muted", dot: "bg-faint" },
};

/** A state as a word with a dot: the word carries the meaning, the color only reinforces it. */
export default function StatePill({ tone, pulse, children }: { tone: StateTone; pulse?: boolean; children: ReactNode }) {
  const c = TONE[tone];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 text-[10.5px] font-medium leading-[18px] ${c.pill}`}>
      <i aria-hidden="true" className={`size-1.5 rounded-full ${c.dot} ${pulse ? "motion-safe:animate-pulse" : ""}`} />
      {children}
    </span>
  );
}
