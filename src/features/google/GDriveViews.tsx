import type { CSSProperties } from "react";
import type { DriveFile } from "../../lib/api";
import DataTable, { type Column } from "../../components/DataTable";
import { t } from "../../i18n";
import { formatBytes } from "./driveExtras";
import { shortWhen } from "./google";
import { KIND_COLOR } from "./GDriveRow";

type Props = { files: DriveFile[]; now: Date; onActivate: (file: DriveFile) => void };

const badge = (file: DriveFile) => (
  <span
    aria-hidden="true"
    className="grid shrink-0 place-items-center rounded-md text-[9px] font-bold tracking-wide"
    style={{ color: KIND_COLOR[file.kind], background: `color-mix(in srgb, ${KIND_COLOR[file.kind]} 18%, transparent)`, width: "100%", height: "3.5rem" }}
  >
    {t(`gdrive.kind.${file.kind}`)}
  </span>
);

/** Files as cards with a big kind badge: a folder enters in place, anything else opens in Drive. */
export function GDriveGrid({ files, now, onActivate }: Props) {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-2">
      {files.map((file, i) => (
        <li key={file.id} data-drive-file={file.id} className="wx-rise" style={{ "--i": Math.min(i, 12) } as CSSProperties}>
          <button
            type="button"
            onClick={() => onActivate(file)}
            title={file.name}
            className="canto-hit flex w-full flex-col gap-1.5 rounded-xl border border-edge bg-ink/60 p-2 text-left hover:bg-hover"
          >
            {badge(file)}
            <span className="truncate text-xs font-medium text-fg">
              {file.starred && <span className="text-warn">★ </span>}
              <span>{file.name}</span>
            </span>
            <span className="truncate text-[10px] text-faint">{shortWhen(new Date(file.modified), now)}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function driveColumns(now: Date, onActivate: (file: DriveFile) => void): Column<DriveFile>[] {
  return [
    {
      key: "name",
      label: t("gdrive.col.name"),
      render: (f) => (
        <button type="button" data-drive-file={f.id} onClick={() => onActivate(f)} title={f.name} className="canto-hit max-w-full truncate text-left font-medium text-fg hover:underline">
          {f.starred && <span className="text-warn">★ </span>}
          <span>{f.name}</span>
        </button>
      ),
      sort: (f) => f.name,
    },
    { key: "type", label: t("gdrive.col.type"), render: (f) => t(`gdrive.kind.${f.kind}`), sort: (f) => f.kind },
    { key: "who", label: t("gdrive.col.who"), render: (f) => f.editor || t("gdrive.col.you"), sort: (f) => f.editor },
    { key: "modified", label: t("gdrive.col.modified"), render: (f) => shortWhen(new Date(f.modified), now), sort: (f) => new Date(f.modified).getTime() || 0 },
    { key: "size", label: t("gdrive.col.size"), align: "right", render: (f) => (f.size > 0 ? formatBytes(f.size) : "—"), sort: (f) => f.size },
  ];
}

/** Files as a sortable table. */
export function GDriveTable({ files, now, onActivate }: Props) {
  return <DataTable label={t("gdrive.myDrive")} columns={driveColumns(now, onActivate)} rows={files} rowKey={(f) => f.id} />;
}
