export type SkinId = "padrao" | "hueco-mundo" | "dracula";

export const SKINS: { id: SkinId; nome: string; amostra: string }[] = [
  { id: "padrao", nome: "Padrão", amostra: "#4ade80" },
  { id: "hueco-mundo", nome: "Hueco Mundo", amostra: "#e11d48" },
  { id: "dracula", nome: "Drácula", amostra: "#bd93f9" },
];

const KEY = "canto.skin";

export function loadSkin(): SkinId {
  const saved = localStorage.getItem(KEY) as SkinId | null;
  return SKINS.some((s) => s.id === saved) ? (saved as SkinId) : "padrao";
}

export function applySkin(skin: SkinId): void {
  document.documentElement.dataset.skin = skin;
  localStorage.setItem(KEY, skin);
}
