const KEY = "canto.forge.layout";

export type ForgeLayout = "list" | "grid";

export const savedLayout = (): ForgeLayout => {
  try {
    return localStorage.getItem(KEY) === "grid" ? "grid" : "list";
  } catch {
    return "list";
  }
};

export function saveLayout(layout: ForgeLayout) {
  try {
    localStorage.setItem(KEY, layout);
  } catch {
    /* the choice lasts until the tab reloads */
  }
}
