/** Tabs that can reload on demand listen for this; the palette and coming back online dispatch it. */
export const REFRESH_EVENT = "canto:refresh";

export type RefreshDetail = { tab?: string };

export function requestRefresh(tab?: string): void {
  window.dispatchEvent(new CustomEvent<RefreshDetail>(REFRESH_EVENT, { detail: { tab } }));
}
