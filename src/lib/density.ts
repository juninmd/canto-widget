export type DensityId = "compacta" | "padrao" | "confortavel";

export const DENSITIES: { id: DensityId; name: string }[] = [
  { id: "compacta", name: "Compacta" },
  { id: "padrao", name: "Padrão" },
  { id: "confortavel", name: "Confortável" },
];

const KEY = "canto.densidade";

export function loadDensity(): DensityId {
  const saved = localStorage.getItem(KEY);
  return DENSITIES.some((d) => d.id === saved) ? (saved as DensityId) : "padrao";
}

/** Everything in the UI is Tailwind's default rem units, so scaling the root font-size zooms the
 * whole widget (text and spacing together) without touching a single class. */
export function applyDensity(density: DensityId): void {
  document.documentElement.dataset.density = density;
  localStorage.setItem(KEY, density);
}
