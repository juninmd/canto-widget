export type SkinId = "padrao" | "hueco-mundo" | "dracula" | "claro" | "sistema";
type SkinReal = Exclude<SkinId, "sistema">;

export const SKINS: { id: SkinId; nome: string; amostra: string }[] = [
  { id: "padrao", nome: "Padrão", amostra: "#4ade80" },
  { id: "hueco-mundo", nome: "Hueco Mundo", amostra: "#e11d48" },
  { id: "dracula", nome: "Drácula", amostra: "#bd93f9" },
  { id: "claro", nome: "Claro", amostra: "#dbe3ec" },
  { id: "sistema", nome: "Seguir o sistema (claro ou escuro)", amostra: "linear-gradient(135deg, #f8fafc 50%, #111826 50%)" },
];

const KEY = "canto.skin";
const CLARO = "(prefers-color-scheme: light)";

export function loadSkin(): SkinId {
  const saved = localStorage.getItem(KEY) as SkinId | null;
  return SKINS.some((s) => s.id === saved) ? (saved as SkinId) : "padrao";
}

/** "sistema" vira a skin clara ou a padrão escura conforme o tema do sistema operacional. */
export function resolverSkin(skin: SkinId, sistemaClaro: boolean): SkinReal {
  if (skin !== "sistema") return skin;
  return sistemaClaro ? "claro" : "padrao";
}

export function sistemaClaro(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia?.(CLARO).matches;
}

export function applySkin(skin: SkinId): void {
  document.documentElement.dataset.skin = resolverSkin(skin, sistemaClaro());
  localStorage.setItem(KEY, skin);
}

/** Reaplica quando o sistema troca de tema com o widget aberto (ex.: modo escuro ao anoitecer). */
export function seguirSistema(aoMudar: () => void): () => void {
  const mq = window.matchMedia?.(CLARO);
  mq?.addEventListener?.("change", aoMudar);
  return () => mq?.removeEventListener?.("change", aoMudar);
}
