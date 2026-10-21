import type { ClipItem, ClipMode } from "../lib/api";
import { clipKind, clipTransforms, compactCount, KIND_LABEL, sizeLabel } from "../lib/clip";
import { timeAgo } from "../lib/time";
import { LOCALE, t } from "../i18n";
import ClipTransforms from "./ClipTransforms";
import ClipKindTile from "./ClipKindTile";
import { useState } from "react";
import { CrossIcon, MoreIcon, PinIcon } from "./Icons";

type Props = {
  item: ClipItem;
  copied: boolean;
  className: string;
  privacy: boolean;
  onCopy: () => void;
  onCopyAs: (mode: ClipMode) => void;
  onPin: () => void;
  onDelete: () => void;
};

const SHOW_SIZE_FROM = 280;
const CODE_LINES = 4;

export default function ClipCard({ item: i, copied, className, privacy, onCopy, onCopyAs, onPin, onDelete }: Props) {
  const kind = clipKind(i.preview);
  const codeLines = i.preview.replace(/\s+$/, "").split("\n");
  const copyTitle = i.truncated ? t("clipboard.copyTruncatedTitle", { size: sizeLabel(i.kept) }) : t("clipboard.copyAgainTitle");
  const actionBtn = "canto-hit grid size-7 place-items-center rounded-md text-muted hover:bg-hover hover:text-fg active:bg-active";
  const [asOpen, setAsOpen] = useState(false);
  const modes = i.truncated ? [] : clipTransforms(kind, i.preview);
  const mask = privacy ? "blur-sm select-none" : "";

  return (
    <li
      className={`group relative rounded-xl border bg-ink/60 p-2.5 transition-colors hover:bg-ink focus-within:border-line ${i.pinned ? "border-accent/60" : "border-edge hover:border-line"} ${className}`}
    >
      <div className="flex gap-2.5">
        <ClipKindTile kind={kind} color={kind === "color" ? i.preview.trim() : undefined} blur={privacy} />
        <div className="min-w-0 flex-1">
          {/* The button's ::after stretches over the whole card, so a click anywhere copies; the actions sit above it. */}
          <button type="button" className="block w-full text-left outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-accent" title={copyTitle} onClick={onCopy}>
            {kind === "color" ? (
              <span className={`block font-mono text-xs text-fg ${mask}`}>{i.preview.trim()}</span>
            ) : kind === "code" || kind === "json" ? (
              <pre className={`overflow-hidden whitespace-pre rounded bg-panel px-2 py-1 font-mono text-[11px] leading-snug text-fg ${mask}`}>
                {codeLines.slice(0, CODE_LINES).join("\n")}
                {codeLines.length > CODE_LINES && <span className="block text-faint">…</span>}
              </pre>
            ) : (
              <p className={`line-clamp-3 whitespace-pre-wrap text-xs ${mask} ${kind === "link" ? "break-all text-accent-text" : "break-words text-fg"}`}>
                {i.preview}
              </p>
            )}
          </button>
          {i.truncated && (
            <p className="mt-1 rounded bg-edge px-2 py-1 text-[11px] text-muted">
              {t("clipboard.truncatedNote", { size: sizeLabel(i.chars), kept: compactCount(i.kept) })}
            </p>
          )}
          <div className="mt-1 flex items-center gap-1 text-[11px] text-faint">
            <span className="first-letter:uppercase">{KIND_LABEL[kind]}</span>
            <span aria-hidden="true">·</span>
            {copied ? (
              <span role="status" className="font-medium text-accent-text">
                {t("clipboard.copied")}
              </span>
            ) : (
              <span title={new Date(i.copied_at).toLocaleString(LOCALE)}>{timeAgo(i.copied_at)}</span>
            )}
            {i.chars >= SHOW_SIZE_FROM && !i.truncated && <span>· {sizeLabel(i.chars)}</span>}
          </div>
        </div>
      </div>
      {asOpen && (
        <div className="relative">
          <ClipTransforms modes={modes} onPick={onCopyAs} />
        </div>
      )}
      <span className="absolute right-1.5 top-1.5 z-10 flex gap-0.5 rounded-lg border border-edge bg-panel p-0.5 opacity-0 shadow-raised focus-within:opacity-100 group-focus-within:opacity-100 group-hover:opacity-100 motion-safe:transition-opacity">
        {modes.length > 0 && (
          <button
            type="button"
            onClick={() => setAsOpen(!asOpen)}
            aria-expanded={asOpen}
            aria-label={t("clipboard.as.label")}
            title={t("clipboard.as.title")}
            className={`${actionBtn} ${asOpen ? "text-accent-text" : ""}`}
          >
            <MoreIcon />
          </button>
        )}
        <button
          type="button"
          onClick={onPin}
          aria-pressed={i.pinned}
          aria-label={i.pinned ? t("clipboard.unpinLabel") : t("clipboard.pinLabel")}
          title={i.pinned ? t("clipboard.unpinTitle") : t("clipboard.pinTitle")}
          className={`${actionBtn} ${i.pinned ? "text-accent-text" : ""}`}
        >
          <PinIcon filled={i.pinned} />
        </button>
        <button type="button" onClick={onDelete} aria-label={t("clipboard.deleteLabel")} title={t("clipboard.deleteTitle")} className={`${actionBtn} hover:text-danger`}>
          <CrossIcon />
        </button>
      </span>
    </li>
  );
}
