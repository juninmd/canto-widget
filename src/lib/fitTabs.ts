const GAP = 2;

/**
 * Which tabs stay on the bar when there is no room for all: as many as fit, in order, leaving space for the "mais"
 * button. The open tab always stays, taking the place of the last one that would have fit.
 */
export function fitTabs(widths: readonly number[], available: number, active: number, moreWidth: number): number[] {
  const all = widths.map((_, i) => i);
  const row = (ids: number[]) => ids.reduce((sum, i) => sum + widths[i], 0) + Math.max(ids.length - 1, 0) * GAP;
  // Nothing measured yet (or no layout at all): showing every tab beats showing none.
  if (available <= 0 || row(all) <= available) return all;

  const room = available - moreWidth - GAP;
  const kept: number[] = [];
  for (const i of all) {
    if (row([...kept, i]) > room) break;
    kept.push(i);
  }
  if (kept.includes(active)) return kept;
  while (kept.length > 0 && row([...kept, active]) > room) kept.pop();
  return [...kept, active];
}
