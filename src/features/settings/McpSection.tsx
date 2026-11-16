import { useEffect, useState } from "react";
import { api, type McpPerms, type McpView } from "../../lib/api";
import { useSectionError } from "./useSectionError";
import { t } from "../../i18n";
import { SettingsSection } from "./SettingsSection";
import ConfirmButton from "../../components/ConfirmButton";
import { snippets } from "./mcpSnippets";
import McpAgents from "./McpAgents";

const READS: (keyof McpPerms)[] = [
  "notifications", "tasks", "agenda", "prs", "mentions", "repos", "system", "weather", "agents", "models", "status", "market", "steam", "health",
  "notes", "clipboard", "gmail", "contacts",
];
const WRITES: (keyof McpPerms)[] = ["tasks_write", "notes_write"];
const BTN = "canto-hit min-h-[24px] rounded-md border border-line px-2 text-xs text-muted hover:text-fg";

/** Copy button that says "copied" for a moment; a blocked clipboard just leaves the text selectable. */
function CopyButton({ text, label }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch {
      /* the text is on screen: the user can select it */
    }
  }
  return (
    <button type="button" onClick={() => void copy()} className={BTN} aria-label={label}>
      {done ? t("settings.mcp.copied") : t("settings.mcp.copy")}
    </button>
  );
}

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
      <p className="text-[11px] text-faint">{t("settings.mcp.intro")}</p>
      <label className="flex min-h-[24px] items-center gap-2 text-xs text-muted">
        <input type="checkbox" className="canto-box" checked={view?.enabled ?? false} disabled={!view || busy} onChange={(e) => void toggle(e.target.checked)} />
        {t("settings.mcp.enable")}
      </label>
      {view && (
        <p className="break-all text-[11px] text-faint">
          {view.running ? t("settings.mcp.running", { url: view.endpoint }) : t("settings.mcp.stopped")}
          {view.error ? ` · ${view.error}` : ""}
        </p>
      )}
      {view?.enabled && (
        <>
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
          {READS.map(perm)}
          {WRITES.map(perm)}
          <p className="text-[11px] text-faint">{t("settings.mcp.permsHint")}</p>
          <McpAgents view={view} busy={busy} run={(job) => void run(job)} />

          {token && (
            <>
              <h4 className="text-xs font-semibold text-fg">{t("settings.mcp.agents")}</h4>
              <p className="text-[11px] text-faint">{t("settings.mcp.agentsHint")}</p>
              {snippets(view.endpoint, token).map((s) => (
                <details key={s.id} className="rounded-md border border-line px-2 py-1">
                  <summary className="cursor-pointer text-xs text-fg">{s.name}</summary>
                  {s.file && <p className="mt-1 text-[11px] text-faint">{t("settings.mcp.agentFile", { file: s.file })}</p>}
                  <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-all rounded-md bg-black/10 p-1.5 text-[11px] text-fg">{s.text.replace(token, "•".repeat(12))}</pre>
                  <div className="mt-1">
                    <CopyButton text={s.text} label={`${t("settings.mcp.copy")} ${s.name}`} />
                  </div>
                </details>
              ))}
            </>
          )}
        </>
      )}
    </SettingsSection>
  );
}
