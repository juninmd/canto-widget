import { useState } from "react";
import { t } from "../i18n";

/** Dropping the token is not undoable from here, so the button asks once, inline, before it does it. */
export default function ForgeDisconnect({ onConfirm, className }: { onConfirm: () => void; className: string }) {
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return (
      <button type="button" onClick={() => setAsking(true)} className={className}>
        {t("forge.disconnect")}
      </button>
    );
  }
  return (
    <span
      role="group"
      aria-label={t("forge.disconnectAsk")}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          setAsking(false);
        }
      }}
      className="flex flex-wrap items-center gap-x-1 text-muted"
    >
      <span>{t("forge.disconnectAsk")}</span>
      <button
        type="button"
        onClick={() => {
          setAsking(false);
          onConfirm();
        }}
        className={`${className} font-semibold text-danger`}
      >
        {t("forge.disconnectYes")}
      </button>
      <button type="button" autoFocus onClick={() => setAsking(false)} className={className}>
        {t("forge.disconnectNo")}
      </button>
    </span>
  );
}
