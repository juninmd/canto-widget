import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useSectionError } from "./useSectionError";
import { t } from "../../i18n";
import { SettingsSection } from "./SettingsSection";
import { Row, Segmented } from "./controls";

type Side = "left" | "right";

export default function SidebarSection({ onError }: { onError: (m: string) => void }) {
  const [on, setOn] = useState(false);
  const [side, setSide] = useState<Side>("right");
  const [monitor, setMonitor] = useState<string | null>(null);
  const [monitors, setMonitors] = useState<string[]>([]);
  const { error, fail, clear } = useSectionError(onError);

  async function reload() {
    try {
      const cfg = await api.windowConfig();
      if (!cfg) return;
      setOn(cfg.sidebar === true);
      setSide(cfg.sidebar_side === "left" ? "left" : "right");
      setMonitor(cfg.sidebar_monitor ?? null);
    } catch (e) {
      fail(e);
    }
  }

  useEffect(() => {
    void reload();
    api.stripMonitors().then((m) => setMonitors(m ?? []), () => {});
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
    <SettingsSection title={t("settings.sidebar.title")} error={error}>
      <label className="flex min-h-[24px] items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={on}
          onChange={(e) => void act(() => api.windowSidebarSet(e.target.checked))}
          className="canto-box"
        />
        {t("settings.window.sidebar")}
      </label>
      <p className="text-[11px] text-faint">{t("settings.window.sidebarHint")}</p>
      {on && (
        <>
          <Row label={t("settings.sidebar.side")}>
            <Segmented
              name="sidebar-side"
              label={t("settings.sidebar.side")}
              value={side}
              onChange={(v) => void act(() => api.windowSidebarTarget(v, monitor))}
              options={[
                { value: "left", label: t("settings.sidebar.left") },
                { value: "right", label: t("settings.sidebar.right") },
              ]}
            />
          </Row>
          {monitors.length > 1 && (
            <Row label={t("settings.sidebar.monitor")}>
              <select
                aria-label={t("settings.sidebar.monitor")}
                value={monitor ?? ""}
                onChange={(e) => void act(() => api.windowSidebarTarget(side, e.target.value || null))}
                className="canto-field max-w-[180px] rounded-md px-1.5 py-0.5 text-xs"
              >
                <option value="">{t("settings.sidebar.monitorAuto")}</option>
                {monitors.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </Row>
          )}
        </>
      )}
    </SettingsSection>
  );
}
