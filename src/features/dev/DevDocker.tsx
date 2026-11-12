import { Fragment, useMemo, useState } from "react";
import { api, errText } from "../../lib/api";
import { useToast } from "../../lib/toast";
import { t } from "../../i18n";
import { bytes } from "../system/system";
import ConfirmButton from "../../components/ConfirmButton";
import { PlayIcon, PauseIcon } from "../../components/Icons";
import type { DockerContainer, DockerState } from "./devTypes";
import { Chip, CopyGlyph, CopyLine, IconButton, Panel, Row, SearchField, Section, StatLine, Sub, copyText } from "./DevBits";
import { filterContainers, groupContainers, isUp, logLevel, logsCommand, reclaimable, shellCommand, unused } from "./docker";

type Pane = "containers" | "images" | "volumes" | "networks";
const SUBS: Pane[] = ["containers", "images", "volumes", "networks"];
const LEVEL_TEXT = { error: "text-danger", warn: "text-warn", info: "text-muted", debug: "text-faint" };

const Glyph = ({ d }: { d: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
const RESTART = "M20 12a8 8 0 1 1-3-6.2M20 4v4h-4";
const LOGS = "M4 6l4 4-4 4M11 16h9";
const TRASH = "M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13";

function State({ c }: { c: DockerContainer }) {
  const [text, tone] = !isUp(c) ? [t("dev.docker.state.down"), "text-faint"] : c.health === "bad" ? [t("dev.docker.state.bad"), "text-danger"] : c.health === "starting" ? [t("dev.docker.state.starting"), "text-warn"] : [t("dev.docker.state.up"), "text-ok"];
  return <span className={`text-[10.5px] font-semibold ${tone}`}>{text}</span>;
}

function Cleaner({ text, count, onPrune }: { text: string; count: number; onPrune: () => void }) {
  return (
    <Panel className="flex-row items-center">
      <span className="min-w-0 flex-1 text-[12px] text-muted">{text}</span>
      <ConfirmButton ask={t("dev.docker.pruneAsk")} yes={t("dev.docker.prune")} onConfirm={onPrune} disabled={count === 0} className="canto-hit min-h-[26px] rounded-md bg-accent px-2.5 text-[11.5px] font-semibold text-on-accent disabled:opacity-40">
        {t("dev.docker.prune")}
      </ConfirmButton>
    </Panel>
  );
}

/** Containers by compose project, images, volumes and networks. Only mounted while the engine answers (DevTab hides it otherwise). */
export default function DevDocker({ state, reload }: { state: DockerState; reload: () => Promise<void> }) {
  const [sub, setSub] = useState<Pane>("containers");
  const [query, setQuery] = useState("");
  const [onlyRunning, setOnlyRunning] = useState(false);
  const [logFor, setLogFor] = useState("");
  const [lines, setLines] = useState<string[]>([]);
  const [level, setLevel] = useState<"all" | "error" | "warn">("all");
  const notify = useToast();

  async function act(kind: string, target: string, done?: string) {
    try {
      await api.devDockerAction(kind, target);
      if (done) notify({ message: done });
      await reload();
    } catch (e) {
      notify({ message: errText(e), type: "erro" });
    }
  }

  async function showLogs(name: string) {
    if (logFor === name) return setLogFor("");
    setLogFor(name);
    setLines([]);
    try {
      setLines(await api.devDockerLogs(name));
    } catch (e) {
      notify({ message: errText(e), type: "erro" });
    }
  }

  async function prune(kind: "images" | "volumes") {
    try {
      notify({ message: t("dev.docker.pruned", { msg: await api.devDockerPrune(kind) }) });
      await reload();
    } catch (e) {
      notify({ message: errText(e), type: "erro" });
    }
  }

  const groups = useMemo(() => groupContainers(filterContainers(state.containers, query, onlyRunning)), [state.containers, query, onlyRunning]);
  const up = state.containers.filter(isUp).length;
  const shownLines = lines.filter((l) => level === "all" || logLevel(l) === level || (level === "warn" && logLevel(l) === "error"));

  const container = (c: DockerContainer) => (
    <Fragment key={c.id}>
      <Row>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-fg">
            <span className="truncate">{c.name}</span>
            <State c={c} />
          </p>
          <Sub>{c.image}</Sub>
          {isUp(c) && <Sub>{t("dev.docker.cpuMem", { cpu: c.cpu.toFixed(0), mem: bytes(c.mem) })}</Sub>}
          {c.ports.length > 0 && (
            <div className="mt-0.5 flex flex-wrap gap-1">
              {c.ports.map((p) => (
                <button key={p} type="button" title={t("dev.docker.openPort", { port: p })} aria-label={t("dev.docker.openPort", { port: p })} onClick={() => void api.openLink(`http://localhost:${p}`).catch(() => {})} className="canto-hit rounded bg-accent/10 px-1.5 font-mono text-[10.5px] text-accent-text hover:bg-accent/20">
                  :{p}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap justify-end">
          {isUp(c) ? (
            <>
              <IconButton label={t("dev.docker.stop", { name: c.name })} onClick={() => void act("stop", c.name)}>
                <PauseIcon />
              </IconButton>
              <IconButton label={t("dev.docker.restart", { name: c.name })} onClick={() => void act("restart", c.name)}>
                <Glyph d={RESTART} />
              </IconButton>
            </>
          ) : (
            <IconButton label={t("dev.docker.start", { name: c.name })} onClick={() => void act("start", c.name)}>
              <PlayIcon />
            </IconButton>
          )}
          <IconButton label={t("dev.docker.logs", { name: c.name })} on={logFor === c.name} onClick={() => void showLogs(c.name)}>
            <Glyph d={LOGS} />
          </IconButton>
          <IconButton label={t("dev.docker.shell", { name: c.name })} onClick={() => copyText(shellCommand(c.name))}>
            <CopyGlyph />
          </IconButton>
        </div>
      </Row>
      {logFor === c.name && (
        <li className="list-none">
          <Panel className="mb-1">
            <div className="flex items-center gap-1">
              {(["all", "error", "warn"] as const).map((l) => (
                <Chip key={l} on={level === l} onClick={() => setLevel(l)}>
                  {l === "all" ? t("dev.ports.all") : l.toUpperCase()}
                </Chip>
              ))}
            </div>
            <div className="max-h-44 overflow-auto rounded-lg bg-ink/80 p-2 font-mono text-[10.5px] leading-relaxed">
              {shownLines.length === 0 ? <span className="text-faint">{t("dev.docker.logsEmpty")}</span> : shownLines.map((l, i) => (
                <div key={i} className={`whitespace-pre-wrap break-all ${LEVEL_TEXT[logLevel(l)]}`}>{l}</div>
              ))}
            </div>
            <CopyLine text={logsCommand(c.name)} />
          </Panel>
        </li>
      )}
    </Fragment>
  );

  return (
    <>
      <StatLine items={[{ text: t("dev.docker.running"), tone: "info" }, { text: t("dev.docker.version", { v: state.version, up, total: state.containers.length }) }]} />
      <div role="group" aria-label={t("dev.sub.docker")} className="flex shrink-0 gap-3 border-b border-edge/60">
        {SUBS.map((s) => (
          <button key={s} type="button" aria-pressed={sub === s} onClick={() => setSub(s)} className={`canto-hit -mb-px border-b-2 px-0.5 py-1.5 text-[12px] ${sub === s ? "border-accent font-semibold text-fg" : "border-transparent text-muted hover:text-fg"}`}>
            {t(`dev.docker.sub.${s}`)}
          </button>
        ))}
      </div>
      {sub === "containers" && (
        <>
          <div className="flex shrink-0 items-center gap-2">
            <div className="min-w-0 flex-1">
              <SearchField value={query} onChange={setQuery} placeholder={t("dev.docker.search")} />
            </div>
            <Chip on={onlyRunning} onClick={() => setOnlyRunning(!onlyRunning)}>
              {t("dev.docker.onlyRunning")}
            </Chip>
          </div>
          {groups.length === 0 && <p className="px-2 py-8 text-center text-[12px] text-faint">{t("dev.docker.empty")}</p>}
          {groups.map(([project, list]) => {
            const allUp = list.every(isUp);
            return (
              <Section
                key={project || "-"}
                title={project ? t("dev.docker.compose", { name: project }) : t("dev.docker.standalone")}
                right={
                  project ? (
                    <button type="button" onClick={() => void Promise.all(list.filter((c) => (allUp ? isUp(c) : !isUp(c))).map((c) => api.devDockerAction(allUp ? "stop" : "start", c.name))).then(reload, (e) => notify({ message: errText(e), type: "erro" }))} className="canto-hit rounded-md px-2 text-[11px] font-medium text-muted hover:bg-hover hover:text-fg">
                      {allUp ? t("dev.docker.stopGroup") : t("dev.docker.startGroup")}
                    </button>
                  ) : undefined
                }
              >
                <ul className="flex flex-col">{list.map(container)}</ul>
              </Section>
            );
          })}
        </>
      )}
      {sub === "images" && (
        <>
          <Cleaner onPrune={() => void prune("images")} count={unused(state.images).length} text={t("dev.docker.unusedImages", { n: unused(state.images).length, size: bytes(reclaimable(state.images)) })} />
          <ul className="flex flex-col">
            {state.images.map((i) => (
              <Row key={i.id + i.name}>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-[12px] text-fg">{i.name}</p>
                  <Sub>{bytes(i.size)} · {i.age} · <span className={i.used ? "text-ok" : "text-warn"}>{i.used ? t("dev.docker.inUse") : t("dev.docker.unused")}</span></Sub>
                </div>
                <IconButton label={t("dev.docker.remove", { name: i.name })} danger disabled={i.used} onClick={() => void act("rmi", i.id)}>
                  <Glyph d={TRASH} />
                </IconButton>
              </Row>
            ))}
          </ul>
        </>
      )}
      {sub === "volumes" && (
        <>
          <Cleaner onPrune={() => void prune("volumes")} count={unused(state.volumes).length} text={t("dev.docker.unusedVolumes", { n: unused(state.volumes).length })} />
          <ul className="flex flex-col">
            {state.volumes.map((v) => (
              <Row key={v.name}>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-[12px] text-fg">{v.name}</p>
                  <Sub><span className={v.used ? "text-ok" : "text-warn"}>{v.used ? t("dev.docker.inUse") : t("dev.docker.unused")}</span> · {v.detail}</Sub>
                </div>
                <IconButton label={t("dev.docker.remove", { name: v.name })} danger disabled={v.used} onClick={() => void act("volume-rm", v.name)}>
                  <Glyph d={TRASH} />
                </IconButton>
              </Row>
            ))}
            {state.volumes.length === 0 && <li className="px-2 py-8 text-center text-[12px] text-faint">{t("dev.docker.emptyList")}</li>}
          </ul>
        </>
      )}
      {sub === "networks" && (
        <ul className="flex flex-col">
          {state.networks.map((n) => (
            <Row key={n.name}>
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-[12px] text-fg">{n.name}</p>
                <Sub>{n.detail}</Sub>
              </div>
            </Row>
          ))}
        </ul>
      )}
    </>
  );
}
