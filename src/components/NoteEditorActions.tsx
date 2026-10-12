import { MOD_KEY } from "../lib/platform";
import { t } from "../i18n";

type Props = {
  empty: boolean;
  /** Save was tried on an empty card (Ctrl+Enter): say why nothing happened. */
  emptyTried: boolean;
  confirmingDiscard: boolean;
  onKeepEditing: () => void;
  onDiscard: () => void;
  onCancel: () => void;
};

/** Save / cancel row; cancelling a card with unsaved typing asks inline before throwing it away. */
export default function NoteEditorActions({ empty, emptyTried, confirmingDiscard, onKeepEditing, onDiscard, onCancel }: Props) {
  if (confirmingDiscard) {
    return (
      <div role="alert" className="flex items-center gap-2 text-xs">
        <span className="min-w-0 flex-1 text-muted">{t("notes.discardAsk")}</span>
        <button type="button" autoFocus onClick={onKeepEditing} className="canto-hit min-h-[28px] rounded-lg bg-edge px-3 text-fg">
          {t("notes.keepEditing")}
        </button>
        <button type="button" onClick={onDiscard} className="canto-hit min-h-[28px] rounded-lg border border-danger/60 px-3 font-semibold text-danger hover:bg-danger/10">
          {t("notes.discard")}
        </button>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1">
      {emptyTried && empty && (
        <p role="alert" className="text-xs text-danger">
          {t("notes.saveEmpty")}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          // Not `disabled`: the body reaches the draft on a delay, and the click itself re-checks the real text.
          aria-disabled={empty}
          title={empty ? t("notes.saveEmpty") : `${MOD_KEY}+Enter`}
          className="flex-1 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-on-accent aria-disabled:opacity-50"
        >
          {t("notes.save")}
        </button>
        <button type="button" onClick={onCancel} title="Esc" className="rounded-lg bg-edge px-3 py-1.5 text-sm text-fg">
          {t("notes.cancel")}
        </button>
      </div>
    </div>
  );
}
