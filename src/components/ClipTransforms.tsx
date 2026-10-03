import type { ClipMode } from "../lib/api";
import { t } from "../i18n";

const LABEL: Record<ClipMode, () => string> = {
  json_pretty: () => t("clipboard.as.jsonPretty"),
  json_compact: () => t("clipboard.as.jsonCompact"),
  one_line: () => t("clipboard.as.oneLine"),
  upper: () => t("clipboard.as.upper"),
  lower: () => t("clipboard.as.lower"),
};

/** Shown on hover or focus so the list stays calm; each button copies the item rewritten that way. */
export default function ClipTransforms({ modes, onPick }: { modes: ClipMode[]; onPick: (mode: ClipMode) => void }) {
  if (modes.length === 0) return null;
  return (
    <div
      role="group"
      aria-label={t("clipboard.as.label")}
      title={t("clipboard.as.title")}
      className="mt-1 hidden flex-wrap gap-1 group-focus-within:flex group-hover:flex"
    >
      {modes.map((m) => (
        <button key={m} type="button" onClick={() => onPick(m)} className="rounded bg-edge px-1.5 py-0.5 text-[11px] text-muted hover:text-fg">
          {LABEL[m]()}
        </button>
      ))}
    </div>
  );
}
