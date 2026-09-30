import { t } from "../i18n";
import { useFocusNudge } from "../lib/focusNudge";

export default function FocusSection() {
  const [nudge, setNudge] = useFocusNudge();
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1 text-xs font-semibold text-fg">{t("focus.settingsTitle")}</legend>
      <label className="flex min-h-6 items-center gap-2 text-xs text-muted">
        <input type="checkbox" checked={nudge} onChange={(e) => setNudge(e.target.checked)} className="size-4 accent-[var(--color-accent)]" />
        {t("focus.settingsOverNudge")}
      </label>
      <p className="text-[11px] text-faint">{t("focus.settingsHint")}</p>
    </fieldset>
  );
}
