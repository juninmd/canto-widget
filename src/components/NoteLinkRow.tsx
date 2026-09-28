import { useState } from "react";
import type { AgendaItem, NoteLink, Task } from "../lib/api";
import { t } from "../i18n";
import NoteLinkPicker from "./NoteLinkPicker";

type Props = { link: NoteLink | null; tasks: Task[]; agenda: AgendaItem[]; onLink: (link: NoteLink | null) => void };

/** The task or event this note belongs to: picked from today's list, shown with a way to undo it. */
export default function NoteLinkRow({ link, tasks, agenda, onLink }: Props) {
  const [picking, setPicking] = useState(false);
  if (picking) {
    return (
      <NoteLinkPicker
        tasks={tasks}
        agenda={agenda}
        onPick={(picked) => {
          onLink(picked);
          setPicking(false);
        }}
        onClose={() => setPicking(false)}
      />
    );
  }
  if (link) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted">
        <span className="min-w-0 flex-1 truncate">
          {link.kind === "task" ? "✓" : "📅"} {link.label}
        </span>
        <button type="button" onClick={() => onLink(null)} className="min-h-6 px-1 hover:text-danger">
          {t("notes.unlink")}
        </button>
      </div>
    );
  }
  return (
    <button type="button" onClick={() => setPicking(true)} className="min-h-6 self-start text-xs text-muted underline decoration-dotted hover:text-fg">
      {t("notes.link")}
    </button>
  );
}
