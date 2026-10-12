import { useEffect, useState } from "react";

const SHOWN_MS = 5000;

/** A short confirmation shown on screen and read out, then cleared so it never goes stale. */
export function useAnnouncement(): [string, (message: string) => void] {
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), SHOWN_MS);
    return () => clearTimeout(timer);
  }, [message]);
  return [message, setMessage];
}
