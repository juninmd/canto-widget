import { useEffect, useState } from "react";
import { t } from "../i18n";
import { api, errText } from "../lib/api";
import { useToast } from "../lib/toast";

export default function ActivitySection({ onError }: { onError: (m: string) => void }) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const notify = useToast();

  useEffect(() => {
    api
      .activityStatus()
      .then((s) => setEnabled(s.enabled))
      .catch((e) => onError(errText(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggle(next: boolean) {
    try {
      await api.activitySetEnabled(next);
      setEnabled(next);
    } catch (e) {
      onError(errText(e));
    }
  }

  async function clear() {
    try {
      await api.activityClear();
      notify({ message: t("activity.cleared") });
    } catch (e) {
      onError(errText(e));
    }
  }

  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1 text-xs font-semibold text-fg">{t("activity.settingsTitle")}</legend>
      <label className="flex min-h-[24px] items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={enabled === true}
          disabled={enabled === null}
          onChange={(e) => void toggle(e.target.checked)}
          className="canto-box"
        />
        {t("activity.settingsToggle")}
      </label>
      <p className="text-[11px] text-faint">{t("activity.settingsHint")}</p>
      <button type="button" onClick={() => void clear()} className="canto-hit min-h-[24px] self-start rounded-md px-1.5 text-[11px] text-muted hover:bg-hover hover:text-danger active:bg-active">
        {t("activity.clear")}
      </button>
    </fieldset>
  );
}
