import { t } from "../i18n";
export type SkinId = "padrao" | "hueco-mundo" | "dracula" | "claro" | "sistema";
type SkinReal = Exclude<SkinId, "sistema">;

export const SKINS: { id: SkinId; name: string; sample: string }[] = [
  { id: "padrao", name: t("theme.skin.default"), sample: "#4ade80" },
  { id: "hueco-mundo", name: "Hueco Mundo", sample: "#e11d48" },
  { id: "dracula", name: t("theme.skin.dracula"), sample: "#bd93f9" },
  { id: "claro", name: t("theme.skin.light"), sample: "#dbe3ec" },
  { id: "sistema", name: t("theme.skin.system"), sample: "linear-gradient(135deg, #f8fafc 50%, #111826 50%)" },
];

const KEY = "canto.skin";
const LIGHT_QUERY = "(prefers-color-scheme: light)";

export function loadSkin(): SkinId {
  const saved = localStorage.getItem(KEY) as SkinId | null;
  return SKINS.some((s) => s.id === saved) ? (saved as SkinId) : "padrao";
}

/** "sistema" becomes the light skin or the dark default depending on the OS theme. */
export function resolveSkin(skin: SkinId, systemLight: boolean): SkinReal {
  if (skin !== "sistema") return skin;
  return systemLight ? "claro" : "padrao";
}

export function isSystemLight(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia?.(LIGHT_QUERY).matches;
}

export function applySkin(skin: SkinId): void {
  document.documentElement.dataset.skin = resolveSkin(skin, isSystemLight());
  localStorage.setItem(KEY, skin);
}

/** Reapplies when the system switches theme while the widget is open (e.g. dark mode at nightfall). */
export function followSystem(onChange: () => void): () => void {
  const mq = window.matchMedia?.(LIGHT_QUERY);
  mq?.addEventListener?.("change", onChange);
  return () => mq?.removeEventListener?.("change", onChange);
}
