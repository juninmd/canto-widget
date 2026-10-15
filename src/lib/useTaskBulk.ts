import { useCallback } from "react";
import { api, errText } from "./api";
import { useToast } from "./toast";
import { t } from "../i18n";

/** Whole-list actions: pull pending tasks to today, and clear the done ones with one undo for the batch. */
export function useTaskBulk(today: string, doneIds: string[], reload: () => Promise<void>, onError: (m: string) => void) {
  const notify = useToast();

  const carryOver = useCallback(async () => {
    try {
      const n = await api.carryOver(today);
      await reload();
      notify({ message: n === 0 ? t("tasks.carriedNone") : n === 1 ? t("tasks.carriedOne") : t("tasks.carriedMany", { n }) });
    } catch (e) {
      onError(errText(e));
    }
  }, [today, reload, notify, onError]);

  const undoAll = useCallback(
    async (keys: string[]) => {
      try {
        let restoredAll = true;
        for (const key of keys) restoredAll = (await api.trashUndo(key)) && restoredAll;
        await reload();
        if (!restoredAll) onError(t("toast.undoExpired"));
      } catch (e) {
        onError(errText(e));
      }
    },
    [reload, onError],
  );

  const clearDone = useCallback(async () => {
    const keys: string[] = [];
    let failure: string | null = null;
    for (const id of doneIds) {
      try {
        const key = await api.itemDelete(id);
        if (key) keys.push(key);
      } catch (e) {
        failure = errText(e);
        break;
      }
    }
    await reload();
    if (keys.length > 0) {
      notify({
        message: keys.length === 1 ? t("tasks.clearedOne") : t("tasks.clearedMany", { n: keys.length }),
        action: {
          label: t("toast.undo"),
          run: () => void undoAll(keys),
        },
      });
    }
    if (failure) onError(failure);
  }, [doneIds, reload, notify, onError, undoAll]);

  return { carryOver, clearDone };
}
