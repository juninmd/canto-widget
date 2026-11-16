/** Arrow keys walk the pinned details in reading order and wrap; Home/End jump. `null` = not a navigation key. */
export function nextFocus(key: string, at: number, count: number): number | null {
  if (count === 0) return null;
  switch (key) {
    case "ArrowDown":
    case "ArrowRight":
      return at < 0 ? 0 : (at + 1) % count;
    case "ArrowUp":
    case "ArrowLeft":
      return at < 0 ? count - 1 : (at - 1 + count) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return null;
  }
}
