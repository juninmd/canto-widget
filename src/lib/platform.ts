import { t } from "../i18n";
/** WKWebView reports "MacIntel" even on Apple Silicon; userAgent covers webviews that blank `platform`. */
export const IS_MAC = typeof navigator !== "undefined" && /Mac/i.test(navigator.platform || navigator.userAgent);

/** Primary modifier for in-app shortcuts: Cmd on macOS, Ctrl elsewhere. */
export const MOD_KEY = IS_MAC ? "⌘" : "Ctrl";

/** Mirrors `toggle_shortcut()` in lib.rs: Cmd+Alt+Space is Finder's search window on macOS. */
export const TOGGLE_KEYS = IS_MAC ? ["⌘", "⇧", t("shortcuts.key.space")] : ["Ctrl", "Alt", t("shortcuts.key.space")];
export const TOGGLE_LABEL = TOGGLE_KEYS.join("+");

/** Mirrors `capture_shortcut()` in global_shortcuts.rs: Ctrl+Cmd+N on macOS, Ctrl+Alt+N elsewhere. */
export const CAPTURE_KEYS = IS_MAC ? ["⌃", "⌘", "N"] : ["Ctrl", "Alt", "N"];
