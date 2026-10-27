import { useEffect, useRef, useState } from "react";
import { highlight } from "../lib/highlight";
import { t } from "../i18n";

type Props = { name: string; text: string; query: string; privacy: boolean; onBack: () => void; onError: (m: string) => void };

export default function TranscriptViewer({ name, text, query, privacy, onBack, onError }: Props) {
  const back = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);
  // One "copied" timer at a time, cleared when leaving: a stale one would flip the label early or fire after unmount.
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const mask = privacy ? "blur-sm select-none" : "";

  useEffect(() => back.current?.focus(), []);
  useEffect(() => () => clearTimeout(copiedTimer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      onError(t("transcripts.copyFailed"));
    }
  }

  return (
    <div
      onKeyDown={(e) => {
        if (e.key !== "Escape") return;
        e.stopPropagation();
        onBack();
      }}
      className="flex h-full flex-col gap-2"
    >
      <div className="flex items-center justify-between gap-2">
        <p className={`truncate text-sm font-medium text-fg ${mask}`}>{name}</p>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => void copy()}
            className="canto-hit min-h-[24px] rounded-md px-1.5 text-xs text-muted hover:bg-hover hover:text-fg active:bg-active"
          >
            {copied ? t("transcripts.copied") : t("transcripts.copy")}
          </button>
          <button
            ref={back}
            type="button"
            onClick={onBack}
            className="canto-hit min-h-[24px] rounded-md px-1.5 text-xs text-muted hover:bg-hover hover:text-fg active:bg-active"
          >
            {t("transcripts.back")}
          </button>
        </div>
      </div>
      <p tabIndex={0} className={`flex-1 overflow-y-auto whitespace-pre-wrap rounded-lg border border-edge bg-ink p-2 text-xs leading-relaxed text-fg ${mask}`}>
        {highlight(text, query)}
      </p>
    </div>
  );
}
