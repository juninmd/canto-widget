import { t } from "../i18n";
import { useEffect, useMemo, useState } from "react";
import { MOD_KEY } from "../lib/platform";
import { api, errText, type AgendaItem, type ForgeOpened, type GeminiDoc, type Task } from "../lib/api";
import { dayStart, daySummary } from "../lib/summary";

export default function DaySummary({
  day,
  tasks,
  agenda,
  onClose,
  onError,
}: {
  day: string;
  tasks: Task[];
  agenda: AgendaItem[];
  onClose: () => void;
  onError: (m: string) => void;
}) {
  const [opened, setOpened] = useState<ForgeOpened | null>(null);
  const [geminiDocs, setGeminiDocs] = useState<GeminiDoc[]>([]);
  const text = useMemo(
    () => daySummary(day, tasks, agenda, { opened: opened?.items, merged: opened?.merged, reviewed: opened?.reviewed }, geminiDocs),
    [day, tasks, agenda, opened, geminiDocs],
  );

  // Served from Rust's forge cache; a forge that isn't connected simply adds nothing.
  useEffect(() => {
    let live = true;
    api
      .forgesOpenedSince(dayStart(day))
      .then((o) => live && setOpened(o))
      .catch((e) => live && setOpened({ items: [], errors: [errText(e)] }));
    return () => {
      live = false;
    };
  }, [day]);

  // Best-effort: no Google account connected, or nothing from Gemini today, just means no links.
  useEffect(() => {
    let live = true;
    const start = new Date(dayStart(day));
    const end = new Date(dayStart(day) + 24 * 60 * 60 * 1000);
    api
      .geminiDocs(start.toISOString(), end.toISOString())
      .then((d) => live && setGeminiDocs(d ?? []))
      .catch(() => live && setGeminiDocs([]));
    return () => {
      live = false;
    };
  }, [day]);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      onError(t("summary.copyFailed", { mod: MOD_KEY }));
    }
  }

  return (
    <section
      aria-label={t("summary.heading")}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      className="flex h-full min-h-0 flex-col gap-2 motion-safe:animate-aba"
    >
      <pre className="min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap rounded-lg border border-edge bg-ink/60 p-2 font-sans text-xs text-fg select-text">
        {text}
      </pre>
      {!opened && (
        <p role="status" className="text-[11px] text-faint">
          {t("summary.loadingForges")}
        </p>
      )}
      {opened?.errors.map((e) => (
        <p key={e} className="text-[11px] text-faint">
          {t("summary.forgeError", { error: e })}
        </p>
      ))}
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          autoFocus
          onClick={() => void copy()}
          className="flex-1 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-on-accent"
        >
          {copied ? t("summary.copied") : t("summary.copy")}
        </button>
        <button type="button" onClick={onClose} title="Esc" className="rounded-lg bg-edge px-3 py-1.5 text-sm text-fg">
          {t("summary.back")}
        </button>
      </div>
    </section>
  );
}
