const KEY = "canto.forge.layout";

export type ForgeLayout = "list" | "grid" | "queue";

export const savedLayout = (): ForgeLayout => {
  try {
    const v = localStorage.getItem(KEY);
    return v === "list" || v === "queue" ? v : "grid";
  } catch {
    return "grid";
  }
};

export function saveLayout(layout: ForgeLayout) {
  try {
    localStorage.setItem(KEY, layout);
  } catch {
    /* the choice lasts until the tab reloads */
  }
}
