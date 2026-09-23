import type { AgendaItem, NoteLink, Task } from "../lib/api";
import { t } from "../i18n";

type Props = { tasks: Task[]; agenda: AgendaItem[]; onPick: (link: NoteLink) => void; onClose: () => void };

/** Today's open tasks and agenda events, picked from once, no live re-sync afterward. */
export default function NoteLinkPicker({ tasks, agenda, onPick, onClose }: Props) {
  const open = tasks.filter((task) => !task.done);
  return (
    <div
      className="flex flex-col gap-1 rounded-lg border border-line bg-ink p-2 text-xs"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div className="flex items-center justify-between text-muted">
        <span>{t("notes.linkPickerTitle")}</span>
        <button type="button" onClick={onClose} className="min-h-6 px-1 hover:text-fg">
          {t("notes.linkPickerClose")}
        </button>
      </div>
      {open.length === 0 && agenda.length === 0 && <p className="px-1 py-1 text-faint">{t("notes.linkPickerEmpty")}</p>}
      <ul className="max-h-32 overflow-y-auto">
        {open.map((task) => (
          <li key={task.id}>
            <button
              type="button"
              onClick={() => onPick({ kind: "task", id: task.id, label: task.title })}
              className="w-full truncate rounded px-1.5 py-1 text-left text-fg hover:bg-edge"
            >
              ✓ {task.title}
            </button>
          </li>
        ))}
        {agenda.map((e) => (
          <li key={e.id}>
            <button
              type="button"
              onClick={() => onPick({ kind: "event", id: e.id, label: e.title })}
              className="w-full truncate rounded px-1.5 py-1 text-left text-fg hover:bg-edge"
            >
              📅 {e.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
