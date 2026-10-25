/**
 * Structural equality for plain IPC data (objects, arrays, primitives). A refresh that brings back
 * the same content can keep the previous reference, so React skips the render and its effects.
 */
export function sameData(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!sameData(a[i], b[i])) return false;
    return true;
  }
  if (Array.isArray(b)) return false;
  const ka = Object.keys(a);
  if (ka.length !== Object.keys(b).length) return false;
  for (const k of ka) {
    if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
    if (!sameData((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])) return false;
  }
  return true;
}

/** Wraps a state setter's next value: returns `prev` when `next` holds the same data. */
export function keepIfSame<T>(prev: T, next: T): T {
  return sameData(prev, next) ? prev : next;
}
