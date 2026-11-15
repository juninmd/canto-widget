import { useEffect, useState } from "react";
import { api, STRIP_ITEMS, type StripConfig, type StripItem } from "../../lib/api";
import { useSectionError } from "./useSectionError";
import { t } from "../../i18n";
import { SettingsSection } from "./SettingsSection";

export default function StripSection({ onError }: { onError: (m: string) => void }) {
  const [cfg, setCfg] = useState<StripConfig | null>(null);
  const { error, fail, clear } = useSectionError(onError);

  useEffect(() => {
    api.stripConfigGet().then(setCfg, fail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save(next: StripConfig) {
    clear();
    try {
      setCfg(await api.stripConfigSet(next));
    } catch (e) {
      fail(e);
    }
  }

  if (!cfg) return <SettingsSection title={t("settings.strip.title")} error={error}>{null}</SettingsSection>;
  const toggle = (item: StripItem, on: boolean) =>
    void save({ ...cfg, items: on ? [...cfg.items, item] : cfg.items.filter((i) => i !== item) });

  return (
    <SettingsSection title={t("settings.strip.title")} error={error}>
      <label className="flex min-h-[24px] items-center gap-2 text-xs text-muted">
        <input type="checkbox" checked={cfg.enabled} onChange={(e) => void save({ ...cfg, enabled: e.target.checked })} className="canto-box" />
        {t("settings.strip.enable")}
      </label>
      <p className="text-[11px] text-faint">{t("settings.strip.hint")}</p>
      {cfg.enabled && (
        <>
          <div role="radiogroup" aria-label={t("settings.strip.edge")} className="flex items-center gap-3 text-xs text-muted">
            {(["top", "bottom"] as const).map((edge) => (
              <label key={edge} className="flex min-h-[24px] items-center gap-1.5">
                <input type="radio" name="strip-edge" checked={cfg.edge === edge} onChange={() => void save({ ...cfg, edge })} className="canto-box" />
                {t(edge === "top" ? "settings.strip.top" : "settings.strip.bottom")}
              </label>
            ))}
          </div>
          {STRIP_ITEMS.map((item) => (
            <label key={item} className="flex min-h-[24px] items-center gap-2 text-xs text-muted">
              <input type="checkbox" checked={cfg.items.includes(item)} onChange={(e) => toggle(item, e.target.checked)} className="canto-box" />
              {t(`strip.item.${item}`)}
            </label>
          ))}
        </>
      )}
    </SettingsSection>
  );
}
