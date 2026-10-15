import { t } from "../i18n";

type Props = {
  /** Items the clear would remove, or null when a search hides part of the history and the count would mislead. */
  removing: number | null;
  pinned: number;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Inline question before wiping the history: says how many go and that pinned ones stay. */
export default function ClipClearConfirm({ removing, pinned, onConfirm, onCancel }: Props) {
  const ask = removing === null ? t("clipboard.clearAskAll") : removing === 1 ? t("clipboard.clearAskOne") : t("clipboard.clearAskMany", { n: removing });
  const keep = removing === null ? t("clipboard.clearKeepsPinned") : pinned > 0 ? t("clipboard.clearKeepPinned", { n: pinned }) : t("clipboard.clearNoPinned");
  return (
    <div role="alert" className="flex items-center gap-2 rounded-lg border border-line bg-ink px-2.5 py-1.5 text-xs">
      <span className="min-w-0 flex-1">
        <span className="font-medium text-fg">{ask}</span> <span className="text-muted">{keep}</span>
      </span>
      <button type="button" autoFocus onClick={onCancel} className="canto-hit min-h-[24px] rounded-md bg-edge px-2 text-fg hover:bg-active">
        {t("clipboard.clearCancel")}
      </button>
      <button type="button" onClick={onConfirm} className="canto-hit min-h-[24px] rounded-md border border-danger/60 px-2 font-semibold text-danger hover:bg-danger/10">
        {t("clipboard.clear")}
      </button>
    </div>
  );
}
