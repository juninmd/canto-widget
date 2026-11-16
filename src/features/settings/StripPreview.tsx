import type { StripConfig, StripSnapshot } from "../../lib/api";
import { t } from "../../i18n";
import StripPill from "../strip/StripPill";

/** Fictitious numbers: the preview shows the look, not this machine. */
export const SAMPLE: StripSnapshot = {
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

const EDGE_SIDE = { start: "justify-start", center: "justify-center", end: "justify-end" } as const;

/**
 * A tiny desktop with the pill where it will really sit: the edge, the side, the gap and the look follow the choices
 * as they are made. Decorative; the controls beside it carry the same information as text.
 */
export default function StripPreview({ cfg }: { cfg: StripConfig }) {
  const bottom = cfg.edge === "bottom";
  return (
    <div
      aria-hidden
      data-strip-preview
      className="relative flex h-24 flex-col overflow-hidden rounded-xl border border-edge"
      style={{
        background:
          "radial-gradient(120% 140% at 15% 0%, color-mix(in srgb, var(--color-accent) 28%, transparent), transparent 60%), radial-gradient(100% 120% at 100% 100%, color-mix(in srgb, var(--color-cat-meet) 22%, transparent), transparent 55%), var(--color-ink)",
      }}
    >
      <div className={`flex min-h-0 flex-1 ${bottom ? "items-end" : "items-start"} ${EDGE_SIDE[cfg.align]}`} style={{ padding: Math.round(cfg.gap / 4) }}>
        <div className="pointer-events-none max-w-full origin-top overflow-hidden" style={{ opacity: cfg.opacity / 100, zoom: (Math.min(cfg.scale, 100) * 0.8) / 100 }}>
          <StripPill items={cfg.items} snap={SAMPLE} look={cfg} now={SAMPLE_TIME} />
        </div>
      </div>
      <span className="absolute bottom-1 right-2 text-[9px] uppercase tracking-wider text-faint">{t("settings.strip.preview")}</span>
    </div>
  );
}
