import { useEffect, useRef, type KeyboardEvent, type MouseEvent, type PointerEvent, type WheelEvent } from "react";
import type { AgendaItem } from "../lib/api";
import { status as agendaStatus } from "../lib/agenda";
import { kindOf, levelLabel, prLabel, senderName, toneOf, type Tone } from "../lib/alerts";
import { timeAgo } from "../lib/time";
import { t } from "../i18n";
import Avatar from "./Avatar";
import { ChevronIcon } from "./Icons";

export const TONE: Record<Tone, { dot: string; text: string; card: string; ring: string; border: string }> = {
  danger: { dot: "bg-danger", text: "text-danger", card: "border-danger/50 bg-danger/10", ring: "ring-danger", border: "border-danger" },
  warn: { dot: "bg-warn", text: "text-warn", card: "border-warn/50 bg-warn/10", ring: "ring-warn", border: "border-warn" },
  accent: { dot: "bg-accent", text: "text-accent-text", card: "border-accent/40 bg-ink", ring: "ring-accent", border: "border-accent" },
  muted: { dot: "bg-muted", text: "text-muted", card: "border-line/60 bg-ink", ring: "ring-muted", border: "border-muted" },
};

/** One short line per card: how bad, how long, or how soon. */
export function summary(e: AgendaItem): string {
  switch (kindOf(e)) {
    case "status":
      return [levelLabel(e.tag), e.start ? timeAgo(e.start) : ""].filter(Boolean).join(" · ");
    case "model":
      return t("alert.modelNew");
    case "pr":
      return prLabel(e.tag);
    case "mention":
      return e.sender ? t("alert.mentionedBy", { name: senderName(e) }) : t("alert.mentioned");
    case "digest":
      return t("alert.digestSummary");
    case "task":
      return t("alert.taskReminder");
    default:
      return agendaStatus(e).label || t("alert.startingNow");
  }
}

type Props = { items: AgendaItem[]; selected: string; onSelect: (id: string) => void };

const ARROW = "grid size-7 shrink-0 place-items-center rounded-md text-muted transition hover:bg-edge hover:text-fg disabled:opacity-30 disabled:hover:bg-transparent";

/** Every pending alert as a carousel: arrows and ← → step through it, the wheel and a drag scroll it, the picked one stays in view. */
export default function AlertStrip({ items, selected, onSelect }: Props) {
  const row = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const index = Math.max(0, items.findIndex((e) => e.id === selected));

  // The picked card scrolls into view, whether it came from an arrow, the keyboard or a new alert arriving.
  useEffect(() => {
    const card = row.current?.querySelector<HTMLElement>(`[data-id="${CSS.escape(selected)}"]`);
    card?.scrollIntoView?.({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [selected]);

  const step = (by: number, focus = false) => {
    const next = items[(index + by + items.length) % items.length];
    if (!next) return;
    onSelect(next.id);
    if (focus) row.current?.querySelector<HTMLElement>(`[data-id="${CSS.escape(next.id)}"]`)?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    step(e.key === "ArrowLeft" ? -1 : 1, true);
  };

  // A mouse wheel only scrolls vertically; turn it sideways so the row moves under the pointer.
  const onWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (row.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) row.current.scrollLeft += e.deltaY;
  };

  // Dragging with the mouse scrolls like a touch swipe; a drag that moved doesn't count as picking the card under it.
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !row.current) return;
    drag.current = { x: e.clientX, left: row.current.scrollLeft, moved: false };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || !row.current) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 4) d.moved = true;
    if (d.moved) row.current.scrollLeft = d.left - dx;
  };
  const onClickCapture = (e: MouseEvent<HTMLDivElement>) => {
    if (drag.current?.moved) {
      e.stopPropagation();
      e.preventDefault();
    }
    drag.current = null;
  };

  return (
    <div data-alert-strip className="-mx-1 -mt-1 mr-7 flex min-w-0 items-center gap-0.5">
      <button type="button" onClick={() => step(-1)} aria-label={t("alert.prev")} className={ARROW}>
        <ChevronIcon dir="left" />
      </button>
      <div
        ref={row}
        role="group"
        aria-label={t("alert.strip")}
        onKeyDown={onKeyDown}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => drag.current && !drag.current.moved && (drag.current = null)}
        onPointerLeave={() => drag.current && !drag.current.moved && (drag.current = null)}
        onClickCapture={onClickCapture}
        className="flex min-w-0 flex-1 snap-x gap-1.5 overflow-x-auto scroll-smooth p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((e) => {
          const tone = TONE[toneOf(e)];
          const on = e.id === selected;
          return (
            <button
              key={e.id}
              data-id={e.id}
              type="button"
              aria-pressed={on}
              onClick={() => onSelect(e.id)}
              className={`w-32 shrink-0 snap-start rounded-lg border px-2 py-1 text-left transition ${tone.card} ${on ? `ring-1 ${tone.ring} ${tone.border}` : "opacity-70 hover:opacity-100"}`}
            >
              <span className="flex items-center gap-1.5">
                {e.sender ? (
                  <Avatar name={senderName(e)} email={e.sender.login} photo={e.sender.avatar} />
                ) : (
                  <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${tone.dot}`} />
                )}
                <span className="truncate text-[11.5px] font-semibold text-fg">{e.title}</span>
              </span>
              <span className="block truncate text-[10.5px] text-muted">{summary(e)}</span>
            </button>
          );
        })}
      </div>
      <button type="button" onClick={() => step(1)} aria-label={t("alert.next")} className={ARROW}>
        <ChevronIcon dir="right" />
      </button>
      <span aria-live="polite" className="shrink-0 px-1 font-mono text-[10.5px] tabular-nums text-faint">
        {t("alert.position", { n: index + 1, total: items.length })}
      </span>
    </div>
  );
}
