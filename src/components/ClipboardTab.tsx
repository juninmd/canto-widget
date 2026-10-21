import { useEffect, useMemo, useRef, useState } from "react";
import { useQuerySeed } from "../lib/useQuerySeed";
import { api, errText, type ClipItem } from "../lib/api";
import { useUndo } from "../lib/useUndo";
import { useLatestRequest } from "../lib/useLatestRequest";
import { ENTER_CLASS, EXIT_CLASS, useNewIds, useExit } from "../lib/motion";
import { clipKind, kindCounts } from "../lib/clip";
import { t } from "../i18n";
import ClipCard from "./ClipCard";
import EmptyState from "./EmptyState";
import Skeleton from "./Skeleton";
import ClipNote from "./ClipNote";
import ClipClearConfirm from "./ClipClearConfirm";
import ClipGroups from "./ClipGroups";
import ClipKindChips, { type KindFilter } from "./ClipKindChips";
import ClipAgendaMenu from "./ClipAgendaMenu";
import { useCopied } from "../lib/useCopied";
import { useWindowVisible } from "../lib/useWindowVisible";
import { ClipboardIcon, SearchIcon } from "./Icons";

type Props = { privacy: boolean; initialQuery?: string; querySeq?: number; onError: (m: string) => void };

export default function ClipboardTab({ privacy, initialQuery, querySeq, onError }: Props) {
  const [query, setQuery] = useState(initialQuery ?? "");
  useQuerySeed(initialQuery, querySeq, setQuery);
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [items, setItems] = useState<ClipItem[]>([]);
  const [copied, flashCopied] = useCopied();
  const [confirmingClear, setConfirmingClear] = useState(false);
  const visibleWindow = useWindowVisible();
  // The poll fails the same way every 2.5s; the person hears about a given failure once, until it recovers.
  const lastError = useRef("");

  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const { leaving, leave } = useExit();
  const { bump, isLatest } = useLatestRequest();

  // The 150ms debounce and the 2.5s background poll can both be in flight at once; without this
  // guard, an older (slower) reply could land after a newer one and overwrite fresher data.
  async function reload(q = query) {
    const id = bump();
    try {
      const list = await api.clipList(q);
      if (!isLatest(id)) return;
      setItems(list.items);
      setLoadedFor(q);
      lastError.current = "";
    } catch (e) {
      const message = errText(e);
      if (isLatest(id) && message !== lastError.current) {
        lastError.current = message;
        onError(message);
      }
    }
  }

  const pinnedCount = items.filter((i) => i.pinned).length;
  // Under a search the list is partial, so only an unfiltered list says how much a clear removes.
  const clearable = loadedFor === "" && !query ? items.length - pinnedCount : -1;
  const counts = useMemo(() => kindCounts(items.map((i) => i.preview)), [items]);
  const visible = items.filter((i) => kindFilter === "all" || clipKind(i.preview) === kindFilter);

  useEffect(() => {
    // A hidden window has nobody watching the list; coming back reloads at once.
    if (!visibleWindow) return;
    const timer = setTimeout(() => void reload(query), 150);
    const tick = setInterval(() => void reload(query), 2500);
    return () => {
      clearTimeout(timer);
      clearInterval(tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, visibleWindow]);

  const undoable = useUndo(onError, () => reload());
  // The clipboard watcher brings in new items every 2.5s: they slide in at the top.
  const isNew = useNewIds(
    items.map((i) => i.id),
    loadedFor,
  );

  async function run(fn: () => Promise<unknown>) {
    try {
      await fn();
      await reload();
    } catch (e) {
      onError(errText(e));
    }
  }

  const filtering = query || kindFilter !== "all";

  return (
    <div className="flex h-full flex-col gap-2">
      <ClipNote />
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint">
            <SearchIcon />
          </span>
          <input
            value={query}
            data-shortcut="search"
            aria-label={t("clipboard.searchLabel")}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("clipboard.searchPlaceholder")}
            className="canto-field w-full py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <ClipAgendaMenu
          label={t("clipui.more")}
          actions={[{ label: t("clipui.clearMenu"), danger: true, disabled: clearable === 0, onSelect: () => setConfirmingClear(true) }]}
        />
      </div>
      {confirmingClear && (
        <ClipClearConfirm
          removing={clearable >= 0 ? clearable : null}
          pinned={pinnedCount}
          onCancel={() => setConfirmingClear(false)}
          onConfirm={() => {
            setConfirmingClear(false);
            void run(async () => undoable(await api.clipClear(), t("clipboard.cleared")));
          }}
        />
      )}
      <ClipKindChips counts={counts} total={items.length} value={kindFilter} onChange={setKindFilter} />

      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        <ClipGroups
          items={visible}
          card={(i) => (
            <ClipCard
              key={i.id}
              item={i}
              copied={copied === i.id}
              privacy={privacy}
              className={`${isNew(i.id) ? ENTER_CLASS : ""} ${leaving.has(i.id) ? EXIT_CLASS : ""}`}
              onCopy={() =>
                run(async () => {
                  await api.clipCopy(i.id);
                  flashCopied(i.id);
                })
              }
              onCopyAs={(mode) =>
                run(async () => {
                  await api.clipCopyAs(i.id, mode);
                  flashCopied(i.id);
                })
              }
              onPin={() => run(() => api.clipPin(i.id))}
              onDelete={() =>
                void leave(i.id, () => run(async () => undoable(await api.clipDelete(i.id), t("clipboard.itemDeleted"))))
              }
            />
          )}
        />
        {visible.length === 0 && (
          <ul>
            {loadedFor === null ? (
              <li>
                <Skeleton label={t("clipboard.loading")} />
              </li>
            ) : (
              <EmptyState icon={filtering ? <SearchIcon /> : <ClipboardIcon />}>{filtering ? t("clipboard.emptySearch") : t("clipboard.empty")}</EmptyState>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
