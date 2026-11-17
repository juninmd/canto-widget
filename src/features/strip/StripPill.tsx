import { Fragment } from "react";
import { t } from "../../i18n";
import type { StripConfig, StripItem, StripSnapshot } from "../../lib/api";
import { ICONS } from "./stripIcons";
import { levelOf, pillText, type Level } from "./stripModel";

const TONE: Record<Level, string> = { "": "text-fg", warn: "text-warn", danger: "text-danger" };

export type PillLook = Pick<StripConfig, "density" | "icons" | "labels"> & Partial<Pick<StripConfig, "surface" | "dividers">>;

/** Solid is the theme's panel; glass lets the wallpaper through; outline keeps only the line. */
const SURFACE = {
  solid: "bg-panel shadow-lg",
  glass: "bg-panel/60 shadow-lg backdrop-blur-md",
  outline: "bg-transparent",
} as const;

type Props = {
  items: StripItem[];
  snap: StripSnapshot | null;
  look: PillLook;
  open?: boolean;
  onToggle?: () => void;
  /** Pointer handlers for dragging the pill along the edge. */
  drag?: Pick<React.ButtonHTMLAttributes<HTMLButtonElement>, "onPointerDown" | "onPointerMove" | "onPointerUp" | "onPointerCancel">;
  now?: Date;
};

/** One line of a few numbers; the whole pill is the button, so the target is as big as the pill. */
export default function StripPill({ items, snap, look, open = false, onToggle, drag, now }: Props) {
  const compact = look.density === "compact";
  const shown = snap ? items.flatMap((item) => {
    const text = pillText(item, snap, now);
    return text === null ? [] : [{ item, text }];
  }) : [];
  return (
    <button
      type="button"
      onClick={onToggle}
      {...drag}
      aria-expanded={open}
      aria-label={t("strip.aria")}
      className={`canto-hit flex items-center whitespace-nowrap rounded-full border font-medium ${SURFACE[look.surface ?? "solid"]} ${
        compact ? "h-6 gap-2 px-2.5 text-[11px]" : "h-8 gap-2.5 px-3.5 text-xs"
      } ${open ? "border-accent" : "border-edge"}`}
    >
      {shown.map(({ item, text }, i) => (
        <Fragment key={item}>
          {i > 0 && look.dividers !== false && <span aria-hidden className="h-3 w-px bg-edge" />}
          <span className={`tnum flex items-center gap-1 ${TONE[levelOf(item, snap!)]}`}>
            {look.icons && <span className="text-muted">{ICONS[item]}</span>}
            {look.labels && <span className="text-faint">{t(`strip.short.${item}`)}</span>}
            {text}
          </span>
        </Fragment>
      ))}
      {snap && shown.length === 0 && <span className="text-muted">{t("strip.aria")}</span>}
    </button>
  );
}
