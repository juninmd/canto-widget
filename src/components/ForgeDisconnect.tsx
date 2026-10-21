import { useEffect, useRef, useState } from "react";
import { t } from "../i18n";
import ForgeMenu from "./ForgeMenu";
import { MoreIcon } from "./Icons";

const BTN = "canto-hit inline-flex min-h-[24px] items-center rounded-md px-1.5 hover:bg-hover hover:text-fg active:bg-active";

/** Dropping the token is not undoable from here: the "···" menu offers it, then asks once, inline, before doing it. */
export default function ForgeDisconnect({ onConfirm }: { onConfirm: () => void }) {
  const [asking, setAsking] = useState(false);
  const root = useRef<HTMLSpanElement>(null);
  const was = useRef(false);

  // Backing out of the question puts focus back on the menu button that raised it.
  useEffect(() => {
    if (was.current && !asking) root.current?.querySelector<HTMLElement>("[aria-haspopup]")?.focus();
    was.current = asking;
  }, [asking]);

  if (!asking) {
    return (
      <span ref={root}>
        <ForgeMenu
          label={t("uiForge.more")}
          icon={<MoreIcon />}
          items={[{ key: "disconnect", label: t("forge.disconnect"), danger: true, onSelect: () => setAsking(true) }]}
        />
      </span>
    );
  }
  return (
    <span
      ref={root}
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
        className={`${BTN} font-semibold text-danger`}
      >
        {t("forge.disconnectYes")}
      </button>
      <button type="button" autoFocus onClick={() => setAsking(false)} className={BTN}>
        {t("forge.disconnectNo")}
      </button>
    </span>
  );
}
