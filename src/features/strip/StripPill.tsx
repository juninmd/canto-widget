import { Fragment } from "react";
import { t } from "../../i18n";
import type { StripConfig, StripItem, StripSnapshot } from "../../lib/api";
import { ICONS } from "./stripIcons";
import { levelOf, pillText, type Level } from "./stripModel";

const TONE: Record<Level, string> = { "": "text-fg", warn: "text-warn", danger: "text-danger" };

export type PillLook = Pick<StripConfig, "density" | "icons" | "labels">;

type Props = {
  items: StripItem[];
  snap: StripSnapshot | null;
  look: PillLook;
  open?: boolean;
  onToggle?: () => void;
  now?: Date;
};

/** One line of a few numbers; the whole pill is the button, so the target is as big as the pill. */
export default function StripPill({ items, snap, look, open = false, onToggle, now }: Props) {
  const compact = look.density === "compact";
  const shown = snap ? items.flatMap((item) => {
    const text = pillText(item, snap, now);
    return text === null ? [] : [{ item, text }];
  }) : [];
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-label={t("strip.aria")}
      className={`canto-hit flex items-center whitespace-nowrap rounded-full border bg-panel font-medium shadow-lg ${
        compact ? "h-6 gap-2 px-2.5 text-[11px]" : "h-8 gap-2.5 px-3.5 text-xs"
      } ${open ? "border-accent" : "border-edge"}`}
    >
      {shown.map(({ item, text }, i) => (
        <Fragment key={item}>
          {i > 0 && <span aria-hidden className="h-3 w-px bg-edge" />}
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
