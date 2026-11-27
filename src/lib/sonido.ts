import type { SkinId } from "./theme";

type SkinReal = Exclude<SkinId, "sistema">;

/** The widget paints itself with `data-skin`; Sonido reads `data-theme`. This keeps both on the same skin. */
const SONIDO_THEME: Record<SkinReal, string> = {
  padrao: "dark",
  "hueco-mundo": "hueco-mundo",
  dracula: "dracula",
  glass: "glass",
  aurora: "aurora",
  claro: "light",
};

export function applySonidoTheme(skin: SkinReal): void {
  document.documentElement.dataset.theme = SONIDO_THEME[skin];
}
