import { useEffect, useRef, useState } from "react";
import { api, errText, type TranscriptMeta } from "../lib/api";
import { highlight } from "../lib/highlight";
import { useLatestRequest } from "../lib/useLatestRequest";
import { useQuerySeed } from "../lib/useQuerySeed";
import EmptyState from "./EmptyState";
import GeminiDocs from "./GeminiDocs";
import { NoteIcon, SearchIcon } from "./Icons";
import Skeleton from "./Skeleton";
import TranscriptFolder from "./TranscriptFolder";
import TranscriptViewer from "./TranscriptViewer";
import { LOCALE, t } from "../i18n";

type Props = { privacy?: boolean; initialQuery?: string; querySeq?: number; onError: (m: string) => void };

export default function TranscriptsTab({ privacy = false, initialQuery, querySeq, onError }: Props) {
  const [dir, setDir] = useState("");
  const [editingDir, setEditingDir] = useState(false);
  const [query, setQuery] = useState(initialQuery ?? "");
  useQuerySeed(initialQuery, querySeq, setQuery);
  const [items, setItems] = useState<TranscriptMeta[]>([]);
  const [open, setOpen] = useState<{ name: string; text: string } | null>(null);
  // Folder error stays in the tab, next to the folder: it's context, not a loose alert (NN/g).
  const [folderError, setFolderError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const { bump, isLatest } = useLatestRequest();
  const [reading, setReading] = useState("");
  const cards = useRef(new Map<string, HTMLButtonElement>());
  const opened = useRef("");
  const mask = privacy ? "blur-sm select-none" : "";

  // The debounced search and an explicit "await reload()" (after changing the folder) can overlap;
  // without this guard, a slower older reply could land after a newer one and overwrite it.
  async function reload(q = query) {
    const id = bump();
    try {
      const dir = await api.transcriptsDir();
      if (!isLatest(id)) return;
      setDir(dir);
    } catch (e) {
      if (isLatest(id)) {
        onError(errText(e));
        setLoaded(true);
      }
      return;
    }
    try {
      const items = await api.transcriptsList(q);
      if (!isLatest(id)) return;
      setItems(items);
      setFolderError("");
    } catch (e) {
      if (!isLatest(id)) return;
      setItems([]);
      setFolderError(errText(e));
    } finally {
      if (isLatest(id)) setLoaded(true);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => void reload(query), 150);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Back from a transcript lands on the card that was opened, not at the top of the page.
  useEffect(() => {
    if (open === null && opened.current) cards.current.get(opened.current)?.focus();
  }, [open]);

  async function read(name: string) {
    if (reading) return;
    setReading(name);
    try {
      opened.current = name;
      setOpen({ name, text: await api.transcriptRead(name) });
    } catch (e) {
      onError(errText(e));
    } finally {
      setReading("");
    }
  }

  async function saveDir(next: string) {
    try {
      await api.transcriptsSetDir(next);
      setEditingDir(false);
      await reload();
    } catch (err) {
      onError(errText(err));
    }
  }

  if (open) {
    return <TranscriptViewer name={open.name} text={open.text} query={query} privacy={privacy} onBack={() => setOpen(null)} onError={onError} />;
  }

  const noFiles = loaded && items.length === 0 && !folderError;

  return (
    <div className="flex h-full flex-col gap-2">
      <TranscriptFolder dir={dir} editing={editingDir} onEdit={() => setEditingDir(true)} onClose={() => setEditingDir(false)} onSave={saveDir} />

      <input
        type="search"
        value={query}
        data-shortcut="search"
        aria-label={t("transcripts.searchLabel")}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("transcripts.searchPlaceholder")}
        className="canto-field px-3 py-1.5 text-sm"
      />

      <div className="flex-1 overflow-y-auto pr-1">
        <GeminiDocs query={query} quietWhenEmpty={noFiles} />
        {items.length > 0 && <h3 className="mb-1 text-xs font-semibold text-fg">{t("transcripts.filesHeading")}</h3>}
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.name}>
              <button
                type="button"
                ref={(el) => {
                  if (el) cards.current.set(item.name, el);
                  else cards.current.delete(item.name);
                }}
                onClick={() => void read(item.name)}
                aria-busy={reading === item.name}
                aria-disabled={reading !== "" && reading !== item.name}
                className="w-full rounded-lg border border-edge bg-ink/60 p-2 text-left hover:border-line hover:bg-hover focus-visible:border-accent active:bg-active aria-busy:opacity-60"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p className={`truncate text-sm font-medium text-fg ${mask}`}>{highlight(item.name, query)}</p>
                  <span className="shrink-0 text-[11px] text-faint">
                    {new Date(item.modified_at).toLocaleDateString(LOCALE)}
                  </span>
                </div>
                <p className={`mt-0.5 line-clamp-3 text-xs text-muted ${mask}`}>{highlight(item.preview, query)}</p>
              </button>
            </li>
          ))}
          {items.length === 0 && folderError && (
            <li role="alert" className="flex flex-col items-center gap-2 px-2 py-6 text-center text-xs text-danger">
              <span className="break-all">{folderError}</span>
              <button type="button" onClick={() => setEditingDir(true)} className="canto-hit min-h-7 rounded-lg bg-edge px-3 text-fg">
                {t("transcripts.pickOtherFolder")}
              </button>
            </li>
          )}
          {!loaded && (
            <li>
              <Skeleton label={t("transcripts.loading")} />
            </li>
          )}
          {noFiles && (
            <EmptyState icon={query ? <SearchIcon /> : <NoteIcon />}>
              {query ? t("transcripts.emptySearch") : t("transcripts.empty")}
            </EmptyState>
          )}
        </ul>
        <p role="status" className={reading ? "mt-2 text-[11px] text-faint" : ""}>
          {reading ? t("transcripts.opening", { name: reading }) : ""}
        </p>
      </div>
    </div>
  );
}
