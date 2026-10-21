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

/**
 * Runs before the first render: what the webview lost comes back from the file, and what only the webview has
 * (a choice made before the file existed) goes into it. The webview's copy wins when both exist.
 */
export async function syncPrefs(): Promise<void> {
  try {
    const saved = await Promise.race([api.prefsGet(), new Promise<null>((done) => setTimeout(() => done(null), WAIT_MS))]);
    if (!saved) return;
    for (const key of KEYS) {
      const local = read(key);
      if (local !== null) {
        if (saved[key] !== local) mirrorPref(key, local);
      } else if (typeof saved[key] === "string") {
        localStorage.setItem(key, saved[key]);
      }
    }
  } catch {
    // No file and no storage: the defaults apply, as on a fresh install.
  }
}
