import { useEffect, useRef, useState } from "react";
import { api, errText, type AgendaItem, type ClipItem, type Note, type Task, type TranscriptMeta } from "../lib/api";
import { useLatestRequest } from "../lib/useLatestRequest";
import { fold, foldIncludes } from "../lib/fold";
import { t } from "../i18n";
import type { Tab } from "./TabBar";
import { Group, Row } from "./GlobalSearchGroup";

const CAP = 5;

/** Meeting transcripts live inside the Agenda tab; the jump tells App which of its two views to open. */
export type SearchTarget = Tab | "transcripts";

type Props = {
  today: string;
  privacy: boolean;
  /** Today's events as the agenda already loaded them: searching them costs no Google call. */
  agenda?: readonly AgendaItem[];
  onNavigate: (target: SearchTarget, query: string) => void;
  onClose: () => void;
  onError: (m: string) => void;
};

/** Only today's tasks are searched (a task of another day has nowhere to jump to); notes, clipboard and
 * transcripts are tab-wide. Everything stays local: no source here makes a network call. */
export default function GlobalSearch({ today, privacy, agenda = [], onNavigate, onClose, onError }: Props) {
  const [query, setQuery] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesTotal, setNotesTotal] = useState(0);
  const [clips, setClips] = useState<ClipItem[]>([]);
  // The query whose three lookups all settled: "nada encontrado" waits for it instead of flashing while they run.
  const [settled, setSettled] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const previous = useRef<Element | null>(null);
  const [transcripts, setTranscripts] = useState<TranscriptMeta[]>([]);
  const dialog = useRef<HTMLDivElement>(null);
  const { bump, isLatest } = useLatestRequest();
  const mask = privacy ? "blur-sm select-none" : "";

  useEffect(() => {
    previous.current = document.activeElement;
    input.current?.focus();
    return () => (previous.current as HTMLElement | null)?.focus?.();
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      bump();
      setTasks([]);
      setNotes([]);
      setNotesTotal(0);
      setClips([]);
      setSettled("");
      setTranscripts([]);
      return;
    }
    const timer = setTimeout(() => {
      const id = bump();
      const low = fold(q);
      const lookups = [
        api
          .tasksForDay(today)
          .then((all) => {
            if (!isLatest(id)) return;
            setTasks(all.filter((x) => foldIncludes(x.title, low)));
          }),
        api
          .notesSearch(q, CAP)
          .then((page) => {
            if (!isLatest(id)) return;
            setNotes(page.items);
            setNotesTotal(page.total);
          }),
        api
          .clipList(q)
          .then((list) => {
            if (!isLatest(id)) return;
            setClips(list.items);
          }),
      ];
      void Promise.allSettled(lookups).then((done) => {
        if (!isLatest(id)) return;
        setSettled(q);
        // One toast per search: a locked vault fails all three lookups with the same message.
        const failed = done.find((r) => r.status === "rejected");
        if (failed) onError(errText((failed as PromiseRejectedResult).reason));
      });
      // A folder that was never chosen is an empty search here, not an error worth interrupting for.
      void api
        .transcriptsList(q)
        .then((list) => isLatest(id) && setTranscripts(list))
        .catch(() => isLatest(id) && setTranscripts([]));
    }, 150);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, today]);

  const go = (target: SearchTarget) => onNavigate(target, query.trim());
  const low = fold(query.trim());
  const events = low ? agenda.filter((e) => foldIncludes(e.title, low)) : [];

  /** Arrows walk the input and then every result, so a result is never a mouse-only target. */
  function walk(e: React.KeyboardEvent) {
    const step = { ArrowDown: 1, ArrowUp: -1 }[e.key];
    if (!step) return;
    const stops = [input.current, ...(dialog.current?.querySelectorAll<HTMLElement>("[data-row]") ?? [])];
    const at = stops.indexOf(document.activeElement as HTMLElement);
    e.preventDefault();
    stops[Math.min(Math.max(at + step, 0), stops.length - 1)]?.focus();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("search.label")}
      ref={dialog}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onClose();
        } else walk(e);
      }}
      className="absolute inset-0 z-40 flex flex-col gap-3 rounded-2xl bg-panel p-4 text-fg motion-safe:animate-surgir motion-reduce:animate-fade"
    >
      <input
        ref={input}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("search.placeholder")}
        aria-label={t("search.label")}
        className="canto-field px-3 py-1.5 text-sm"
      />

      <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1">
        {!query.trim() ? (
          <p className="px-1 text-xs text-muted">{t("search.hint")}</p>
        ) : !(tasks.length || notes.length || clips.length || transcripts.length || events.length) ? (
          settled === query.trim() && <p className="px-1 text-xs text-muted">{t("search.empty")}</p>
        ) : (
          <>
            {tasks.length > 0 && (
              <Group title={t("search.groupTasks")} onOpen={() => go("tasks")}>
                {tasks.slice(0, CAP).map((x) => (
                  <Row key={x.id} text={x.title} mask={mask} onOpen={() => go("tasks")} />
                ))}
              </Group>
            )}
            {events.length > 0 && (
              <Group title={t("search.groupAgenda")} more={Math.max(events.length - CAP, 0)} onOpen={() => go("agenda")}>
                {events.slice(0, CAP).map((e) => (
                  <Row key={e.id} text={e.title} mask={mask} onOpen={() => go("agenda")} />
                ))}
              </Group>
            )}
            {notes.length > 0 && (
              <Group title={t("search.groupNotes")} more={Math.max(notesTotal - CAP, 0)} onOpen={() => go("notes")}>
                {notes.map((n) => (
                  <Row key={n.id} text={n.title || t("search.untitled")} mask={mask} onOpen={() => go("notes")} />
                ))}
              </Group>
            )}
            {transcripts.length > 0 && (
              <Group
                title={t("search.groupTranscripts")}
                more={Math.max(transcripts.length - CAP, 0)}
                onOpen={() => go("transcripts")}
              >
                {transcripts.slice(0, CAP).map((x) => (
                  <Row key={x.name} text={x.name} mask={mask} onOpen={() => go("transcripts")} />
                ))}
              </Group>
            )}
            {clips.length > 0 && (
              <Group title={t("search.groupClipboard")} onOpen={() => go("clipboard")}>
                {clips.slice(0, CAP).map((c) => (
                  <Row key={c.id} text={c.preview} mask={mask} onOpen={() => go("clipboard")} />
                ))}
              </Group>
            )}
          </>
        )}
      </div>
    </div>
  );
}
