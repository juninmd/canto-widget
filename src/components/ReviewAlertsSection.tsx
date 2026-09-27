import { useEffect, useState } from "react";
import { api, errText } from "../lib/api";
import { t } from "../i18n";

/** On/off for the OS notification Rust sends when someone asks for the user's review on GitHub. */
export default function ReviewAlertsSection({ onError }: { onError: (m: string) => void }) {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    api.reviewAlertsGet().then(setEnabled, (e) => onError(errText(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggle(next: boolean) {
    try {
      setEnabled(await api.reviewAlertsSet(next));
    } catch (e) {
      onError(errText(e));
    }
  }

  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1 text-xs font-semibold text-fg">{t("settings.reviewAlerts.title")}</legend>
      <label className="flex min-h-6 items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={enabled ?? false}
          disabled={enabled === null}
          onChange={(e) => void toggle(e.target.checked)}
          className="size-4 accent-[var(--color-accent)]"
        />
        {t("settings.reviewAlerts.label")}
      </label>
      <p className="text-[11px] text-faint">{t("settings.reviewAlerts.hint")}</p>
    </fieldset>
  );
}
