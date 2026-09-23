import { useEffect, useState } from "react";
import { api, errText, type TranscriptMeta } from "../lib/api";
import { useLatestRequest } from "../lib/useLatestRequest";
import GeminiDocs from "./GeminiDocs";
import Skeleton from "./Skeleton";
import { LOCALE, t } from "../i18n";

export default function TranscriptsTab({ onError }: { onError: (m: string) => void }) {
  const [dir, setDir] = useState("");
  const [editingDir, setEditingDir] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<TranscriptMeta[]>([]);
  const [open, setOpen] = useState<{ name: string; text: string } | null>(null);
  // Folder error stays in the tab, next to the folder: it's context, not a loose alert (NN/g).
  const [folderError, setFolderError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const { bump, isLatest } = useLatestRequest();

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

  if (open) {
    return (
      <div className="flex h-full flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-fg">{open.name}</p>
          <button type="button" onClick={() => setOpen(null)} className="min-h-6 px-1 text-xs text-muted hover:text-fg">
            {t("transcripts.back")}
          </button>
        </div>
        <p className="flex-1 overflow-y-auto whitespace-pre-wrap rounded-lg border border-edge bg-ink p-2 text-xs leading-relaxed text-fg">
          {open.text}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-2">
      {editingDir ? (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await api.transcriptsSetDir(dir);
              setEditingDir(false);
              await reload();
            } catch (err) {
              onError(errText(err));
            }
          }}
          className="flex gap-1"
        >
          <input
            autoFocus
            value={dir}
            onChange={(e) => setDir(e.target.value)}
            className="flex-1 rounded-lg border border-line bg-ink px-2 py-1 text-[11px] text-fg outline-none focus:border-accent"
          />
          <button type="submit" className="rounded-lg bg-accent px-2 text-[11px] font-semibold text-on-accent">
            {t("transcripts.saveDir")}
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setEditingDir(true)}
          title={t("transcripts.changeDirTitle")}
          className="min-h-6 truncate text-left text-[11px] text-faint hover:text-muted"
        >
          {t("transcripts.folder", { dir: dir || t("transcripts.folderUnset") })}
        </button>
      )}

      <input
        value={query}
        data-shortcut="search"
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("transcripts.searchPlaceholder")}
        className="rounded-lg border border-line bg-ink px-3 py-1.5 text-sm text-fg outline-none focus:border-accent"
      />

      <div className="flex-1 overflow-y-auto pr-1">
        <GeminiDocs query={query} />
        <h3 className="mb-1 text-xs font-semibold text-fg">{t("transcripts.filesHeading")}</h3>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.name}>
              <button
                type="button"
                onClick={async () => {
                  try {
                    setOpen({ name: item.name, text: await api.transcriptRead(item.name) });
                  } catch (e) {
                    onError(errText(e));
                  }
                }}
                className="w-full rounded-lg border border-edge bg-ink/60 p-2 text-left"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-medium text-fg">{item.name}</p>
                  <span className="shrink-0 text-[11px] text-faint">
                    {new Date(item.modified_at).toLocaleDateString(LOCALE)}
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-3 text-xs text-muted">{item.preview}</p>
              </button>
            </li>
          ))}
          {items.length === 0 && folderError && (
            <li role="alert" className="flex flex-col items-center gap-2 px-2 py-6 text-center text-xs text-danger">
              <span className="break-all">{folderError}</span>
              <button
                type="button"
                onClick={() => setEditingDir(true)}
                className="min-h-7 rounded-lg bg-edge px-3 text-fg"
              >
                {t("transcripts.pickOtherFolder")}
              </button>
            </li>
          )}
          {!loaded && (
            <li>
              <Skeleton label={t("transcripts.loading")} />
            </li>
          )}
          {loaded && items.length === 0 && !folderError && (
            <li className="px-2 py-6 text-center text-xs text-faint">
              {query ? t("transcripts.emptySearch") : t("transcripts.empty")}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
