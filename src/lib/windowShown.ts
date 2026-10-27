/** Frozen name: `window.rs` emits it when Rust hides or shows the main window (tray, shortcut, close button). */
export const WINDOW_SHOWN_EVENT = "canto://window-shown";

/** Whether the main window is on screen. WebView2 keeps `document.hidden` false after `hide()`, so this is tracked by hand. */
let shown = true;
const subscribers = new Set<() => void>();
let wired = false;

export function setWindowShown(next: boolean) {
  if (shown === next) return;
  shown = next;
  for (const run of subscribers) run();
}

export function windowShown(): boolean {
  const docVisible = typeof document === "undefined" || !document.hidden;
  return shown && docVisible;
}

/** Any focus or pointer in the window proves it is on screen, so a missed "shown" never leaves polls asleep. */
function wire() {
  if (wired || typeof window === "undefined") return;
  wired = true;
  const seen = () => setWindowShown(true);
  window.addEventListener("focus", seen);
  window.addEventListener("pointermove", seen, { passive: true });
  // Loaded lazily so a tab that only reads visibility pulls no Tauri module; outside Tauri the DOM still applies.
  void import("@tauri-apps/api/event")
    .then(({ listen }) => listen<boolean>(WINDOW_SHOWN_EVENT, (e) => setWindowShown(e.payload !== false)))
    .catch(() => {});
}

export function subscribeWindowShown(run: () => void): () => void {
  wire();
  subscribers.add(run);
  document.addEventListener("visibilitychange", run);
  return () => {
    subscribers.delete(run);
    document.removeEventListener("visibilitychange", run);
  };
}

/** Every UI hide goes through here so polls pause at once, before any OS event arrives. */
export async function hideWindow(): Promise<void> {
  setWindowShown(false);
  const { getCurrentWindow } = await import("@tauri-apps/api/window");
  return getCurrentWindow().hide();
}
