import { useEffect, useState } from "react";
import { api, errText } from "../lib/api";
import { t } from "../i18n";

/** On/off for holding alerts, which Rust does while a full-screen app (a game) is in front. */
export default function FullscreenHoldSection({ onError }: { onError: (m: string) => void }) {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    api.fullscreenHoldGet().then(setEnabled, (e) => onError(errText(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggle(next: boolean) {
    try {
      setEnabled(await api.fullscreenHoldSet(next));
    } catch (e) {
      onError(errText(e));
    }
  }

  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1 text-xs font-semibold text-fg">{t("settings.fullscreenHold.title")}</legend>
      <label className="flex min-h-[24px] items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={enabled ?? false}
          disabled={enabled === null}
          onChange={(e) => void toggle(e.target.checked)}
          className="canto-box"
        />
        {t("settings.fullscreenHold.label")}
      </label>
      <p className="text-[11px] text-faint">{t("settings.fullscreenHold.hint")}</p>
    </fieldset>
  );
}
