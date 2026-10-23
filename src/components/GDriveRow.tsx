import type { CSSProperties } from "react";
import type { DriveFile } from "../lib/api";
import { formatBytes } from "../lib/driveExtras";
import { shortWhen } from "../lib/google";
import { t } from "../i18n";
import { LinkIcon } from "./Icons";

/** Badge color per kind, from the skin's category colors so every skin keeps them apart. */
export const KIND_COLOR: Record<DriveFile["kind"], string> = {
  doc: "var(--color-cat-meet)",
  sheet: "var(--color-cat-web)",
  slide: "var(--color-cat-docs)",
  pdf: "var(--color-cat-games)",
  other: "var(--color-cat-other)",
};
const ICON = "canto-hit grid size-6 place-items-center rounded-md text-muted hover:bg-hover hover:text-fg [&>svg]:size-3.5";

type Props = { file: DriveFile; index: number; now: Date; onOpen: (url: string) => void; onCopy: (file: DriveFile) => void };

/** One file: the kind badge tilts on hover, the name opens it, and the folder and link are a click away. */
export default function GDriveRow({ file, index, now, onOpen, onCopy }: Props) {
  const when = shortWhen(new Date(file.modified), now);
  const who = file.editor ? t("gdrive.byOther", { name: file.editor, when }) : t("gdrive.byYou", { when });
  return (
    <li data-drive-file={file.id} className="group canto-lift wx-rise flex items-center gap-2.5 p-2.5 hover:bg-hover" style={{ "--i": Math.min(index + 1, 12) } as CSSProperties}>
      <span
        aria-hidden="true"
        className="canto-stack canto-thumb grid size-8 shrink-0 place-items-center rounded-md text-[8px] font-bold tracking-wide"
        style={{ "--i": Math.min(index, 8), color: KIND_COLOR[file.kind], background: `color-mix(in srgb, ${KIND_COLOR[file.kind]} 18%, transparent)` } as CSSProperties}
      >
        {t(`gdrive.kind.${file.kind}`)}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-xs text-fg">{file.name}</span>
        <span className="truncate text-[11px] text-faint">{file.size > 0 ? `${who} · ${formatBytes(file.size)}` : who}</span>
      </span>
      {file.starred && <span role="img" aria-label={t("gdrive.starred")} className="canto-pop text-warn">★</span>}
      <span className="flex items-center gap-0.5 opacity-70 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        {file.folder && (
          <button type="button" aria-label={t("gdrive.openFolder", { name: file.name })} onClick={() => onOpen(file.folder)} className={ICON}>
            <span aria-hidden="true" className="text-xs leading-none">📁</span>
          </button>
        )}
        {file.link && (
          <button type="button" aria-label={t("gdrive.copyLink", { name: file.name })} onClick={() => onCopy(file)} className={ICON}>
            <LinkIcon />
          </button>
        )}
      </span>
      {file.link && (
        <button
          type="button"
          onClick={() => onOpen(file.link)}
          className="canto-hit rounded-md bg-accent/15 px-2 py-0.5 text-[11px] text-accent-text hover:bg-accent/25"
        >
          {t("gdrive.open")}
        </button>
      )}
    </li>
  );
}
