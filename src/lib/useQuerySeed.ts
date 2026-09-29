import { useEffect, useRef } from "react";

/** Re-applies `query` whenever `seq` changes after mount; the first value is left to `useState`. */
export function useQuerySeed(query: string | undefined, seq: number | undefined, apply: (q: string) => void) {
  const seen = useRef(seq);
  useEffect(() => {
    if (seq === seen.current) return;
    seen.current = seq;
    apply(query ?? "");
  }, [seq, query, apply]);
}
