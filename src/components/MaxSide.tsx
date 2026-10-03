import { useEffect, useState } from "react";
import { api, type AgendaItem, type Note } from "../lib/api";
import { timeAgo } from "../lib/time";
import { t } from "../i18n";
import AgendaCard from "./AgendaCard";

const RECENT_NOTES = 4;
const heading = "text-[10px] uppercase tracking-widest text-faint";

type Props = { agenda: AgendaItem[]; privacy: boolean; version: number };

/** The extra column of the maximized mode: today's agenda and the latest notes, beside the task list. */
export default function MaxSide({ agenda, privacy, version }: Props) {
  const [open, setOpen] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    let live = true;
    void api.notesSearch("", RECENT_NOTES).then(
      (page) => live && setNotes(page?.items ?? []),
      () => live && setNotes([]),
    );
    return () => {
      live = false;
    };
  }, [version]);

  return (
    <aside className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto border-l border-edge p-3 motion-safe:animate-entrar motion-reduce:animate-fade">
      <h2 className={heading}>{t("max.agenda")}</h2>
      {agenda.length === 0 ? (
        <p className="text-xs text-muted">{t("max.agendaEmpty")}</p>
      ) : (
        <ul className="space-y-2">
          {agenda.map((e) => (
            <AgendaCard key={e.id} event={e} open={open === e.id} onToggle={() => setOpen(open === e.id ? null : e.id)} />
          ))}
        </ul>
      )}
      <h2 className={`${heading} mt-1`}>{t("max.notes")}</h2>
      {notes.length === 0 ? (
        <p className="text-xs text-muted">{t("max.notesEmpty")}</p>
      ) : (
        <ul className="space-y-2">
          {notes.map((n) => (
            <li key={n.id} className="rounded-xl border border-edge bg-ink/60 p-3">
              <span className={`block truncate text-sm font-medium text-fg ${privacy ? "select-none blur-sm" : ""}`}>{n.title || "…"}</span>
              <span className="block text-[11px] text-faint">{t("notes.edited", { ago: timeAgo(n.updated_at) })}</span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
