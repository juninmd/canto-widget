import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { RepoInfo } from "../../lib/api";
import type { Forge } from "./forge";
import type { Row } from "./repos";
import { offsetsOf, scrollToRow, windowRange } from "./virtual";
import { useRepoAvatars } from "./useRepoAvatars";
import RepoIcon from "./RepoIcon";
import { timeAgo } from "../../lib/time";
import { t } from "../../i18n";

const GROUP_H = 30;
const REPO_H = 52;
const REPO_TOPICS_H = 72;
const INDENT = 14;
const OVERSCAN = 6;
const TOPICS_SHOWN = 4;
/** Before the first measurement (and where there is no layout, as in tests) a screenful is assumed. */
const FALLBACK_VIEWPORT = 480;

const heightOf = (r: Row) => (r.kind === "group" ? GROUP_H : r.repo.topics.length > 0 ? REPO_TOPICS_H : REPO_H);
const domId = (key: string) => `rr-${key || "root"}`;
const TAG = "shrink-0 rounded-full bg-edge px-1.5 text-[10px] text-muted";

type Props = {
  forge: Forge;
  rows: Row[];
  /** Flat list: the name carries its group (`acme/atlas`) because there is no group row above it. */
  flat: boolean;
  selected: string | null;
  label: string;
  onToggle: (key: string) => void;
  onSelect: (repo: RepoInfo) => void;
};

/**
 * Groups and repositories as a windowed tree: however long the list (thousands of groups and repositories), only
 * the rows near the viewport exist in the DOM. One tab stop; the arrows walk the rows, Right/Left open and close
 * a group, Enter or Space opens it or shows the repository's details.
 */
export default function RepoTree({ forge, rows, flat, selected, label, onToggle, onSelect }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState(0);
  const [height, setHeight] = useState(FALLBACK_VIEWPORT);
  const [active, setActive] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  const offsets = useMemo(() => offsetsOf(rows.map(heightOf)), [rows]);
  const total = offsets[offsets.length - 1];

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => el.clientHeight > 0 && setHeight(el.clientHeight);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const watch = new ResizeObserver(measure);
    watch.observe(el);
    return () => watch.disconnect();
  }, []);

  // A new list (a search, a sort, a group closed) can be shorter than where the user was scrolled to.
  useEffect(() => {
    const el = box.current;
    if (el && el.scrollTop > Math.max(0, total - height)) {
      el.scrollTop = Math.max(0, total - height);
      setTop(el.scrollTop);
    }
  }, [total, height]);

  const [start, end] = windowRange(offsets, top, height, OVERSCAN);
  const visible = rows.slice(start, end);
  const icons = useRepoAvatars(
    forge,
    visible.flatMap((r) => (r.kind === "group" ? [r.avatar] : [r.repo.avatar_url])).filter(Boolean),
  );

  const index = Math.max(0, active === null ? -1 : rows.findIndex((r) => r.key === active));
  const current = rows[index] as Row | undefined;

  function go(i: number) {
    const next = rows[Math.max(0, Math.min(rows.length - 1, i))];
    if (!next) return;
    setActive(next.key);
    const el = box.current;
    if (el) {
      const to = scrollToRow(offsets, Math.max(0, Math.min(rows.length - 1, i)), el.scrollTop, height);
      if (to !== el.scrollTop) {
        el.scrollTop = to;
        setTop(to);
      }
    }
  }

  function press(row: Row) {
    setActive(row.key);
    if (row.kind === "group") onToggle(row.key);
    else onSelect(row.repo);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!current) return;
    const group = current.kind === "group" ? current : null;
    switch (e.key) {
      case "ArrowDown":
        go(index + 1);
        break;
      case "ArrowUp":
        go(index - 1);
        break;
      case "Home":
        go(0);
        break;
      case "End":
        go(rows.length - 1);
        break;
      case "PageDown":
        go(index + 8);
        break;
      case "PageUp":
        go(index - 8);
        break;
      case "ArrowRight":
        if (group && !group.open) onToggle(group.key);
        else if (group) go(index + 1);
        break;
      case "ArrowLeft":
        if (group?.open) onToggle(group.key);
        else {
          // The parent is the nearest group above that sits one level out.
          for (let i = index - 1; i >= 0; i--) {
            const r = rows[i];
            if (r.kind === "group" && r.depth < current.depth) {
              go(i);
              break;
            }
          }
        }
        break;
      case "Enter":
      case " ":
        press(current);
        break;
      default:
        return;
    }
    e.preventDefault();
  }

  return (
    <div
      ref={box}
      role="tree"
      tabIndex={0}
      aria-label={label}
      aria-activedescendant={focused && current ? domId(current.key) : undefined}
      onScroll={(e) => setTop(e.currentTarget.scrollTop)}
      onKeyDown={onKeyDown}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="min-h-0 flex-1 overflow-y-auto rounded-lg pr-1 outline-none focus-visible:ring-1 focus-visible:ring-accent-text"
    >
      <div role="none" className="relative" style={{ height: total }}>
        {visible.map((row, k) => {
          const i = start + k;
          const place = { top: offsets[i], height: heightOf(row), paddingLeft: row.depth * INDENT };
          const mark = focused && row.key === current?.key ? "outline outline-1 -outline-offset-1 outline-accent-text" : "";
          if (row.kind === "group") {
            const name = row.key === "" ? t("forge.repos.root") : row.name;
            return (
              <div
                key={`g:${row.key}`}
                id={domId(row.key)}
                role="treeitem"
                aria-level={row.depth + 1}
                aria-expanded={row.open}
                aria-label={t("forge.repos.groupLabel", { name, n: row.count })}
                onClick={() => press(row)}
                style={place}
                className={`absolute inset-x-0 flex cursor-pointer items-center gap-1.5 rounded-md px-1 text-[11px] font-semibold uppercase tracking-wide text-muted hover:text-fg ${mark}`}
              >
                <span aria-hidden="true" className={`inline-block transition-transform ${row.open ? "rotate-90" : ""}`}>
                  ▸
                </span>
                <RepoIcon src={icons(row.avatar)} name={name} size="sm" />
                <span className="min-w-0 truncate">{name}</span>
                <span className="rounded-full bg-edge px-1.5 text-[10px] font-normal normal-case text-faint">{row.count}</span>
              </div>
            );
          }
          const r = row.repo;
          const open = selected === row.key;
          return (
            <div
              key={`r:${row.key}`}
              id={domId(row.key)}
              role="treeitem"
              aria-level={row.depth + 1}
              aria-selected={open}
              aria-label={r.full_name}
              onClick={() => press(row)}
              style={{ ...place, paddingBottom: 4 }}
              className="absolute inset-x-0 cursor-pointer"
            >
              <div className={`flex h-full min-w-0 flex-col justify-center gap-0.5 rounded-lg border px-2.5 py-1 transition-colors ${open ? "border-accent-text bg-ink" : "border-edge bg-ink/60 hover:border-line hover:bg-ink"} ${mark}`}>
                <div className="flex min-w-0 items-center gap-1.5">
                  <RepoIcon src={icons(r.avatar_url)} name={r.name} />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-fg">{flat ? r.full_name : r.name}</span>
                  {r.private && <span className={TAG}>{t("forge.repos.private")}</span>}
                  {r.fork && <span className={TAG}>{t("forge.repos.fork")}</span>}
                  {r.archived && <span className={TAG}>{t("forge.repos.archived")}</span>}
                  <span className="shrink-0 text-[11px] text-muted" title={t("forge.repos.stars", { n: r.stars })}>
                    ★ {r.stars}
                  </span>
                  <span className="w-9 shrink-0 text-right text-[11px] text-faint">{r.updated_at && timeAgo(r.updated_at)}</span>
                </div>
                <div className={`truncate text-xs ${r.description ? "text-muted" : "text-faint"}`}>{r.description || t("forge.repos.noDescription")}</div>
                {r.topics.length > 0 && (
                  <div className="flex min-w-0 gap-1 overflow-hidden">
                    {r.topics.slice(0, TOPICS_SHOWN).map((topic) => (
                      <span key={topic} className="shrink-0 truncate rounded-full bg-accent/15 px-1.5 text-[10px] text-accent-text">
                        {topic}
                      </span>
                    ))}
                    {r.topics.length > TOPICS_SHOWN && <span className="shrink-0 text-[10px] text-faint">+{r.topics.length - TOPICS_SHOWN}</span>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
