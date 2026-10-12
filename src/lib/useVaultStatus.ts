import { useCallback, useEffect, useRef, useState } from "react";
import { api, errText, type VaultStatus } from "./api";

/**
 * The vault state the whole shell hangs on. A failed read keeps the last known state and reports through
 * `onError`; with no state yet, `error` lets the body offer a retry instead of staying blank.
 */
export function useVaultStatus(onError: (message: string) => void) {
  const [status, setStatus] = useState<VaultStatus | null>(null);
  const [error, setFailure] = useState("");
  const [checking, setChecking] = useState(false);
  const known = useRef(false);

  const refresh = useCallback(async () => {
    setChecking(true);
    try {
      const next = await api.status();
      known.current = true;
      setFailure("");
      setStatus(next);
    } catch (e) {
      if (known.current) onError(errText(e));
      else setFailure(errText(e));
    } finally {
      setChecking(false);
    }
  }, [onError]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { status, error, checking, refresh };
}
