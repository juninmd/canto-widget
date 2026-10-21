import { t } from "../i18n";
import type { AgendaView } from "../lib/agendaView";

const VIEWS: AgendaView[] = ["today", "meetings"];
const LABEL = { today: "agenda.view.today", meetings: "plan.viewMeetings" } as const;

/** The Hoje / Reuniões switch, the left end of the agenda's single control row. */
export default function AgendaViewTabs({ view, onPick }: { view: AgendaView; onPick: (v: AgendaView) => void }) {
  return (
    <div role="group" aria-label={t("plan.viewLabel")} className="flex gap-0.5 rounded-xl border border-edge bg-ink/60 p-0.5 text-xs">
      {VIEWS.map((v) => (
        <button
          key={v}
          type="button"
          aria-pressed={view === v}
          onClick={() => onPick(v)}
          className={`canto-hit min-h-7 rounded-lg px-2.5 transition-colors ${view === v ? "bg-raised font-semibold text-accent-text shadow-[var(--shadow-raised)]" : "text-muted hover:bg-hover hover:text-fg active:bg-active"}`}
        >
          {t(LABEL[v])}
        </button>
      ))}
    </div>
  );
}
