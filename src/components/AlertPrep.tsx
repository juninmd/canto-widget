import { useEffect, useState } from "react";
import { api, type AgendaItem, type Note } from "../lib/api";
import { meetingNoteDraft, relatedNotes } from "../lib/meetingNote";
import { t } from "../i18n";

const SEARCH_LIMIT = 30;
const LINK = "w-full break-words rounded bg-edge px-2 py-1 text-left text-xs text-fg";

/** Before joining: earlier notes of this meeting and one click to start today's. Needs the vault, so it stays out of a locked pop-up. */
export default function AlertPrep({ event, onOpenNotes }: { event: AgendaItem; onOpenNotes?: () => void }) {
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [made, setMade] = useState<Note | null>(null);

  useEffect(() => {
    setMade(null);
    let live = true;
    api
      .notesSearch(event.title, SEARCH_LIMIT)
      .then((page) => live && setNotes(relatedNotes(page.items, event)))
      .catch(() => live && setNotes(null));
    return () => {
      live = false;
    };
  }, [event.id]);

  if (notes === null) return null;
  const create = () => {
    const { title, body, tags } = meetingNoteDraft(event);
    void api.noteSave({ title, body, tags }).then(setMade);
  };

  return (
    <div className="mt-2 space-y-1">
      {notes.length > 0 && <p className="text-[10px] uppercase tracking-widest text-faint">{t("alert.prep.related")}</p>}
      {notes.map((n) => (
        <button key={n.id} type="button" onClick={onOpenNotes} title={t("alert.prep.open")} className={LINK}>
          📝 {n.title}
        </button>
      ))}
      {made ? (
        <button type="button" onClick={onOpenNotes} className={`${LINK} text-accent-text`}>
          ✓ {t("alert.prep.created", { title: made.title })}
        </button>
      ) : (
        <button type="button" onClick={create} className={LINK}>
          ＋ {t("alert.prep.create")}
        </button>
      )}
    </div>
  );
}
