import { useEffect } from "react";
import { savePicked, readPicked } from "../features/agenda/agendaPicked";
import { clearForgeCache } from "../features/forge/forgeCache";

/** Webview-memory caches must not outlive the vault session: a locked vault shows nothing from the last one. */
export function useClearOnLock(unlocked: boolean) {
  useEffect(() => {
    if (unlocked) return;
    clearForgeCache();
    if (readPicked() !== null) savePicked(null);
  }, [unlocked]);
}
