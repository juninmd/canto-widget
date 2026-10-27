import { useEffect, useRef, useState } from "react";
import { api, errText } from "../lib/api";
import { parseMaxPinned } from "../lib/clip";
import { t } from "../i18n";
import { SettingsSection } from "./SettingsSection";

/** How many items the clipboard history lets stay pinned; it used to sit on the tab's top row. */
export default function ClipSection({ onError }: { onError: (m: string) => void }) {
  const [text, setText] = useState("100");
  // Until the first answer, or while typing, a late reply must not overwrite the field.
  const touched = useRef(false);

  useEffect(() => {
    let alive = true;
    api
      .clipList("")
      .then((list) => alive && !touched.current && typeof list?.max_pinned === "number" && setText(String(list.max_pinned)))
      .catch((e) => alive && onError(errText(e)));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function edit(next: string) {
    touched.current = true;
    setText(next);
    const max = parseMaxPinned(next);
    if (max === null) return;
    try {
      await api.clipSetMaxPinned(max);
    } catch (e) {
      onError(errText(e));
    }
  }

  return (
    <SettingsSection title={t("clipui.settingsTitle")}>
      <label className="flex min-h-[24px] items-center gap-2 text-xs text-muted" title={t("clipboard.maxPinnedTitle")}>
        {t("clipui.settingsMaxPinned")}
        <input
          type="number"
          min={1}
          max={1000}
          value={text}
          onChange={(e) => void edit(e.target.value)}
          aria-label={t("clipboard.maxPinnedLabel")}
          aria-invalid={parseMaxPinned(text) === null}
          className="canto-field w-20 !rounded-md px-1.5 py-0.5"
        />
      </label>
      <p className="text-[11px] text-faint">{t("clipui.settingsHint")}</p>
    </SettingsSection>
  );
}
