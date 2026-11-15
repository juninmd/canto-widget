/** Windowing for a list whose rows differ in height: only the rows near the viewport are rendered. */

/** Cumulative tops: `offsets[i]` is where row `i` starts, `offsets[n]` the total height. */
export function offsetsOf(heights: number[]): number[] {
  const out = new Array<number>(heights.length + 1);
  out[0] = 0;
  for (let i = 0; i < heights.length; i++) out[i + 1] = out[i] + heights[i];
  return out;
}

/** The row that holds the pixel `y` (the last one when `y` is past the end). */
export function rowAt(offsets: number[], y: number): number {
  let lo = 0;
  let hi = Math.max(0, offsets.length - 2);
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (offsets[mid] <= y) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/** Rows `[start, end)` to render for a viewport of `height` px scrolled by `top`, with `overscan` rows of margin. */
export function windowRange(offsets: number[], top: number, height: number, overscan: number): [number, number] {
  const n = offsets.length - 1;
  if (n <= 0) return [0, 0];
  const first = rowAt(offsets, Math.max(0, top));
  const last = rowAt(offsets, Math.max(0, top) + Math.max(0, height));
  return [Math.max(0, first - overscan), Math.min(n, last + 1 + overscan)];
}

/** The scroll position that brings row `i` fully into view, or `top` when it already is. */
export function scrollToRow(offsets: number[], i: number, top: number, height: number): number {
  const start = offsets[i] ?? 0;
  const end = offsets[i + 1] ?? start;
  if (start < top) return start;
  if (end > top + height) return Math.max(0, end - height);
  return top;
}
