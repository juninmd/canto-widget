import { useEffect, useState } from "react";
import { api, type McpAgent, type McpCall, type McpView } from "../../lib/api";
import { t } from "../../i18n";
import ConfirmButton from "../../components/ConfirmButton";

const BTN = "canto-hit min-h-[24px] rounded-md border border-line px-2 text-xs text-muted hover:text-fg";
const OUTCOME = {
  ok: "settings.mcp.callOk",
  blocked: "settings.mcp.callBlocked",
  error: "settings.mcp.callError",
} as const;

function AgentRow({ agent, busy, run }: { agent: McpAgent; busy: boolean; run: (job: () => Promise<McpView>) => void }) {
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function reveal() {
    if (token) return setToken(null);
    try {
      setToken(await api.mcpAgentToken(agent.id));
    } catch {
      setToken(null);
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(token ?? (await api.mcpAgentToken(agent.id)));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* the token is on screen when revealed: it can be selected */
    }
  }

  return (
    <li className="flex flex-col gap-1 rounded-md border border-line px-2 py-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="min-w-0 flex-1 truncate text-xs text-fg">{agent.name}</span>
        <label className="flex items-center gap-1.5 text-xs text-muted">
          <input
            type="checkbox"
            className="canto-box"
            checked={agent.read_only}
            disabled={busy}
            aria-label={t("settings.mcp.agentReadOnlyOf", { name: agent.name })}
            onChange={(e) => run(() => api.mcpAgentSetReadOnly(agent.id, e.target.checked))}
          />
          {t("settings.mcp.agentReadOnly")}
        </label>
        <button type="button" className={BTN} onClick={() => void reveal()}>
          {token ? t("settings.mcp.hide") : t("settings.mcp.show")}
        </button>
        <button type="button" className={BTN} onClick={() => void copy()} aria-label={`${t("settings.mcp.copy")} — ${agent.name}`}>
          {copied ? t("settings.mcp.copied") : t("settings.mcp.copy")}
        </button>
        <ConfirmButton
          ask={t("settings.mcp.agentRemoveAsk")}
          yes={t("settings.mcp.agentRemoveYes")}
          disabled={busy}
          className={BTN}
          ariaLabel={`${t("settings.mcp.agentRemove")} — ${agent.name}`}
          onConfirm={() => run(() => api.mcpAgentRemove(agent.id))}
        >
          {t("settings.mcp.agentRemove")}
        </ConfirmButton>
      </div>
      {token && <code className="break-all rounded-md bg-black/10 px-1.5 py-1 text-[11px] text-fg">{token}</code>}
    </li>
  );
}

function CallLog() {
  const [calls, setCalls] = useState<McpCall[]>([]);
  const load = () =>
    api
      .mcpCalls()
      .then((c) => setCalls(c ?? []))
      .catch(() => setCalls([]));
  return (
    <details className="text-xs text-muted" onToggle={(e) => e.currentTarget.open && void load()}>
      <summary className="cursor-pointer">{t("settings.mcp.calls")}</summary>
      {calls.length === 0 ? (
        <p className="mt-1 text-[11px] text-faint">{t("settings.mcp.callsEmpty")}</p>
      ) : (
        <ul className="mt-1 flex max-h-40 flex-col gap-0.5 overflow-y-auto text-[11px] text-faint">
          {calls.map((c, i) => (
            <li key={`${c.at}-${i}`} title={new Date(c.at).toLocaleString()}>
              <span className="text-fg">{c.agent}</span> · {c.tool}
              {c.write ? ` (${t("settings.mcp.callWrite")})` : ""} — {t(OUTCOME[c.outcome])}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-1 flex items-center gap-2">
        <button type="button" className={BTN} onClick={() => void load()}>
          {t("settings.mcp.callsRefresh")}
        </button>
        <button type="button" className={BTN} onClick={() => void api.mcpCallsClear().then(load)}>
          {t("settings.mcp.callsClear")}
        </button>
      </div>
      <p className="mt-1 text-[11px] text-faint">{t("settings.mcp.callsHint")}</p>
    </details>
  );
}

/** Read-only switch for the shared token, agents with a token of their own, and the log of what they called. */
export default function McpAgents({
  view,
  busy,
  run,
}: {
  view: McpView;
  busy: boolean;
  run: (job: () => Promise<McpView>) => void;
}) {
  const [name, setName] = useState("");
  const [readOnly, setReadOnly] = useState(true);
  const agents = view.agents ?? [];
  useEffect(() => setName(""), [agents.length]);

  return (
    <>
      <label className="flex min-h-[24px] items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          className="canto-box"
          checked={view.default_read_only ?? false}
          disabled={busy}
          onChange={(e) => run(() => api.mcpAgentSetReadOnly("default", e.target.checked))}
        />
        {t("settings.mcp.defaultReadOnly")}
      </label>
      <h4 className="text-xs font-semibold text-fg">{t("settings.mcp.ownTokens")}</h4>
      <p className="text-[11px] text-faint">{t("settings.mcp.ownTokensHint")}</p>
      {agents.length > 0 && (
        <ul className="flex flex-col gap-1">
          {agents.map((a) => (
            <AgentRow key={a.id} agent={a} busy={busy} run={run} />
          ))}
        </ul>
      )}
      <form
        className="flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) run(() => api.mcpAgentAdd(name, readOnly));
        }}
      >
        <input
          value={name}
          maxLength={40}
          onChange={(e) => setName(e.target.value)}
          aria-label={t("settings.mcp.agentName")}
          placeholder={t("settings.mcp.agentName")}
          className="min-w-0 flex-1 rounded-md border border-line bg-transparent px-1.5 py-0.5 text-xs text-fg"
        />
        <label className="flex items-center gap-1.5 text-xs text-muted">
          <input type="checkbox" className="canto-box" checked={readOnly} onChange={(e) => setReadOnly(e.target.checked)} />
          {t("settings.mcp.agentReadOnly")}
        </label>
        <button type="submit" className={BTN} disabled={busy || !name.trim()}>
          {t("settings.mcp.agentAdd")}
        </button>
      </form>
      <CallLog />
    </>
  );
}
