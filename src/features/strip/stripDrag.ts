/** Pixels the pointer must travel before a press on the pill becomes a drag (below that it is still a click). */
export const DRAG_SLOP = 4;

export type DragSend = (grab: number, commit: boolean) => Promise<unknown>;

/**
 * Dragging the pill along the screen edge. The app reads the real cursor (the window moves under it), so the page
 * only says "still dragging" and where the pill was held; the drop saves the place. `moved()` tells the click that
 * follows a drop to stand down.
 */
export function createPillDrag(send: DragSend) {
  let press: { x: number; grab: number } | null = null;
  let dragging = false;
  let busy = false;
  let swallow = false;
  const tell = (grab: number, commit: boolean) => send(grab, commit).catch(() => {});
  return {
    down(x: number, center: number) {
      press = { x, grab: x - center };
      dragging = false;
      swallow = false;
    },
    /** True once the press has become a drag (the caller captures the pointer then). */
    move(x: number): boolean {
      if (!press) return false;
      if (!dragging && Math.abs(x - press.x) < DRAG_SLOP) return false;
      dragging = true;
      if (!busy) {
        busy = true;
        void tell(press.grab, false).then(() => {
          busy = false;
        });
      }
      return true;
    },
    up() {
      if (press && dragging) {
        swallow = true;
        void tell(press.grab, true);
      }
      press = null;
      dragging = false;
    },
    /** Whether the click that ends a drag must be ignored (it is read once). */
    moved(): boolean {
      const was = swallow;
      swallow = false;
      return was;
    },
  };
}
