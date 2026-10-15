import { useState } from "react";
import { t } from "../i18n";

type Props = { dir: string; editing: boolean; onEdit: () => void; onClose: () => void; onSave: (dir: string) => Promise<void> };

/** The path is typed, not picked: cancelling (button or Esc) drops the draft and keeps the saved folder. */
export default function TranscriptFolder({ dir, editing, onEdit, onClose, onSave }: Props) {
  if (editing) return <FolderForm dir={dir} onClose={onClose} onSave={onSave} />;
  return (
    <button
      type="button"
      onClick={onEdit}
      title={dir ? `${dir}\n${t("transcripts.changeDirTitle")}` : t("transcripts.changeDirTitle")}
      className="canto-hit min-h-[24px] truncate text-left text-[11px] text-faint hover:text-muted"
    >
      {t("transcripts.folder", { dir: dir || t("transcripts.folderUnset") })}
    </button>
  );
}

/** Mounted only while editing, so every edit starts from the saved path. */
function FolderForm({ dir, onClose, onSave }: Pick<Props, "dir" | "onClose" | "onSave">) {
  const [draft, setDraft] = useState(dir);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void onSave(draft);
      }}
      onKeyDown={(e) => {
        if (e.key !== "Escape") return;
        e.stopPropagation();
        onClose();
      }}
      className="flex gap-1"
    >
      <input
        autoFocus
        value={draft}
        aria-label={t("transcripts.folderLabel")}
        onChange={(e) => setDraft(e.target.value)}
        className="canto-field min-w-0 flex-1 px-2 py-1 text-[11px]"
      />
      <button type="submit" className="canto-hit rounded-lg bg-accent px-2 text-[11px] font-semibold text-on-accent">
        {t("transcripts.saveDir")}
      </button>
      <button type="button" onClick={onClose} className="canto-hit rounded-lg bg-edge px-2 text-[11px] text-fg">
        {t("transcripts.cancelDir")}
      </button>
    </form>
  );
}
