const KEY = "canto.forge.hideDrafts";

export const savedHideDrafts = (): boolean => {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

export function saveHideDrafts(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "1" : "0");
  } catch {
    /* the choice lasts until the tab reloads */
  }
}
