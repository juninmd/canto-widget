import { useCallback, useEffect, useRef, useState } from "react";
import { api, errText } from "../../lib/api";
import { useToast } from "../../lib/toast";
import { useWindowVisible } from "../../lib/useWindowVisible";
import { t } from "../../i18n";
import ConfirmButton from "../../components/ConfirmButton";
import ErrorBanner from "../../components/ErrorBanner";
import { CrossIcon, PlayIcon } from "../../components/Icons";
import type { CronListing, CronTask } from "./devTypes";
import { IconButton, Panel, Row, StatLine, Sub, Switch } from "./DevBits";
import { describeCron, nextLabel, nextRuns } from "./cron";

const POLL_MS = 20000;

/** The scheduled tasks of this machine: the crontab on Linux and macOS, the Task Scheduler on Windows. */
export default function DevCron() {
  const [list, setList] = useState<CronListing | null>(null);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [expr, setExpr] = useState("0 9 * * 1-5");
  const [command, setCommand] = useState("");
  const notify = useToast();
  const visible = useWindowVisible();
  const live = useRef(true);

  const load = useCallback(() => api.devCronList().then((l) => live.current && (setList(l), setError("")), (e) => live.current && setError(errText(e) || t("dev.error"))), []);

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

  async function change(action: string, task: CronTask | null, done?: string, extra: { name?: string; expr?: string; command?: string } = {}) {
    try {
      await api.devCronChange({ action, id: task?.id ?? "", raw: task?.raw ?? "", ...extra });
      if (done) notify({ message: done });
      await load();
    } catch (e) {
      notify({ message: errText(e), type: "erro" });
    }
  }

  const now = new Date();
  const items = list?.items ?? [];
  const runs = nextRuns(expr, now, 3);
  const words = describeCron(expr);

  return (
    <>
      {error && <ErrorBanner message={error} onRetry={() => void load()} />}
      {list && !list.available && <p className="rounded-lg bg-warn/10 px-3 py-2 text-[12px] text-warn">{t("dev.cron.unavailable")}</p>}
      {list?.available && <StatLine items={[{ text: t("dev.cron.stat.tasks", { n: items.length }) }, { text: t("dev.cron.stat.active", { n: items.filter((i) => i.enabled).length }) }, { text: t("dev.cron.stat.failed", { n: items.filter((i) => i.last === "failed").length }), tone: "danger" }]} />}
      <ul className="flex flex-col">
        {items.map((task) => {
          const next = nextLabel(task, now);
          return (
            <Row key={task.id} className={task.enabled ? "" : "opacity-60"}>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-[13px] font-semibold text-fg">
                  <span className="truncate">{task.name}</span>
                  {!task.enabled ? <span className="text-[10.5px] font-semibold text-faint">{t("dev.cron.disabled")}</span> : task.last && <span className={`text-[10.5px] font-semibold ${task.last === "ok" ? "text-ok" : "text-danger"}`}>{t(task.last === "ok" ? "dev.cron.ok" : "dev.cron.failed")}</span>}
                </p>
                <Sub>{task.expr ? <span className="font-mono">{task.expr}</span> : t(`dev.cron.source.${list?.platform ?? "cron"}`)} · {task.command}</Sub>
                <Sub>{task.enabled ? (next ? t("dev.cron.next", { when: next }) : t("dev.cron.noNext")) : describeCron(task.expr) ?? ""}</Sub>
              </div>
              <IconButton label={t("dev.cron.run", { name: task.name })} onClick={() => void change("run", task, t("dev.cron.ran", { name: task.name }))}>
                <PlayIcon />
              </IconButton>
              {list?.can_create && (
                <ConfirmButton ask={t("dev.cron.removeAsk")} yes={t("dev.cron.remove", { name: task.name })} onConfirm={() => void change("remove", task)} ariaLabel={t("dev.cron.remove", { name: task.name })} className="canto-hit grid size-7 place-items-center rounded-md text-faint hover:bg-danger/15 hover:text-danger">
                  <CrossIcon />
                </ConfirmButton>
              )}
              <Switch on={task.enabled} label={t("dev.cron.toggle", { name: task.name })} onChange={() => void change("toggle", task)} />
            </Row>
          );
        })}
        {list?.available && items.length === 0 && <li className="px-2 py-6 text-center text-[12px] text-faint">{t("dev.cron.empty")}</li>}
      </ul>
      {list && !list.can_create && list.available && <p className="text-[11.5px] text-faint">{t("dev.cron.winNote")}</p>}
      {list?.can_create && (
        <Panel>
          <h3 className="text-[10.5px] font-semibold uppercase tracking-wider text-faint">{t("dev.cron.new")}</h3>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("dev.cron.name")} aria-label={t("dev.cron.name")} className="canto-field h-8 px-2.5 text-[12px]" />
          <input value={expr} onChange={(e) => setExpr(e.target.value)} aria-label={t("dev.cron.expr")} spellCheck={false} className="canto-field h-8 px-2.5 font-mono text-[11.5px]" />
          <input value={command} onChange={(e) => setCommand(e.target.value)} placeholder={t("dev.cron.command")} aria-label={t("dev.cron.command")} spellCheck={false} className="canto-field h-8 px-2.5 font-mono text-[11.5px]" />
          <p className={`text-[12px] font-medium ${words ? "text-accent-text" : "text-danger"}`}>{words ?? t("dev.cron.invalid")}</p>
          {runs.length > 0 && <p className="text-[11px] text-faint tabular-nums">{t("dev.cron.nextRuns", { list: runs.map((r) => r.toLocaleString(undefined, { weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })).join(" · ") })}</p>}
          <button
            type="button"
            disabled={!words}
            onClick={() => (name.trim() && command.trim() ? void change("add", null, t("dev.cron.created"), { name: name.trim(), expr: expr.trim(), command: command.trim() }).then(() => (setName(""), setCommand(""))) : notify({ message: t("dev.cron.fill"), type: "erro" }))}
            className="canto-hit min-h-[28px] self-start rounded-md bg-accent px-3 text-[12px] font-semibold text-on-accent disabled:opacity-40"
          >
            {t("dev.cron.create")}
          </button>
        </Panel>
      )}
    </>
  );
}
