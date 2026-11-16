import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { api, type StripConfig } from "../../lib/api";
import StripItemsEditor from "./StripItemsEditor";
import StripPreview from "./StripPreview";
import { apply, PRESETS, type PresetId } from "./stripPresets";
import { Row, RowGroup, Segmented, SliderRow, SwitchRow } from "./controls";
import SubTabs from "../../components/SubTabs";
import { useSectionError } from "./useSectionError";
import { t } from "../../i18n";
import { SettingsSection } from "./SettingsSection";

/** An older build answers without the newer keys. */
const DEFAULTS: Omit<StripConfig, "enabled" | "edge" | "items"> = {
  density: "comfortable", icons: true, labels: false, opacity: 100, charts: true,
  align: "center", gap: 0, scale: 100, surface: "solid", dividers: true, refresh: 2, hover: true, hide_fullscreen: true, columns: 2,
};

type Page = "items" | "position" | "look" | "behavior";

export default function StripSection({ onError }: { onError: (m: string) => void }) {
  const [cfg, setCfg] = useState<StripConfig | null>(null);
  const [monitors, setMonitors] = useState<string[]>([]);
  const [page, setPage] = useState<Page>("items");
  const { error, fail, clear } = useSectionError(onError);

  useEffect(() => {
    api.stripConfigGet().then((c) => setCfg({ ...DEFAULTS, ...c }), fail);
    api.stripMonitors().then((m) => setMonitors(m ?? []), () => {});
    // "Ocultar" on the pill and the tray switch save the config elsewhere; the switch here follows.
    let off: (() => void) | undefined;
    let gone = false;
    try {
      listen<StripConfig>("strip-config", (e) => e.payload && setCfg({ ...DEFAULTS, ...e.payload })).then(
        (fn) => (gone ? fn() : (off = fn)),
        () => {},
      );
    } catch {
      /* no Tauri here (a browser preview): the section just keeps what it loaded */
    }
    return () => {
      gone = true;
      off?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save(next: StripConfig) {
    clear();
    try {
      setCfg({ ...DEFAULTS, ...next, ...(await api.stripConfigSet(next)) });
    } catch (e) {
      fail(e);
    }
  }

  if (!cfg) return <SettingsSection title={t("settings.strip.title")} error={error}>{null}</SettingsSection>;
  const set = (patch: Partial<StripConfig>) => void save({ ...cfg, ...patch });

  return (
    <SettingsSection title={t("settings.strip.title")} error={error}>
      <p className="text-[11px] leading-snug text-faint">{t("settings.strip.hint")}</p>
      <RowGroup>
        <SwitchRow checked={cfg.enabled} onChange={(enabled) => set({ enabled })} label={t("settings.strip.enable")} />
      </RowGroup>
      {cfg.enabled && (
        <>
          <StripPreview cfg={cfg} />
          <SubTabs<Page>
            label={t("settings.strip.pages")}
            dense
            value={page}
            onChange={setPage}
            tabs={[
              { key: "items", label: t("settings.strip.page.items") },
              { key: "position", label: t("settings.strip.page.position") },
              { key: "look", label: t("settings.strip.page.look") },
              { key: "behavior", label: t("settings.strip.page.behavior") },
            ]}
          />
          {page === "items" && (
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-medium text-faint">{t("settings.strip.presets")}</span>
                {(Object.keys(PRESETS) as PresetId[]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => void save(apply(cfg, id))}
                    className="canto-hit rounded-full border border-edge bg-ink/60 px-2.5 py-0.5 text-xs text-muted hover:border-accent hover:text-fg"
                  >
                    {t(`settings.strip.preset.${id}`)}
                  </button>
                ))}
              </div>
              <StripItemsEditor items={cfg.items} onChange={(items) => set({ items })} />
            </div>
          )}
          {page === "position" && (
            <RowGroup>
              <Row label={t("settings.strip.edge")}>
                <Segmented
                  name="strip-edge"
                  label={t("settings.strip.edge")}
                  value={cfg.edge}
                  onChange={(edge) => set({ edge })}
                  options={[
                    { value: "top", label: t("settings.strip.top") },
                    { value: "bottom", label: t("settings.strip.bottom") },
                  ]}
                />
              </Row>
              <Row label={t("settings.strip.align")}>
                <Segmented
                  name="strip-align"
                  label={t("settings.strip.align")}
                  value={cfg.align}
                  onChange={(align) => set({ align })}
                  options={[
                    { value: "start", label: t("settings.strip.alignStart") },
                    { value: "center", label: t("settings.strip.alignCenter") },
                    { value: "end", label: t("settings.strip.alignEnd") },
                  ]}
                />
              </Row>
              <SliderRow label={t("settings.strip.gap")} hint={t("settings.strip.gapHint")} value={cfg.gap} min={0} max={64} step={4} unit=" px" onChange={(gap) => set({ gap })} />
              {monitors.length > 1 && (
                <Row label={t("settings.strip.monitor")}>
                  <select
                    aria-label={t("settings.strip.monitor")}
                    value={cfg.monitor ?? ""}
                    onChange={(e) => set({ monitor: e.target.value || null })}
                    className="canto-field max-w-[180px] rounded-md px-1.5 py-0.5 text-xs"
                  >
                    <option value="">{t("settings.strip.monitorAuto")}</option>
                    {monitors.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </Row>
              )}
            </RowGroup>
          )}
          {page === "look" && (
            <div className="flex flex-col gap-2.5">
              <RowGroup>
                <Row label={t("settings.strip.density")}>
                  <Segmented
                    name="strip-density"
                    label={t("settings.strip.density")}
                    value={cfg.density}
                    onChange={(density) => set({ density })}
                    options={[
                      { value: "compact", label: t("settings.strip.compact") },
                      { value: "comfortable", label: t("settings.strip.comfortable") },
                    ]}
                  />
                </Row>
                <Row label={t("settings.strip.surface")}>
                  <Segmented
                    name="strip-surface"
                    label={t("settings.strip.surface")}
                    value={cfg.surface}
                    onChange={(surface) => set({ surface })}
                    options={[
                      { value: "solid", label: t("settings.strip.surfaceSolid") },
                      { value: "glass", label: t("settings.strip.surfaceGlass") },
                      { value: "outline", label: t("settings.strip.surfaceOutline") },
                    ]}
                  />
                </Row>
                <SliderRow label={t("settings.strip.scale")} value={cfg.scale} min={80} max={140} step={10} unit="%" onChange={(scale) => set({ scale })} />
                <SliderRow label={t("settings.strip.opacity")} value={cfg.opacity} min={40} max={100} step={5} unit="%" onChange={(opacity) => set({ opacity })} />
              </RowGroup>
              <RowGroup>
                <SwitchRow checked={cfg.icons} onChange={(icons) => set({ icons })} label={t("settings.strip.icons")} />
                <SwitchRow checked={cfg.labels} onChange={(labels) => set({ labels })} label={t("settings.strip.labels")} />
                <SwitchRow checked={cfg.dividers} onChange={(dividers) => set({ dividers })} label={t("settings.strip.dividers")} />
              </RowGroup>
            </div>
          )}
          {page === "behavior" && (
            <div className="flex flex-col gap-2.5">
              <RowGroup>
                <SwitchRow checked={cfg.hover} onChange={(hover) => set({ hover })} label={t("settings.strip.hover")} hint={t("settings.strip.hoverHint")} />
                <SwitchRow checked={cfg.hide_fullscreen} onChange={(hide_fullscreen) => set({ hide_fullscreen })} label={t("settings.strip.fullscreen")} hint={t("settings.strip.fullscreenHint")} />
                <Row label={t("settings.strip.refresh")} hint={t("settings.strip.refreshHint")}>
                  <Segmented
                    name="strip-refresh"
                    label={t("settings.strip.refresh")}
                    value={cfg.refresh}
                    onChange={(refresh) => set({ refresh })}
                    options={[1, 2, 5, 10].map((n) => ({ value: n, label: t("settings.strip.seconds", { n: String(n) }) }))}
                  />
                </Row>
              </RowGroup>
              <RowGroup>
                <Row label={t("settings.strip.columns")}>
                  <Segmented
                    name="strip-columns"
                    label={t("settings.strip.columns")}
                    value={cfg.columns}
                    onChange={(columns) => set({ columns })}
                    options={[{ value: 1, label: "1" }, { value: 2, label: "2" }]}
                  />
                </Row>
                <SwitchRow checked={cfg.charts} onChange={(charts) => set({ charts })} label={t("settings.strip.charts")} />
              </RowGroup>
            </div>
          )}
        </>
      )}
    </SettingsSection>
  );
}
