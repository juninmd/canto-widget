import { useEffect, useRef, useState } from "react";
import { api, errText, type ClipItem, type Note, type Task } from "../lib/api";
import { useLatestRequest } from "../lib/useLatestRequest";
import { t } from "../i18n";
import type { Tab } from "./TabBar";

const CAP = 5;

type Props = {
  today: string;
  privacy: boolean;
  onNavigate: (tab: Tab, query: string) => void;
  onClose: () => void;
  onError: (m: string) => void;
};

/** Only tasks (today) and notes/clipboard (both tab-wide, not day-scoped) are searched: the app has
 * no day-navigation UI yet, so a match on another day's task would have nowhere to jump to. */
export default function GlobalSearch({ today, privacy, onNavigate, onClose, onError }: Props) {
  const [query, setQuery] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesTotal, setNotesTotal] = useState(0);
  const [clips, setClips] = useState<ClipItem[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const { bump, isLatest } = useLatestRequest();
  const mask = privacy ? "blur-sm select-none" : "";

  useEffect(() => input.current?.focus(), []);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      bump();
      setTasks([]);
      setNotes([]);
      setNotesTotal(0);
      setClips([]);
      return;
    }
    const timer = setTimeout(() => {
      const id = bump();
      const low = q.toLowerCase();
      void api
        .tasksForDay(today)
        .then((all) => isLatest(id) && setTasks(all.filter((x) => x.title.toLowerCase().includes(low))))
        .catch((e) => isLatest(id) && onError(errText(e)));
      void api
        .notesSearch(q, CAP)
        .then((page) => {
          if (!isLatest(id)) return;
          setNotes(page.items);
          setNotesTotal(page.total);
        })
        .catch((e) => isLatest(id) && onError(errText(e)));
      void api
        .clipList(q)
        .then((list) => isLatest(id) && setClips(list.items))
        .catch((e) => isLatest(id) && onError(errText(e)));
    }, 150);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, today]);

  function go(tab: Tab) {
    onNavigate(tab, query.trim());
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("search.label")}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onClose();
        }
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
        className="rounded-lg border border-line bg-ink px-3 py-1.5 text-sm text-fg outline-none focus:border-accent"
      />

      <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1">
        {!query.trim() ? (
          <p className="px-1 text-xs text-muted">{t("search.hint")}</p>
        ) : tasks.length === 0 && notes.length === 0 && clips.length === 0 ? (
          <p className="px-1 text-xs text-muted">{t("search.empty")}</p>
        ) : (
          <>
            <Group title={t("search.groupTasks")} empty={tasks.length === 0} onOpen={() => go("tasks")}>
              {tasks.slice(0, CAP).map((task) => (
                <li key={task.id} className={`truncate px-2.5 py-1.5 text-xs text-fg ${mask}`}>
                  {task.title}
                </li>
              ))}
            </Group>
            <Group
              title={t("search.groupNotes")}
              empty={notes.length === 0}
              more={notesTotal > CAP ? notesTotal - CAP : 0}
              onOpen={() => go("notes")}
            >
              {notes.map((n) => (
                <li key={n.id} className={`truncate px-2.5 py-1.5 text-xs text-fg ${mask}`}>
                  {n.title || t("search.untitled")}
                </li>
              ))}
            </Group>
            <Group title={t("search.groupClipboard")} empty={clips.length === 0} onOpen={() => go("clipboard")}>
              {clips.slice(0, CAP).map((c) => (
                <li key={c.id} className={`truncate px-2.5 py-1.5 text-xs text-fg ${mask}`}>
                  {c.preview}
                </li>
              ))}
            </Group>
          </>
        )}
      </div>
    </div>
  );
}

function Group({
  title,
  empty,
  more,
  onOpen,
  children,
}: {
  title: string;
  empty: boolean;
  more?: number;
  onOpen: () => void;
  children: React.ReactNode;
}) {
  if (empty) return null;
  return (
    <section className="mb-3 last:mb-0">
      <button
        type="button"
        onClick={onOpen}
        className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-faint hover:text-accent"
      >
        {title} →
      </button>
      <ul className="divide-y divide-edge rounded-lg border border-edge bg-ink/40">{children}</ul>
      {!!more && <p className="mt-1 px-1 text-[11px] text-faint">{t("search.more", { n: more })}</p>}
    </section>
  );
}
