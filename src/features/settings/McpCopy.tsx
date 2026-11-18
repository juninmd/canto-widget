import { useState } from "react";
import { t } from "../../i18n";

export const BTN = "canto-hit min-h-[24px] rounded-md border border-line px-2 text-xs text-muted hover:text-fg";
const PRIMARY = "canto-hit min-h-[28px] rounded-md border border-accent bg-accent/15 px-3 text-xs font-medium text-fg hover:bg-accent/25";

/** Copy button that says "copied" for a moment; a blocked clipboard just leaves the text selectable. */
export function CopyButton({ text, label, text2, primary }: { text: string; label?: string; text2?: string; primary?: boolean }) {
  const [done, setDone] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch {
      /* the text is on screen: the user can select it */
    }
  }
  return (
    <button type="button" onClick={() => void copy()} className={primary ? PRIMARY : BTN} aria-label={label}>
      {done ? t("settings.mcp.copied") : (text2 ?? t("settings.mcp.copy"))}
    </button>
  );
}
