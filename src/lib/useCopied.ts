import { useCallback, useEffect, useRef, useState } from "react";

const SHOWN_MS = 1200;

/** Which item just got copied, for the "copiado" flash; a second copy restarts the timer and unmounting cancels it. */
export function useCopied(): [string, (id: string) => void] {
  const [copied, setCopied] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);
  const flash = useCallback((id: string) => {
    if (timer.current) clearTimeout(timer.current);
    setCopied(id);
    timer.current = setTimeout(() => setCopied(""), SHOWN_MS);
  }, []);
  return [copied, flash];
}
