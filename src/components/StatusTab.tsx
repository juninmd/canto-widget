import { useCallback, useEffect, useId, useState } from "react";
import { api, errText, type StatusResult } from "../lib/api";
import { timeAgo } from "../lib/time";
import Skeleton from "./Skeleton";

/** Incident history from services the team depends on: read-only, no account needed. */
export default function StatusTab() {
  const [results, setResults] = useState<StatusResult[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchedAt, setFetchedAt] = useState(0);
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async (force: boolean) => {
    setLoading(true);
    try {
      setResults(await api.apiStatus(force));
      setFetchedAt(Date.now());
      setError("");
    } catch (e) {
      setError(errText(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(false);
  }, [load]);

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between gap-2 text-[11px] text-faint">
        <span>status dos serviços</span>
        <span className="flex shrink-0 items-center gap-3">
          {fetchedAt > 0 && <span title="guardado por 5 min para poupar as páginas de status">atualizado {timeAgo(fetchedAt)}</span>}
          <button
            type="button"
            onClick={() => void load(true)}
            disabled={loading}
            className="min-h-6 underline decoration-dotted hover:text-muted"
          >
            {loading ? "..." : "atualizar"}
          </button>
        </span>
      </div>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {results === null ? (
          <Skeleton label="buscando o status dos serviços" rows={4} />
        ) : (
          results.map((r) => (
            <StatusAccordion key={r.id} result={r} open={open === r.id} onToggle={() => setOpen(open === r.id ? null : r.id)} />
          ))
        )}
      </div>
    </div>
  );
}

function StatusAccordion({ result, open, onToggle }: { result: StatusResult; open: boolean; onToggle: () => void }) {
  const bodyId = useId();
  const latest = result.items[0];
  return (
    <section className="rounded-lg border border-edge bg-ink/60">
      <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={bodyId} className="block w-full p-2 text-left">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-xs font-semibold text-fg">{result.label}</span>
          <span className="shrink-0 text-[11px] text-muted">
            {result.error ? "indisponível" : latest ? timeAgo(latest.published_at) : "sem incidentes"}{" "}
            <span aria-hidden="true">{open ? "▴" : "▾"}</span>
          </span>
        </span>
      </button>
      {open && (
        <div id={bodyId} className="px-2 pb-2">
          {result.error ? (
            <p className="text-[11px] text-faint">indisponível: {result.error}</p>
          ) : result.items.length === 0 ? (
            <p className="text-[11px] text-faint">nenhum incidente recente</p>
          ) : (
            <ul className="space-y-1">
              {result.items.map((it) => (
                <li key={it.link || it.title}>
                  <button
                    type="button"
                    onClick={() => void api.openLink(it.link)}
                    disabled={!it.link}
                    title={it.link}
                    className="w-full truncate rounded px-1 py-0.5 text-left text-[11px] text-muted hover:bg-edge hover:text-fg disabled:hover:bg-transparent"
                  >
                    {it.published_at > 0 && <span className="text-faint">{timeAgo(it.published_at)} · </span>}
                    {it.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
