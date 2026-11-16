import type { StripConfig, StripSnapshot } from "../../lib/api";
import { t } from "../../i18n";
import StripPill from "../strip/StripPill";

/** Fictitious numbers: the preview shows the look, not this machine. */
const SAMPLE: StripSnapshot = {
  cpu: 23,
  memory: 61,
  disk: 48,
  network: [1_250_000, 84_000],
  gpu: 12,
  temp: 54,
  market: { symbol: "USDBRL=X", price: 5.12, change: 0.31, currency: "BRL" },
  health: { down: 0, total: 4 },
  history: null,
  weather: { temp: 24, condition: "cloudy" },
  event: { title: "Daily", in_min: 14, meet: true },
  reviews: 3,
  battery: [57, false],
  tasks: 5,
  notices: 2,
};

const SAMPLE_TIME = new Date(2026, 10, 16, 9, 30);

type Props = { cfg: StripConfig; onChange: (next: StripConfig) => void };

const ROW = "flex min-h-[24px] items-center gap-2 text-xs text-muted";

export default function StripLook({ cfg, onChange }: Props) {
  const flag = (key: "icons" | "labels" | "charts" | "launcher", label: string) => (
    <label className={ROW}>
      <input type="checkbox" checked={cfg[key]} onChange={(e) => onChange({ ...cfg, [key]: e.target.checked })} className="canto-box" />
      {label}
    </label>
  );
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium text-fg">{t("settings.strip.preview")}</span>
      <div
        aria-hidden
        className="flex justify-center overflow-hidden rounded-lg border border-edge bg-ink/60 px-2 py-3"
        style={{ opacity: cfg.opacity / 100 }}
      >
        <div className="pointer-events-none max-w-full overflow-hidden">
          <StripPill items={cfg.items} snap={SAMPLE} look={cfg} now={SAMPLE_TIME} />
        </div>
      </div>
      <span className="pt-1 text-[11px] font-medium text-fg">{t("settings.strip.look")}</span>
      <div role="radiogroup" aria-label={t("settings.strip.density")} className="flex items-center gap-3 text-xs text-muted">
        <span>{t("settings.strip.density")}</span>
        {(["compact", "comfortable"] as const).map((density) => (
          <label key={density} className="flex min-h-[24px] items-center gap-1.5">
            <input type="radio" name="strip-density" checked={cfg.density === density} onChange={() => onChange({ ...cfg, density })} className="canto-box" />
            {t(density === "compact" ? "settings.strip.compact" : "settings.strip.comfortable")}
          </label>
        ))}
      </div>
      {flag("icons", t("settings.strip.icons"))}
      {flag("labels", t("settings.strip.labels"))}
      {flag("charts", t("settings.strip.charts"))}
      {flag("launcher", t("settings.strip.launcher"))}
      <div className={ROW}>
        <span aria-hidden className="shrink-0">{t("settings.strip.opacity")}</span>
        <input
          type="range"
          min={40}
          max={100}
          step={5}
          aria-label={t("settings.strip.opacity")}
          value={cfg.opacity}
          onChange={(e) => onChange({ ...cfg, opacity: Number(e.target.value) })}
          className="min-w-0 flex-1 accent-[var(--color-accent)]"
        />
        <span className="tnum w-9 text-right">{cfg.opacity}%</span>
      </div>
    </div>
  );
}
