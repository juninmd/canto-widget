import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api, errText } from "../../lib/api";
import { IS_WINDOWS } from "../../lib/platform";
import { useToast } from "../../lib/toast";
import { useWindowVisible } from "../../lib/useWindowVisible";
import { t } from "../../i18n";
import { bytes } from "../system/system";
import ConfirmButton from "../../components/ConfirmButton";
import ErrorBanner from "../../components/ErrorBanner";
import { CrossIcon, MoreIcon, PlusIcon } from "../../components/Icons";
import type { PortEntry } from "./devTypes";
import { Chip, CopyLine, IconButton, Panel, Row, SearchField, StatLine, Sub, Switch } from "./DevBits";
import { filterPorts, freed, groupByProject, portCommands, portQuery, projectOf, siblings, sortPorts, type PortSort, type Proto } from "./ports";

const POLL_MS = 3000;
const FAV_KEY = "canto.devFavPorts";
const SORTS: PortSort[] = ["port", "name", "pid", "mem"];

function savedFavs(): number[] {
  try {
    const list: unknown = JSON.parse(localStorage.getItem(FAV_KEY) ?? "[]");
    return Array.isArray(list) ? list.filter((n): n is number => Number.isInteger(n)) : [];
  } catch {
    return [];
  }
}

const key = (e: PortEntry) => `${e.proto}:${e.port}:${e.pid}`;

/** Who holds which port: the live list, a search that doubles as "is 3000 free?", favorites and a kill that asks first. */
export default function DevPorts() {
  const [list, setList] = useState<PortEntry[] | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [proto, setProto] = useState<Proto>("all");
  const [onlyDev, setOnlyDev] = useState(true);
  const [group, setGroup] = useState(false);
  const [sort, setSort] = useState<PortSort>("port");
  const [more, setMore] = useState(false);
  const [open, setOpen] = useState("");
  const [favs, setFavs] = useState<number[]>(savedFavs);
  const [watched, setWatched] = useState<number[]>([]);
  const notify = useToast();
  const visible = useWindowVisible();
  const live = useRef(true);
  const watching = useRef<number[]>([]);
  watching.current = watched;

  const load = useCallback(
    () =>
      api.devPortsList().then(
        (l) => {
          if (!live.current) return;
          setList(l);
          setError("");
          const done = freed(watching.current, l);
          if (done.length) {
            done.forEach((port) => notify({ message: t("dev.ports.freedToast", { port }) }));
            setWatched((w) => w.filter((p) => !done.includes(p)));
          }
        },
        (e) => live.current && setError(errText(e) || t("dev.error")),
      ),
    [notify],
  );

  useEffect(() => {
    live.current = true;
    if (!visible) return;
    void load();
    const id = setInterval(() => void load(), POLL_MS);
    return () => {
      live.current = false;
      clearInterval(id);
    };
  }, [visible, load]);

  const saveFavs = (next: number[]) => {
    setFavs(next);
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(next));
    } catch {
      // Private mode: the favorites last until the window closes.
    }
  };

  async function kill(e: PortEntry, tree: boolean) {
    try {
      const n = await api.devPortKill(e.pid, tree);
      notify({ message: tree && n > 1 ? t("dev.ports.treeKilled", { n }) : t("dev.ports.killed", { name: e.name, pid: e.pid }) });
      void load();
    } catch (err) {
      notify({ message: errText(err), type: "erro" });
    }
  }

  const all = list ?? [];
  const shown = useMemo(() => sortPorts(filterPorts(all, { query, proto, onlyDev }), sort), [all, query, proto, onlyDev, sort]);
  const asked = portQuery(query);
  const holder = asked === null ? undefined : all.find((e) => e.port === asked);
  const busy = (p: number) => all.some((e) => e.port === p && e.proto === "TCP");

  const row = (e: PortEntry) => {
    const id = key(e);
    const expanded = open === id;
    const also = siblings(all, e);
    return (
      <Fragment key={id}>
        <Row>
          <span className="w-14 shrink-0 font-mono text-[15px] font-semibold text-accent-text tabular-nums">{e.port}</span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 truncate text-[13px] font-semibold text-fg">
              {e.name}
              {e.exposed && (
                <span className="text-[10.5px] font-semibold text-warn" title={t("dev.ports.exposedTip")}>
                  {t("dev.ports.exposed")}
                </span>
              )}
              {watched.includes(e.port) && <span className="text-[10.5px] font-semibold text-accent-text">{t("dev.ports.watching")}</span>}
            </p>
            <Sub>
              {e.proto} · PID {e.pid} · {projectOf(e)}
              {e.mem > 0 && ` · ${bytes(e.mem)}`}
            </Sub>
          </div>
          <IconButton label={t("dev.ports.details", { name: e.name })} on={expanded} onClick={() => setOpen(expanded ? "" : id)}>
            <MoreIcon />
          </IconButton>
          <ConfirmButton
            ask={t("dev.ports.confirmAsk", { name: e.name })}
            yes={t("dev.ports.confirmYes")}
            onConfirm={() => void kill(e, false)}
            ariaLabel={t("dev.ports.kill", { name: e.name })}
            className="canto-hit grid size-7 place-items-center rounded-md text-faint hover:bg-danger/15 hover:text-danger"
          >
            <CrossIcon />
          </ConfirmButton>
        </Row>
        {expanded && (
          <li className="mb-1 list-none">
          <Panel>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[11px]">
              <dt className="text-faint">{t("dev.ports.command")}</dt>
              <dd className="break-all text-muted">{e.cmd || e.name}</dd>
              <dt className="text-faint">{t("dev.ports.parent")}</dt>
              <dd className="text-muted">PID {e.ppid}{also.length > 0 && ` · ${t("dev.ports.alsoHolds", { ports: also.join(", ") })}`}</dd>
            </dl>
            <div className="flex flex-wrap gap-1">
              <button type="button" onClick={() => void kill(e, true)} className="canto-hit min-h-[26px] rounded-md bg-danger/12 px-2 text-[11.5px] font-medium text-danger hover:bg-danger/20">
                {t("dev.ports.killTree")}
              </button>
              <button type="button" onClick={() => setWatched((w) => (w.includes(e.port) ? w.filter((p) => p !== e.port) : [...w, e.port]))} className="canto-hit min-h-[26px] rounded-md bg-hover px-2 text-[11.5px] font-medium text-muted hover:text-fg">
                {watched.includes(e.port) ? t("dev.ports.unwatch") : t("dev.ports.watch")}
              </button>
            </div>
            {portCommands(e, IS_WINDOWS).map((c) => (
              <CopyLine key={c} text={c} />
            ))}
          </Panel>
          </li>
        )}
      </Fragment>
    );
  };

  return (
    <>
      {error && <ErrorBanner message={error} onRetry={() => void load()} />}
      <StatLine items={[{ text: t("dev.ports.stat.inUse", { n: all.length }) }, { text: t("dev.ports.stat.tcp", { n: all.filter((e) => e.proto === "TCP").length }) }, { text: t("dev.ports.stat.exposed", { n: all.filter((e) => e.exposed).length }), tone: "warn" }]} />
      <div role="group" aria-label={t("dev.ports.favorites")} className="flex shrink-0 gap-1 overflow-x-auto pb-0.5">
        {favs.map((p) => (
          <span key={p} className="inline-flex shrink-0 items-center rounded-md bg-ink/70 text-[11.5px]">
            <button type="button" onClick={() => setQuery(String(p))} className="canto-hit inline-flex min-h-[24px] items-center gap-1.5 pl-2 pr-1 font-mono text-fg">
              <span aria-hidden="true" className={`size-1.5 rounded-full ${busy(p) ? "bg-danger" : "bg-ok"}`} />
              {p}
              <span className="sr-only">{busy(p) ? t("dev.ports.busy") : t("dev.ports.free")}</span>
            </button>
            <button type="button" aria-label={t("dev.ports.removeFav", { port: p })} onClick={() => saveFavs(favs.filter((f) => f !== p))} className="canto-hit grid size-6 place-items-center text-faint hover:text-danger">
              <CrossIcon />
            </button>
          </span>
        ))}
        {favs.length === 0 && <span className="px-1 text-[11px] text-faint">{t("dev.ports.favHint")}</span>}
      </div>
      <SearchField value={query} onChange={setQuery} placeholder={t("dev.ports.search")} id="dev-ports-search" />
      {asked !== null && (
        <Panel className="flex-row items-center">
          <span className={`text-[11px] font-semibold ${holder ? "text-danger" : "text-ok"}`}>{holder ? t("dev.ports.busy") : t("dev.ports.free")}</span>
          <span className="min-w-0 flex-1 truncate text-[12px] text-fg">{holder ? t("dev.ports.busyBy", { port: asked, name: holder.name, pid: holder.pid }) : t("dev.ports.freeMsg", { port: asked })}</span>
          {holder && (
            <button type="button" onClick={() => void kill(holder, false)} className="canto-hit min-h-[26px] rounded-md bg-danger/12 px-2 text-[11.5px] font-semibold text-danger hover:bg-danger/20">
              {t("dev.ports.freeIt")}
            </button>
          )}
          {!favs.includes(asked) && (
            <IconButton label={t("dev.ports.addFav", { port: asked })} onClick={() => saveFavs([...favs, asked].slice(-8))}>
              <PlusIcon />
            </IconButton>
          )}
        </Panel>
      )}
      <div className="flex shrink-0 flex-wrap items-center gap-1">
        {(["all", "TCP", "UDP"] as Proto[]).map((p) => (
          <Chip key={p} on={proto === p} onClick={() => setProto(p)}>
            {p === "all" ? t("dev.ports.all") : p}
          </Chip>
        ))}
        <span className="flex-1" />
        <label className="flex items-center gap-1.5 text-[11.5px] text-muted">
          {t("dev.ports.onlyDev")}
          <Switch on={onlyDev} onChange={setOnlyDev} label={t("dev.ports.onlyDev")} />
        </label>
        <IconButton label={t("dev.ports.options")} on={more} onClick={() => setMore(!more)}>
          <MoreIcon />
        </IconButton>
      </div>
      {more && (
        <div className="flex shrink-0 items-center gap-2">
          <Chip on={group} onClick={() => setGroup(!group)}>
            {t("dev.ports.group")}
          </Chip>
          <span className="flex-1" />
          <select value={sort} aria-label={t("dev.ports.sort")} onChange={(e) => setSort(e.target.value as PortSort)} className="canto-field h-7 px-1.5 text-[11.5px]">
            {SORTS.map((s) => (
              <option key={s} value={s}>
                {t("dev.ports.sort")}: {t(`dev.ports.sort.${s}`)}
              </option>
            ))}
          </select>
        </div>
      )}
      <ul className="flex flex-col">
        {list === null && !error ? null : shown.length === 0 ? (
          <li className="px-2 py-8 text-center text-[12px] text-faint">{t("dev.ports.empty")}</li>
        ) : group ? (
          groupByProject(shown).map(([name, items]) => (
            <li key={name} className="contents">
              <p className="mt-2 text-[10.5px] font-semibold uppercase tracking-wider text-faint">
                {name} · {items.length}
              </p>
              <ul className="flex flex-col">{items.map(row)}</ul>
            </li>
          ))
        ) : (
          shown.map(row)
        )}
      </ul>
    </>
  );
}
