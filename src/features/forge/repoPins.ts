const KEY = "canto.forge.repos.pins";

export const repoKey = (r: { id: string; full_name: string }) => r.id || r.full_name;

export function loadPins(): Set<string> {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return new Set(Array.isArray(raw) ? raw.filter((k): k is string => typeof k === "string") : []);
  } catch {
    return new Set();
  }
}

/** Flips one repository and returns the new set; a blocked storage only forgets the pins on reload. */
export function togglePin(pins: Set<string>, key: string): Set<string> {
  const next = new Set(pins);
  if (!next.delete(key)) next.add(key);
  try {
    localStorage.setItem(KEY, JSON.stringify([...next]));
  } catch {
    /* the pin lasts until the tab reloads */
  }
  return next;
}
