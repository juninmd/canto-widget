import { api } from "./api";

/**
 * Every interface choice (`canto.*` in the webview's storage) also lives in a file next to the vault: an update can
 * empty the webview's storage, or bring back an older copy of it, and the theme, language, tabs and the rest went with it.
 */
const PREFIX = "canto.";
/** When a person last changed a choice; the newer side wins, and the file wins a tie (it is written with fsync). */
const STAMP = "canto.prefsSavedAt";
const WAIT_MS = 1500;
/** Survives the reload below, so a storage that refuses writes can't reload forever. */
const RELOADED = "canto.prefsReloaded";

/** Called after each local write; a failure only means the file keeps its previous copy. */
export function mirrorPref(key: string, value: string) {
  void api.prefsSet(key, value).catch(() => {});
}

/** Swapped in tests: the page can't reload under bun. */
export const restart = { now: () => location.reload() };

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function localKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(PREFIX) && key !== STAMP) keys.push(key);
  }
  return keys;
}

/** The newer copy wins key by key; what only one side has goes to the other. Says whether the webview's copy changed. */
function merge(saved: Record<string, string>): boolean {
  const fileWins = Number(saved[STAMP] ?? 0) >= Number(read(STAMP) ?? 0);
  let restored = false;
  for (const key of new Set([...Object.keys(saved), ...localKeys()])) {
    if (!key.startsWith(PREFIX) || key === STAMP) continue;
    const local = read(key);
    const file = typeof saved[key] === "string" ? saved[key] : null;
    if (file === local) continue;
    if (file !== null && (local === null || fileWins)) {
      localStorage.setItem(key, file);
      restored = true;
    } else if (local !== null) {
      mirrorPref(key, local);
    }
  }
  const stamp = fileWins ? saved[STAMP] : read(STAMP);
  if (stamp) {
    if (fileWins) localStorage.setItem(STAMP, stamp);
    else mirrorPref(STAMP, stamp);
  }
  return restored;
}

let watching = false;

/** From now on each changed choice is stamped and copied to the file, whichever module wrote it. */
function watch() {
  if (watching) return;
  watching = true;
  const proto = Object.getPrototypeOf(localStorage) as Storage;
  const set = proto.setItem;
  proto.setItem = function (this: Storage, key: string, value: string) {
    const changed = this === localStorage && key.startsWith(PREFIX) && key !== STAMP && this.getItem(key) !== String(value);
    set.call(this, key, value);
    if (!changed) return;
    const stamp = String(Date.now());
    set.call(this, STAMP, stamp);
    mirrorPref(key, String(value));
    mirrorPref(STAMP, stamp);
  };
}

/** Theme, language and tabs are read while the modules load, so a restored copy only shows after a reload (once per start). */
function apply(saved: Record<string, string>) {
  if (!merge(saved)) return;
  if (sessionStorage.getItem(RELOADED)) return;
  sessionStorage.setItem(RELOADED, "1");
  restart.now();
}

/**
 * Runs before the first render, waiting at most `WAIT_MS` for the file. A file slower than that (the first start
 * after an update is the slow one) still lands. Writes made before the file answered aren't stamped, so the file
 * wins over the defaults shown meanwhile.
 */
export async function syncPrefs(): Promise<void> {
  const pending = api.prefsGet().catch(() => null);
  const first = await Promise.race([pending.then((saved) => ({ saved })), new Promise<null>((done) => setTimeout(() => done(null), WAIT_MS))]);
  const land = (saved: Record<string, string> | null) => {
    try {
      if (saved) apply(saved);
    } catch {
      // No storage: the defaults stay, as on a fresh install.
    }
    watch();
  };
  if (first) return land(first.saved);
  void pending.then(land);
}
