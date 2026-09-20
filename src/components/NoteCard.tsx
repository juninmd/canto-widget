import type { Note } from "../lib/api";
import { timeAgo } from "../lib/time";
import { highlight } from "../lib/highlight";
import { DownloadIcon, PinIcon } from "./Icons";

type Props = {
  note: Note;
  className: string;
  query: string;
  onOpen: () => void;
  onPin: () => void;
  onDelete: () => void;
  onTag: (tag: string) => void;
  onOpenLink: (kind: "task" | "event") => void;
  onExport: () => void;
};

export default function NoteCard({ note: n, className, query, onOpen, onPin, onDelete, onTag, onOpenLink, onExport }: Props) {
  const actionBtn = "grid size-6 shrink-0 place-items-center rounded focus-visible:opacity-100 group-hover:opacity-100";
  return (
    <li className={`group rounded-lg border bg-ink/60 p-2 ${n.fixada ? "border-accent/60" : "border-edge"} ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <button type="button" className="min-w-0 flex-1 text-left" onClick={onOpen}>
          <p className="truncate text-sm font-medium text-fg">{highlight(n.title, query)}</p>
          <p className="mt-0.5 line-clamp-3 whitespace-pre-line break-words text-xs text-muted">{highlight(n.body, query)}</p>
        </button>
        <button
          type="button"
          onClick={onPin}
          aria-pressed={!!n.fixada}
          aria-label={n.fixada ? `desafixar ${n.title}` : `fixar ${n.title} no topo`}
          title={n.fixada ? "desafixar" : "fixar no topo"}
          // Pinned always stays visible: the pin is the sign for why the card is on top.
          className={`${actionBtn} ${n.fixada ? "text-accent" : "text-faint opacity-0 hover:text-fg"}`}
        >
          <PinIcon filled={!!n.fixada} />
        </button>
        <button
          type="button"
          onClick={onExport}
          aria-label={`exportar ${n.title} como markdown`}
          title="exportar como .md"
          className={`${actionBtn} text-faint opacity-0 hover:text-fg`}
        >
          <DownloadIcon />
        </button>
        <button type="button" onClick={onDelete} className={`${actionBtn} text-faint opacity-0 hover:text-danger`} aria-label={`excluir ${n.title}`}>
          ×
        </button>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-1">
          {n.link && (
            <button
              type="button"
              onClick={() => onOpenLink(n.link!.kind)}
              title={n.link.kind === "task" ? "ir para Tarefas" : "ir para Agenda"}
              className="min-h-6 max-w-full truncate rounded bg-edge px-1.5 text-[11px] text-muted hover:text-fg"
            >
              {n.link.kind === "task" ? "✓" : "📅"} {n.link.label}
            </button>
          )}
          {n.tags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onTag(t)}
              title={`ver só cards com #${t}`}
              className="min-h-6 rounded bg-edge px-1.5 text-[11px] text-muted hover:text-fg"
            >
              #{t}
            </button>
          ))}
        <span className="ml-auto text-[11px] text-faint" title={new Date(n.updated_at).toLocaleString("pt-BR")}>
          editado {timeAgo(n.updated_at)}
        </span>
      </div>
    </li>
  );
}
