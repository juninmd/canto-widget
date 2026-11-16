import type { ReactNode } from "react";
import { t } from "../../i18n";
import SystemSpark from "../system/SystemSpark";
import type { StripItem } from "../../lib/api";
import { ICONS } from "./stripIcons";
import { TINT, type Level } from "./stripModel";
import type { Lines } from "./stripLines";

const TONE: Record<Level, string> = { "": "text-fg", warn: "text-warn", danger: "text-danger" };
const SPARK_TONE: Record<Level, string> = { "": "", warn: "var(--color-warn)", danger: "var(--color-danger)" };

type Props = { item: StripItem; lines: Lines; level: Level; wide: boolean; onOpen: () => void; action?: ReactNode };

/** A tinted badge says what the card is before the label is read; the chart, when on, sits under the number. */
export default function StripCard({ item, lines, level, wide, onOpen, action }: Props) {
  const tint = TINT[item];
  return (
    <div
      className={`group relative flex flex-col gap-1 overflow-hidden rounded-xl border border-edge bg-ink/60 p-2.5 transition-colors hover:border-accent/60 ${wide ? "col-span-2" : ""}`}
    >
      <div className="flex items-start gap-2">
        <button type="button" data-nav onClick={onOpen} className="canto-hit flex min-w-0 flex-1 items-start gap-2 text-left">
          <span
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg"
            style={{ color: tint, background: `color-mix(in srgb, ${tint} 16%, transparent)` }}
          >
            {ICONS[item]}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[10px] font-medium uppercase tracking-wide text-faint">{t(`strip.item.${item}`)}</span>
            <span className={`tnum block truncate text-[15px] font-semibold leading-tight ${TONE[level]}`}>{lines.big}</span>
            {lines.sub && <span className="block truncate text-[11px] text-muted">{lines.sub}</span>}
          </span>
        </button>
        {action}
      </div>
      {lines.spark && lines.spark.values.length > 1 && (
        <SystemSpark values={lines.spark.values} max={lines.spark.max} height={22} tone={SPARK_TONE[level] || tint} />
      )}
    </div>
  );
}
