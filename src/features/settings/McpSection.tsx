import { useEffect, useState } from "react";
import { api, type McpPerms, type McpView } from "../../lib/api";
import { useSectionError } from "./useSectionError";
import { t, type MessageKey } from "../../i18n";
import { SettingsSection } from "./SettingsSection";
import ConfirmButton from "../../components/ConfirmButton";
import McpConnect from "./McpConnect";
import { BTN, CopyButton } from "./McpCopy";
import McpAgents from "./McpAgents";

const GROUPS: { title: MessageKey; keys: (keyof McpPerms)[] }[] = [
  { title: "settings.mcp.groupData", keys: ["notifications", "tasks", "agenda", "prs", "mentions", "repos", "system", "weather", "agents", "models", "status", "market", "steam", "health"] },
  { title: "settings.mcp.groupPrivate", keys: ["notes", "clipboard", "gmail", "contacts"] },
  { title: "settings.mcp.groupWrite", keys: ["tasks_write", "notes_write", "notify_write"] },
];

/** Local MCP server: on/off, port, token, one switch per resource and ready-made config for each agent. */
export default function McpSection({ onError }: { onError: (m: string) => void }) {
  const [view, setView] = useState<McpView | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [shown, setShown] = useState(false);
  const [busy, setBusy] = useState(false);
  const [port, setPort] = useState("");
  const { error, fail, clear } = useSectionError(onError);

  const load = () =>
    api.mcpGet().then((v) => {
      if (!v) return v;
      setView(v);
      setPort(String(v.port));
      return v;
    }, fail);

  useEffect(() => {
    void load().then((v) => {
      if (v?.enabled) void api.mcpToken().then(setToken, fail);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function run(job: () => Promise<McpView | string>) {
    if (busy) return;
    setBusy(true);
    clear();
    try {
      const out = await job();
      if (typeof out === "string") setToken(out);
      else {
        setView(out);
        setPort(String(out.port));
      }
    } catch (e) {
      fail(e);
      await load();
    } finally {
      setBusy(false);
    }
  }

  const toggle = (enabled: boolean) =>
    run(async () => {
      const v = await api.mcpSetEnabled(enabled);
      if (enabled) setToken(await api.mcpToken());
      return v;
    });
  const setPerm = (key: keyof McpPerms, on: boolean) => view && run(() => api.mcpSetPerms({ ...view.perms, [key]: on }));
  const applyPort = () => {
    const n = Number(port);
    if (view && Number.isInteger(n) && n !== view.port) void run(() => api.mcpSetPort(n));
  };

  const perm = (key: keyof McpPerms) => (
    <label key={key} className="flex min-h-[24px] items-center gap-2 text-xs text-muted">
      <input type="checkbox" className="canto-box" checked={view?.perms[key] ?? false} disabled={!view || busy} onChange={(e) => void setPerm(key, e.target.checked)} />
      {t(`settings.mcp.perm.${key}`)}
    </label>
  );

  return (
    <SettingsSection title={t("settings.mcp.title")} error={error}>
      <div className="flex flex-col gap-1 rounded-lg border border-line bg-black/5 p-2.5">
        <p className="text-xs font-semibold text-fg">{t("settings.mcp.whatTitle")}</p>
        <p className="text-[11px] text-muted">{t("settings.mcp.intro")}</p>
        <p className="text-[11px] text-faint">🔒 {t("settings.mcp.safe")}</p>
      </div>
      {!view?.enabled && (
        <ol className="flex flex-col gap-0.5 pl-4 text-[11px] text-muted [list-style:decimal]">
          <li>{t("settings.mcp.step1")}</li>
          <li>{t("settings.mcp.step2")}</li>
          <li>{t("settings.mcp.step3")}</li>
        </ol>
      )}
      <div className="flex min-h-[24px] items-center gap-2">
        <label className="flex items-center gap-2 text-xs text-fg">
          <input type="checkbox" className="canto-box" checked={view?.enabled ?? false} disabled={!view || busy} onChange={(e) => void toggle(e.target.checked)} />
          {t("settings.mcp.enable")}
        </label>
        {view && (
          <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] ${view.running ? "bg-green-500/15 text-green-500" : "bg-black/10 text-faint"}`}>
            ● {view.running ? t("settings.mcp.on") : t("settings.mcp.stopped")}
          </span>
        )}
      </div>
      {view?.error && <p className="break-all text-[11px] text-red-400">{view.error}</p>}
      {view?.enabled && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted">{t("settings.mcp.endpoint")}</span>
            <code className="min-w-0 flex-1 break-all rounded-md bg-black/10 px-1.5 py-1 text-[11px] text-fg">{view.endpoint}</code>
            <CopyButton text={view.endpoint} label={`${t("settings.mcp.copy")} ${t("settings.mcp.endpoint")}`} />
          </div>
          <label className="flex items-center gap-2 text-xs text-muted">
            {t("settings.mcp.port")}
            <input
              type="number"
              min={1024}
              max={65535}
              value={port}
              onChange={(e) => setPort(e.target.value)}
              onBlur={applyPort}
              onKeyDown={(e) => e.key === "Enter" && applyPort()}
              className="w-20 rounded-md border border-line bg-transparent px-1.5 py-0.5 text-xs text-fg"
            />
          </label>

          {token && <McpConnect view={view} token={token} />}

          <h4 className="text-xs font-semibold text-fg">{t("settings.mcp.token")}</h4>
          <div className="flex flex-wrap items-center gap-2">
            <code className="min-w-0 flex-1 break-all rounded-md bg-black/10 px-1.5 py-1 text-[11px] text-fg">
              {token === null ? "…" : shown ? token : "•".repeat(24)}
            </code>
            <button type="button" className={BTN} onClick={() => setShown(!shown)}>
              {shown ? t("settings.mcp.hide") : t("settings.mcp.show")}
            </button>
            {token && <CopyButton text={token} />}
            <ConfirmButton ask={t("settings.mcp.regenAsk")} yes={t("settings.mcp.regenYes")} disabled={busy} className={BTN} onConfirm={() => void run(() => api.mcpTokenRegenerate())}>
              {t("settings.mcp.regen")}
            </ConfirmButton>
          </div>
          <p className="text-[11px] text-faint">{t("settings.mcp.tokenHint")}</p>

          <h4 className="text-xs font-semibold text-fg">{t("settings.mcp.perms")}</h4>
          <p className="text-[11px] text-faint">{t("settings.mcp.permsHint")}</p>
          {GROUPS.map((g) => (
            <fieldset key={g.title} className="flex flex-col gap-0.5 rounded-lg border border-line px-2.5 py-1.5">
              <legend className="px-1 text-[11px] font-medium text-fg">{t(g.title)}</legend>
              <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">{g.keys.map(perm)}</div>
            </fieldset>
          ))}
          <McpAgents view={view} busy={busy} run={(job) => void run(job)} />
        </>
      )}
    </SettingsSection>
  );
}
