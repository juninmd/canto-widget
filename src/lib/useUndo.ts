import { useCallback } from "react";
import { api, errText } from "./api";
import { useToast } from "./toast";

/**
 * Deletion without confirmation, but reversible: the toast offers undo (Nielsen: user
 * control and freedom). A null `key` means nothing was removed.
 */
export function useUndo(onError: (m: string) => void, reload: () => Promise<void>) {
  const notify = useToast();
  return useCallback(
    (key: string | null, message: string) => {
      if (!key) return;
      notify({
        message,
        action: {
          label: "desfazer",
          run: () =>
            void api
              .trashUndo(key)
              .then((restored) => (restored ? reload() : onError("não dá mais para desfazer: o cofre foi trancado")))
              .catch((e) => onError(errText(e))),
        },
      });
    },
    [notify, onError, reload],
  );
}
