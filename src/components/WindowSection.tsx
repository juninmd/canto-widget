import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useSectionError } from "../lib/useSectionError";
import { t } from "../i18n";
import { SettingsSection } from "./SettingsSection";

export default function WindowSection({ onError }: { onError: (m: string) => void }) {
  const [onTop, setOnTop] = useState(true);
  const [moved, setMoved] = useState(false);
  const { error, fail, clear } = useSectionError(onError);

  async function reload() {
    try {
      const cfg = await api.windowConfig();
      if (!cfg) return;
      setOnTop(cfg.always_on_top);
      setMoved(!!cfg.position || !!cfg.size);
    } catch (e) {
      fail(e);
    }
  }

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function act(fn: () => Promise<unknown>) {
    clear();
    try {
      await fn();
    } catch (e) {
      fail(e);
    } finally {
      await reload();
    }
  }

  return (
    <SettingsSection title={t("settings.window.title")} error={error}>
      <label className="flex min-h-[24px] items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={onTop}
          onChange={(e) => void act(() => api.windowSetAlwaysOnTop(e.target.checked))}
          className="canto-box"
        />
        {t("settings.window.alwaysOnTop")}
      </label>
      <p className="text-[11px] text-faint">{t("settings.window.hint")}</p>
      {moved && (
        <button
          type="button"
          onClick={() => void act(api.windowReset)}
          className="canto-hit min-h-[24px] self-start rounded-lg bg-edge px-3 py-1.5 text-xs text-fg"
        >
          {t("settings.window.reset")}
        </button>
      )}
    </SettingsSection>
  );
}
