import type { Note } from "../lib/api";
import { timeAgo } from "../lib/time";
import { highlight } from "../lib/highlight";
import { LOCALE, t } from "../i18n";
import { DownloadIcon, PinIcon } from "./Icons";

type Props = {
  note: Note;
  className: string;
  query: string;
  privacy: boolean;
  onOpen: () => void;
  onPin: () => void;
  onDelete: () => void;
  onTag: (tag: string) => void;
  onOpenLink: (kind: "task" | "event") => void;
  onExport: () => void;
};

export default function NoteCard({ note: n, className, query, privacy, onOpen, onPin, onDelete, onTag, onOpenLink, onExport }: Props) {
  const mask = privacy ? "blur-sm select-none" : "";
  const actionBtn = "grid size-6 shrink-0 place-items-center rounded focus-visible:opacity-100 group-hover:opacity-100";
  return (
    <li className={`group rounded-lg border bg-ink/60 p-2 ${n.fixada ? "border-accent/60" : "border-edge"} ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <button type="button" className="min-w-0 flex-1 text-left" onClick={onOpen}>
          <p className={`truncate text-sm font-medium text-fg ${mask}`}>{highlight(n.title, query)}</p>
          <p className={`mt-0.5 line-clamp-3 whitespace-pre-line break-words text-xs text-muted ${mask}`}>{highlight(n.body, query)}</p>
        </button>
        <button
          type="button"
          onClick={onPin}
          aria-pressed={!!n.fixada}
          aria-label={n.fixada ? t("notes.unpinLabel", { title: n.title }) : t("notes.pinLabel", { title: n.title })}
          title={n.fixada ? t("notes.unpinTitle") : t("notes.pinTitle")}
          // Pinned always stays visible: the pin is the sign for why the card is on top.
          className={`${actionBtn} ${n.fixada ? "text-accent" : "text-faint opacity-0 hover:text-fg"}`}
        >
          <PinIcon filled={!!n.fixada} />
        </button>
        <button
          type="button"
          onClick={onExport}
          aria-label={t("notes.exportLabel", { title: n.title })}
          title={t("notes.exportTitle")}
          className={`${actionBtn} text-faint opacity-0 hover:text-fg`}
        >
          <DownloadIcon />
        </button>
        <button type="button" onClick={onDelete} className={`${actionBtn} text-faint opacity-0 hover:text-danger`} aria-label={t("notes.deleteLabel", { title: n.title })}>
          ×
        </button>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-1">
          {n.link && (
            <button
              type="button"
              onClick={() => onOpenLink(n.link!.kind)}
              title={n.link.kind === "task" ? t("notes.goToTasks") : t("notes.goToAgenda")}
              className="min-h-6 max-w-full truncate rounded bg-edge px-1.5 text-[11px] text-muted hover:text-fg"
            >
              {n.link.kind === "task" ? "✓" : "📅"} {n.link.label}
            </button>
          )}
          {n.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTag(tag)}
              title={t("notes.filterByTag", { tag })}
              className="min-h-6 rounded bg-edge px-1.5 text-[11px] text-muted hover:text-fg"
            >
              #{tag}
            </button>
          ))}
        <span className="ml-auto text-[11px] text-faint" title={new Date(n.updated_at).toLocaleString(LOCALE)}>
          {t("notes.edited", { ago: timeAgo(n.updated_at) })}
        </span>
      </div>
    </li>
  );
}
