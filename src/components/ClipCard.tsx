import type { ClipItem } from "../lib/api";
import { clipKind, compactCount, KIND_LABEL, sizeLabel } from "../lib/clip";
import { timeAgo } from "../lib/time";
import { LOCALE, t } from "../i18n";
import { PinIcon } from "./Icons";

type Props = {
  item: ClipItem;
  copied: boolean;
  className: string;
  privacy: boolean;
  onCopy: () => void;
  onPin: () => void;
  onDelete: () => void;
};

const SHOW_SIZE_FROM = 280;
const CODE_LINES = 4;

export default function ClipCard({ item: i, copied, className, privacy, onCopy, onPin, onDelete }: Props) {
  const kind = clipKind(i.preview);
  const codeLines = i.preview.replace(/\s+$/, "").split("\n");
  const copyTitle = i.truncated ? t("clipboard.copyTruncatedTitle", { size: sizeLabel(i.kept) }) : t("clipboard.copyAgainTitle");
  const actionBtn = "grid size-6 place-items-center rounded hover:text-fg";
  const mask = privacy ? "blur-sm select-none" : "";

  return (
    <li className={`group rounded-lg border bg-ink/60 p-2 ${i.pinned ? "border-accent/60" : "border-edge hover:border-line"} ${className}`}>
      <button type="button" className="w-full text-left" title={copyTitle} onClick={onCopy}>
        {kind === "color" ? (
          <span className="flex items-center gap-2">
            <span className="size-5 shrink-0 rounded border border-line" style={{ background: i.preview.trim() }} aria-hidden />
            <span className={`font-mono text-xs text-fg ${mask}`}>{i.preview.trim()}</span>
          </span>
        ) : kind === "code" || kind === "json" ? (
          <pre className={`overflow-hidden whitespace-pre rounded bg-panel px-2 py-1 font-mono text-[11px] leading-snug text-fg ${mask}`}>
            {codeLines.slice(0, CODE_LINES).join("\n")}
            {codeLines.length > CODE_LINES && <span className="block text-faint">…</span>}
          </pre>
        ) : (
          <p className={`line-clamp-3 whitespace-pre-wrap text-xs ${mask} ${kind === "link" ? "break-all text-accent" : "break-words text-fg"}`}>
            {i.preview}
          </p>
        )}
      </button>
      {i.truncated && (
        <p className="mt-1 rounded bg-edge px-2 py-1 text-[11px] text-muted">
          {t("clipboard.truncatedNote", { size: sizeLabel(i.chars), kept: compactCount(i.kept) })}
        </p>
      )}
      <div className="mt-1 flex items-center gap-2 text-[11px] text-faint">
        <span className="rounded bg-edge px-1.5 text-muted">{KIND_LABEL[kind]}</span>
        {copied ? (
          <span role="status" className="font-medium text-accent">
            {t("clipboard.copied")}
          </span>
        ) : (
          <span title={new Date(i.copied_at).toLocaleString(LOCALE)}>{timeAgo(i.copied_at)}</span>
        )}
        {i.chars >= SHOW_SIZE_FROM && !i.truncated && <span>· {sizeLabel(i.chars)}</span>}
        <span className="ml-auto flex gap-1">
          <button
            type="button"
            onClick={onPin}
            aria-pressed={i.pinned}
            aria-label={i.pinned ? t("clipboard.unpinLabel") : t("clipboard.pinLabel")}
            title={i.pinned ? t("clipboard.unpinTitle") : t("clipboard.pinTitle")}
            className={`${actionBtn} ${i.pinned ? "text-accent" : ""}`}
          >
            <PinIcon filled={i.pinned} />
          </button>
          <button type="button" onClick={onDelete} aria-label={t("clipboard.deleteLabel")} title={t("clipboard.deleteTitle")} className={`${actionBtn} hover:text-danger`}>
            ×
          </button>
        </span>
      </div>
    </li>
  );
}
