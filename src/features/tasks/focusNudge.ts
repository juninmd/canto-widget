import { useCallback, useState } from "react";

const KEY = "canto.focusNudge";

/** On unless the user turned it off; anything unreadable also means on. */
export const readNudge = () => localStorage.getItem(KEY) !== "0";

export function useFocusNudge() {
  const [on, setOn] = useState(readNudge);
  const change = useCallback((next: boolean) => {
    setOn(next);
    localStorage.setItem(KEY, next ? "1" : "0");
  }, []);
  return [on, change] as const;
}
