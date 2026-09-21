import { useCallback, useRef } from "react";

/**
 * Shared "drop a stale response" guard: `bump()` right before starting an async call, `isLatest(id)`
 * right before applying its result. A caller that fires several requests for one logical load (a
 * search hitting three endpoints, a reload split into two sequential awaits) bumps once and checks
 * the same id in each. `current()` snapshots the id without starting a new generation, for a
 * follow-up request (pagination, say) that should be invalidated by a fresh load but not count as
 * one itself. Extracted from the `seq.current` counter GlobalSearch and useForgeLists each
 * reimplemented on their own.
 */
export function useLatestRequest() {
  const seq = useRef(0);

  const bump = useCallback(() => ++seq.current, []);
  const current = useCallback(() => seq.current, []);
  const isLatest = useCallback((id: number) => id === seq.current, []);

  return { bump, current, isLatest };
}
