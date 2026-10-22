import type { Note } from "../lib/api";
import { timeAgo } from "../lib/time";
import { highlight } from "../lib/highlight";
import { LOCALE, t } from "../i18n";
import { CrossIcon, DownloadIcon, PinIcon } from "./Icons";
import NoteLinkKind from "./NoteLinkKind";
import NoteThumbs from "./NoteThumbs";
import NotePreview from "./NotePreview";

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
  /** Grid cell: half the width, so the preview is clamped and the actions float over the corner. */
  compact?: boolean;
};

export default function NoteCard({ note: n, className, query, privacy, onOpen, onPin, onDelete, onTag, onOpenLink, onExport, compact = false }: Props) {
  const mask = privacy ? "blur-sm select-none" : "";
  const actionBtn = `${compact ? "bg-ink/90 " : ""}canto-hit grid size-6 shrink-0 place-items-center rounded-md hover:bg-hover active:bg-active focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100`;
  return (
    <li data-flip={n.id} className={`group relative rounded-xl border bg-ink/60 p-3 transition-colors hover:bg-ink ${n.fixada ? "border-accent/60" : "border-edge hover:border-line"} ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <button type="button" className="min-w-0 flex-1 text-left" onClick={onOpen}>
          <p className={`truncate text-sm font-medium text-fg ${compact ? `${n.fixada ? "pr-6" : ""} group-hover:pr-[4.5rem] group-focus-within:pr-[4.5rem]` : ""} ${mask}`}>{highlight(n.title, query)}</p>
          <NotePreview body={n.body} query={query} className={mask} compact={compact} />
          <NoteThumbs body={n.body} className={`mt-1 ${mask}`} />
        </button>
        {/* Reversed in the grid so the always-visible pin keeps the corner and the title only yields room on hover. */}
        <div className={compact ? "absolute right-1 top-1 flex flex-row-reverse rounded-lg" : "contents"}>
          <button
            type="button"
            onClick={onPin}
            aria-pressed={!!n.fixada}
            aria-label={n.fixada ? t("notes.unpinLabel", { title: n.title }) : t("notes.pinLabel", { title: n.title })}
            title={n.fixada ? t("notes.unpinTitle") : t("notes.pinTitle")}
            // Pinned always stays visible: the pin is the sign for why the card is on top.
            className={`${actionBtn} ${n.fixada ? "text-accent-text" : "text-faint opacity-0 hover:text-fg"}`}
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
            <CrossIcon />
          </button>
        </div>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-1">
          {n.link && (
            <button
              type="button"
              onClick={() => onOpenLink(n.link!.kind)}
              title={privacy ? undefined : n.link.kind === "task" ? t("notes.goToTasks") : t("notes.goToAgenda")}
              className={`canto-hit min-h-[24px] max-w-full truncate rounded-md bg-edge px-1.5 text-[11px] text-muted hover:bg-active hover:text-fg ${mask}`}
            >
              <NoteLinkKind kind={n.link.kind} />
              {n.link.label}
            </button>
          )}
          {n.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTag(tag)}
              title={privacy ? undefined : t("notes.filterByTag", { tag })}
              className={`canto-hit min-h-[24px] rounded-md bg-edge px-1.5 text-[11px] text-muted hover:bg-active hover:text-fg ${mask}`}
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
