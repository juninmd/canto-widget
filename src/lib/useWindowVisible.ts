import { useSyncExternalStore } from "react";
import { subscribeWindowShown, windowShown } from "./windowShown";

/** False while the window is hidden, so polls can pause instead of waking a widget nobody is looking at. */
export function useWindowVisible(): boolean {
  return useSyncExternalStore(subscribeWindowShown, windowShown, () => true);
}
