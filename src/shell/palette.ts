/** One action in the command palette; `run` calls the same function the button or shortcut already calls. */
export type PaletteCommand = {
  id: string;
  title: string;
  /** Extra words that match without being shown (e.g. "configurações" for Ajustes). */
  keywords?: string[];
  /** Shortcut shown next to the title, when the action has one. */
  keys?: string[];
  run: () => void | Promise<void>;
};

function fold(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Higher is better; null when `query` isn't a subsequence of `text`. Accents and case never matter. */
export function fuzzyScore(query: string, text: string): number | null {
  const q = fold(query.trim());
  const s = fold(text);
  if (!q) return 0;
  const at = s.indexOf(q);
  if (at === 0) return 1000 - s.length;
  if (at > 0 && /\W/.test(s[at - 1])) return 800 - at;
  if (at > 0) return 600 - at;
  let score = 0;
  let prev = -1;
  for (const ch of q) {
    if (ch === " ") continue;
    const i = s.indexOf(ch, prev + 1);
    if (i < 0) return null;
    // Letters that start a word or follow the previous hit are what a person types to abbreviate.
    if (i === 0 || /\W/.test(s[i - 1])) score += 10;
    else if (i === prev + 1) score += 5;
    else score -= Math.min(i - prev, 10);
    prev = i;
  }
  return score;
}

/** Filters and ranks by the best of title and keywords; ties keep the registration order. Empty query lists all. */
export function rankCommands(commands: readonly PaletteCommand[], query: string): PaletteCommand[] {
  if (!query.trim()) return [...commands];
  const scored: { cmd: PaletteCommand; score: number; order: number }[] = [];
  commands.forEach((cmd, order) => {
    let best: number | null = fuzzyScore(query, cmd.title);
    for (const k of cmd.keywords ?? []) {
      const s = fuzzyScore(query, k);
      // A keyword hit ranks just below the same hit on the visible title.
      if (s !== null && (best === null || s - 1 > best)) best = s - 1;
    }
    if (best !== null) scored.push({ cmd, score: best, order });
  });
  return scored.sort((a, b) => b.score - a.score || a.order - b.order).map((x) => x.cmd);
}

/**
 * Extension point: a feature adds its own actions by pushing a provider here at module load
 * (e.g. `PALETTE_PROVIDERS.push(() => [{ id: "dnd", title: ..., run }])`), without touching App.
 */
export const PALETTE_PROVIDERS: (() => PaletteCommand[])[] = [];
