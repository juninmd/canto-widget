import { useEffect, useState } from "react";
import { api, type McpView } from "../../lib/api";
import { t } from "../../i18n";
import { snippets } from "./mcpSnippets";
import { CopyButton } from "./McpCopy";

const MASK = "•".repeat(12);

/** "Connect an agent": pick the agent and the token, see the config (token hidden) and copy it in one click. */
export default function McpConnect({ view, token }: { view: McpView; token: string }) {
  const [id, setId] = useState("claude");
  const [source, setSource] = useState("default");
  const [own, setOwn] = useState<string | null>(null);
  const agents = view.agents ?? [];

  useEffect(() => {
    setOwn(null);
    if (source === "default") return;
    let live = true;
    void api.mcpAgentToken(source).then((v) => live && setOwn(v), () => live && setSource("default"));
    return () => {
      live = false;
    };
  }, [source]);

  const secret = source === "default" ? token : own;
  const list = snippets(view.endpoint, secret ?? token);
  const current = list.find((s) => s.id === id) ?? list[0];

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line p-2.5">
      <h4 className="text-xs font-semibold text-fg">{t("settings.mcp.agents")}</h4>
      <p className="text-[11px] text-faint">{t("settings.mcp.agentsHint")}</p>
      <div role="tablist" aria-label={t("settings.mcp.agents")} className="flex flex-wrap gap-1">
        {list.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={s.id === current.id}
            onClick={() => setId(s.id)}
            className={`canto-hit min-h-[24px] rounded-full border px-2.5 text-xs ${s.id === current.id ? "border-accent bg-accent/15 text-fg" : "border-line text-muted hover:text-fg"}`}
          >
            {s.name}
          </button>
        ))}
      </div>
      {agents.length > 0 && (
        <label className="flex items-center gap-2 text-xs text-muted">
          {t("settings.mcp.useToken")}
          <select value={source} onChange={(e) => setSource(e.target.value)} className="min-w-0 flex-1 rounded-md border border-line bg-transparent px-1.5 py-0.5 text-xs text-fg">
            <option value="default">{t("settings.mcp.tokenShared")}</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="flex items-center justify-between gap-2 text-[11px] text-faint">
        <span className="min-w-0 truncate">{current.file ? t("settings.mcp.agentFile", { file: current.file }) : t("settings.mcp.runInTerminal")}</span>
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-md bg-black/10 p-2 text-[11px] text-fg">{secret ? current.text.replace(secret, MASK) : "…"}</pre>
      <div className="flex flex-wrap items-center gap-2">
        {secret && <CopyButton text={current.text} label={`${t("settings.mcp.copyConfig")} ${current.name}`} text2={t("settings.mcp.copyConfig")} primary />}
        <span className="text-[11px] text-faint">{t("settings.mcp.tryAsking")}</span>
      </div>
    </div>
  );
}
