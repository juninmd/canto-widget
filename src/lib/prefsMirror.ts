import { api } from "./api";

/** The choices that also live in a file next to the vault, so an update that empties the webview's storage keeps them. */
const KEYS = ["canto.hiddenTabs", "canto.knownTabs", "canto.tabLayout", "canto.railPinned"];
const WAIT_MS = 1500;

/** Called after each local write; a failure only means the file keeps its previous copy. */
export function mirrorPref(key: string, value: string) {
  void api.prefsSet(key, value).catch(() => {});
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Fired when the file answers after the first render already happened, so the tab choices can be read again. */
export const PREFS_RESTORED = "canto:prefs-restored";

/** What the webview lost comes back from the file; what only the webview has goes into it. Says whether anything came back. */
function merge(saved: Record<string, string>): boolean {
  let restored = false;
  for (const key of KEYS) {
    const local = read(key);
    if (local !== null) {
      if (saved[key] !== local) mirrorPref(key, local);
    } else if (typeof saved[key] === "string") {
      localStorage.setItem(key, saved[key]);
      restored = true;
    }
  }
  return restored;
}

/**
 * Runs before the first render, waiting at most `WAIT_MS` for the file. The webview's copy wins when both exist.
 * A file slower than that (the first start after an update is the slow one) still lands: the defaults shown meanwhile
 * give way to the saved choices instead of staying until the next start.
 */
export async function syncPrefs(): Promise<void> {
  const pending = api.prefsGet().catch(() => null);
  const first = await Promise.race([pending.then((saved) => ({ saved })), new Promise<null>((done) => setTimeout(() => done(null), WAIT_MS))]);
  try {
    if (first) {
      if (first.saved) merge(first.saved);
      return;
    }
    void pending.then((saved) => {
      try {
        if (saved && merge(saved)) window.dispatchEvent(new Event(PREFS_RESTORED));
      } catch {
        // No storage: the defaults stay, as on a fresh install.
      }
    });
  } catch {
    // No file and no storage: the defaults apply, as on a fresh install.
  }
}
