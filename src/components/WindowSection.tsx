import { useEffect, useState } from "react";
import { api, errText } from "../lib/api";
import { t } from "../i18n";

export default function WindowSection({ onError }: { onError: (m: string) => void }) {
  const [onTop, setOnTop] = useState(true);
  const [moved, setMoved] = useState(false);

  async function reload() {
    try {
      const cfg = await api.windowConfig();
      if (!cfg) return;
      setOnTop(cfg.always_on_top);
      setMoved(!!cfg.position || !!cfg.size);
    } catch (e) {
      onError(errText(e));
    }
  }

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function act(fn: () => Promise<unknown>) {
    try {
      await fn();
    } catch (e) {
      onError(errText(e));
    } finally {
      await reload();
    }
  }

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold text-fg">{t("settings.window.title")}</h3>
      <label className="flex min-h-6 items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={onTop}
          onChange={(e) => void act(() => api.windowSetAlwaysOnTop(e.target.checked))}
          className="size-4 accent-[var(--color-accent)]"
        />
        {t("settings.window.alwaysOnTop")}
      </label>
      <p className="text-[11px] text-faint">
        {t("settings.window.hint")}
      </p>
      {moved && (
        <button
          type="button"
          onClick={() => void act(api.windowReset)}
          className="self-start rounded-lg bg-edge px-3 py-1.5 text-xs text-fg"
        >
          {t("settings.window.reset")}
        </button>
      )}
    </section>
  );
}
