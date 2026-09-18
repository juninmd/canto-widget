import { useCallback, useEffect, useState } from "react";
import { api, errText, type GithubItem, type GithubLists, type GithubStatus } from "../lib/api";
import { SECTIONS } from "../lib/github";
import { timeAgo } from "../lib/time";
import GithubConnect from "./GithubConnect";
import { IssueIcon, PullIcon } from "./Icons";

export default function GithubTab({ onError }: { onError: (m: string) => void }) {
  const [status, setStatus] = useState<GithubStatus | null>(null);
  const [lists, setLists] = useState<GithubLists | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const s = await api.githubStatus();
      setStatus(s);
      if (!s.connected) return setLists(null);
      setLoading(true);
      setLists(await api.githubLists());
    } catch (e) {
      setError(errText(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function disconnect() {
    try {
      await api.githubDisconnect();
      await load();
    } catch (e) {
      onError(errText(e));
    }
  }

  if (!status) return error ? <p className="text-xs text-danger">{error}</p> : null;
  if (!status.connected) return <GithubConnect device={status.device_flow} onConnected={() => void load()} />;

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between text-[11px] text-faint">
        <span className="truncate">@{status.login}</span>
        <span className="flex gap-3">
          <button type="button" onClick={() => void load()} disabled={loading} className="min-h-6 underline decoration-dotted hover:text-muted">
            {loading ? "..." : "atualizar"}
          </button>
          <button type="button" onClick={() => void disconnect()} className="min-h-6 underline decoration-dotted hover:text-muted">
            desconectar
          </button>
        </span>
      </div>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {lists &&
          SECTIONS.map(({ key, title }) => (
            <section key={key} aria-label={title}>
              <h3 className="mb-1 text-xs font-semibold text-fg">
                {title} <span className="font-normal text-faint">({lists[key].total})</span>
              </h3>
              {lists[key].items.length === 0 ? (
                <p className="px-2 py-1 text-[11px] text-faint">nada aberto aqui</p>
              ) : (
                <ul className="space-y-1.5">
                  {lists[key].items.map((it) => (
                    <Row key={it.url} item={it} login={status.login} />
                  ))}
                </ul>
              )}
            </section>
          ))}
      </div>
    </div>
  );
}

function Row({ item, login }: { item: GithubItem; login: string }) {
  const kind = item.is_pr ? (item.draft ? "PR rascunho" : "PR") : "issue";
  return (
    <li>
      <button
        type="button"
        onClick={() => void api.openLink(item.url)}
        title={item.url}
        className="flex w-full gap-2 rounded-lg border border-edge bg-ink/60 p-2 text-left hover:border-line"
      >
        <span className={`mt-0.5 shrink-0 ${item.draft ? "text-faint" : "text-accent"}`} aria-label={kind} role="img">
          {item.is_pr ? <PullIcon /> : <IssueIcon />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 text-sm text-fg">{item.title}</span>
          <span className="mt-0.5 flex gap-2 text-[11px] text-muted">
            <span className="truncate">
              {item.repo}#{item.number}
            </span>
            {item.draft && <span className="shrink-0 text-faint">rascunho</span>}
            {item.author && item.author !== login && <span className="shrink-0 truncate text-faint">@{item.author}</span>}
            <span className="ml-auto shrink-0 text-faint">{timeAgo(item.updated_at)}</span>
          </span>
        </span>
      </button>
    </li>
  );
}
