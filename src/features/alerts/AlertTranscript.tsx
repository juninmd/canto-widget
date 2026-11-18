import { useEffect, useState } from "react";
import { api, type AgendaItem, type TranscriptMeta } from "../../lib/api";
import { t } from "../../i18n";

const RECENT_DAYS = 30;
const SHOWN_CHARS = 280;

/** The newest transcript of this meeting within the last weeks, or none. Names are matched by the meeting's title. */
export function recentTranscript(list: TranscriptMeta[], now = Date.now()): TranscriptMeta | null {
  const since = now - RECENT_DAYS * 86400_000;
  const fresh = list.filter((m) => m.modified_at >= since).sort((a, b) => b.modified_at - a.modified_at);
  return fresh[0] ?? null;
}

/** Before joining: how the last meeting went, when a transcript of it sits in the transcripts folder. Any failure hides it. */
export default function AlertTranscript({ event }: { event: AgendaItem }) {
  const [found, setFound] = useState<TranscriptMeta | null>(null);

  useEffect(() => {
    setFound(null);
    let live = true;
    api
      .transcriptsList(event.title)
      .then((list) => live && setFound(recentTranscript(list ?? [])))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [event.id]);

  if (!found) return null;
  const text = found.preview.replace(/\s+/g, " ").trim().slice(0, SHOWN_CHARS);
  return (
    <div data-transcript className="mt-2 space-y-1">
      <p className="text-[10px] uppercase tracking-widest text-faint">{t("alert.transcript")}</p>
      <p title={found.name} className="break-words rounded bg-edge px-2 py-1 text-xs text-fg">
        🎙 {text}
        {found.preview.length > SHOWN_CHARS && "…"}
      </p>
    </div>
  );
}
