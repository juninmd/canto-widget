import { useState } from "react";
import { t } from "../../i18n";

export const GITHUB_EMOJI = ["👍", "👎", "😄", "🎉", "😕", "❤️", "🚀", "👀"];
export const GITLAB_EMOJI = [...GITHUB_EMOJI, "🔥", "✅"];

export type ReactionItem = { emoji: string; count: number; mine: boolean };

/** `{ user, emoji }` pairs (the PR's own list) folded into one pill per emoji, yours marked. */
export function foldReactions(list: { emoji: string; user: string }[], login: string): ReactionItem[] {
  const by = new Map<string, ReactionItem>();
  for (const r of list) {
    const item = by.get(r.emoji) ?? { emoji: r.emoji, count: 0, mine: false };
    item.count += 1;
    item.mine ||= r.user === login;
    by.set(r.emoji, item);
  }
  return [...by.values()];
}

const PILL = "canto-hit inline-flex min-h-[24px] items-center gap-1 rounded-full border px-2 text-[11.5px] disabled:opacity-60";

/** Emoji pills with a count and a picker; a pill toggles your own reaction when `onToggle` knows how to undo it. */
export default function PrReactions({ items, emojis, disabled, onToggle }: { items: ReactionItem[]; emojis: string[]; disabled?: boolean; onToggle: (emoji: string, mine: boolean) => void }) {
  const [picking, setPicking] = useState(false);
  return (
    <div role="group" aria-label={t("forge.pr.reactions")} className="relative flex flex-wrap items-center gap-1.5">
      {items.map((r) => (
        <button key={r.emoji} type="button" disabled={disabled} aria-pressed={r.mine} aria-label={t("forge.pr.reactWith", { emoji: r.emoji })} onClick={() => onToggle(r.emoji, r.mine)} className={`${PILL} ${r.mine ? "border-accent bg-accent/15 font-semibold text-accent-text" : "border-edge bg-panel text-muted hover:text-fg"}`}>
          <span aria-hidden="true">{r.emoji}</span>
          <span className="tabular-nums">{r.count}</span>
        </button>
      ))}
      <button type="button" disabled={disabled} aria-expanded={picking} aria-label={t("forge.pr.react")} title={t("forge.pr.react")} onClick={() => setPicking(!picking)} className={`${PILL} border-edge bg-panel text-muted hover:text-fg`}>
        ☺ +
      </button>
      {picking && (
        <div role="menu" aria-label={t("forge.pr.react")} className="absolute left-0 top-full z-20 mt-1 flex flex-wrap gap-1 rounded-xl border border-edge bg-panel p-1.5 shadow-2xl">
          {emojis.map((e) => (
            <button key={e} type="button" role="menuitem" aria-label={t("forge.pr.reactWith", { emoji: e })} onClick={() => (setPicking(false), onToggle(e, items.some((i) => i.emoji === e && i.mine)))} className="canto-hit grid size-8 place-items-center rounded-lg text-base hover:bg-hover">
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
