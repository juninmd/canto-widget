import type { AgendaItem } from "../lib/api";
import { status as agendaStatus } from "../lib/agenda";
import { kindOf, levelLabel, toneOf, type Tone } from "../lib/alerts";
import { timeAgo } from "../lib/time";
import { t } from "../i18n";

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
      return t(e.tag === "ci" ? "alert.pr.ci" : "alert.pr.stalled");
    case "mention":
      return t("alert.mentioned");
    case "task":
      return t("alert.taskReminder");
    default:
      return agendaStatus(e).label || t("alert.startingNow");
  }
}

type Props = { items: AgendaItem[]; selected: string; onSelect: (id: string) => void };

export default function AlertStrip({ items, selected, onSelect }: Props) {
  return (
    <div role="group" aria-label={t("alert.strip")} data-alert-strip className="flex gap-1.5 overflow-x-auto p-1">
      {items.map((e) => {
        const tone = TONE[toneOf(e)];
        const on = e.id === selected;
        return (
          <button
            key={e.id}
            type="button"
            aria-pressed={on}
            onClick={() => onSelect(e.id)}
            className={`min-w-28 flex-1 rounded-lg border px-2 py-1 text-left ${tone.card} ${on ? `ring-2 ring-offset-1 ring-offset-panel ${tone.ring}` : "opacity-80 hover:opacity-100"}`}
          >
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${tone.dot}`} />
              <span className="truncate text-xs font-semibold text-fg">{e.title}</span>
            </span>
            <span className="block truncate text-[10.5px] text-muted">{summary(e)}</span>
          </button>
        );
      })}
    </div>
  );
}
