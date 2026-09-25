import { useCallback } from "react";
import { api, errText } from "./api";
import { useToast } from "./toast";
import { t } from "../i18n";

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
          label: t("toast.undo"),
          run: () =>
            void api
              .trashUndo(key)
              .then((restored) => (restored ? reload() : onError(t("toast.undoExpired"))))
              .catch((e) => onError(errText(e))),
        },
      });
    },
    [notify, onError, reload],
  );
}
