import { useEffect, useState } from "react";
import { t } from "../i18n";
import { api } from "../lib/api";
import { useSectionError } from "../lib/useSectionError";
import { useToast } from "../lib/toast";
import { SettingsSection } from "./SettingsSection";

export default function ActivitySection({ onError }: { onError: (m: string) => void }) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const notify = useToast();
  const { error, fail, clear } = useSectionError(onError);

  const load = () =>
    api
      .activityStatus()
      .then((s) => setEnabled(s.enabled))
      .catch(fail);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggle(next: boolean) {
    clear();
    try {
      await api.activitySetEnabled(next);
      setEnabled(next);
    } catch (e) {
      fail(e);
      await load();
    }
  }

  async function wipe() {
    clear();
    try {
      await api.activityClear();
      notify({ message: t("activity.cleared") });
    } catch (e) {
      fail(e);
    }
  }

  return (
    <SettingsSection title={t("activity.settingsTitle")} error={error}>
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
      <button type="button" onClick={() => void wipe()} className="canto-hit min-h-[24px] self-start rounded-md px-1.5 text-[11px] text-muted hover:bg-hover hover:text-danger active:bg-active">
        {t("activity.clear")}
      </button>
    </SettingsSection>
  );
}
