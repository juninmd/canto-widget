const KEY = "canto.lastExport";
const DAY_MS = 86_400_000;

/** The daily copy lives in the app folder, so only an export is a backup that survives losing the disk or the folder. */
export const STALE_AFTER_DAYS = 30;

export type BackupAge = { kind: "never" } | { kind: "ok" | "stale"; days: number };

export function backupAge(lastExportMs: number | null, now = Date.now()): BackupAge {
  if (lastExportMs === null) return { kind: "never" };
  const days = Math.max(0, Math.floor((now - lastExportMs) / DAY_MS));
  return { kind: days >= STALE_AFTER_DAYS ? "stale" : "ok", days };
}

export function readLastExport(): number | null {
  try {
    const n = Number(localStorage.getItem(KEY));
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

export function markExported(now = Date.now()): void {
  try {
    localStorage.setItem(KEY, String(now));
  } catch {
    // Storage blocked: the reminder just keeps asking.
  }
}
