import { useState } from "react";
import { api, type ChecksStatus, type ForgeItem, type ForgeList, type ForgeSection as ForgeSectionKey } from "../lib/api";
import type { Forge } from "../lib/forge";
import { daysSince, timeAgo } from "../lib/time";
import { IssueIcon, PullIcon } from "./Icons";

type Props = {
  title: string;
  section: ForgeSectionKey;
  forge: Forge;
  list: ForgeList;
  login: string;
  filtered: boolean;
  loadingMore: boolean;
  onMore: () => void;
};

export default function ForgeSection({ title, section, forge, list, login, filtered, loadingMore, onMore }: Props) {
  const rest = list.total - list.items.length;
  return (
    <section aria-label={title}>
      <h3 className="mb-1 text-xs font-semibold text-fg">
        {title} <span className="font-normal text-faint">({list.total})</span>
      </h3>
      {list.items.length === 0 ? (
        <p className="px-2 py-1 text-[11px] text-faint">{filtered ? "nada com esse filtro" : "nada aberto aqui"}</p>
      ) : (
        <ul className="space-y-1.5">
          {list.items.map((it) => (
            <Row key={it.url} item={it} login={login} forge={forge} waiting={section === "review_requested"} />
          ))}
        </ul>
      )}
      {rest > 0 && (
        <button
          type="button"
          onClick={onMore}
          disabled={loadingMore}
          className="mt-1.5 min-h-7 w-full rounded-lg bg-edge text-[11px] text-muted hover:text-fg disabled:opacity-60"
        >
          {loadingMore ? "carregando…" : `mostrar mais (${rest} restantes)`}
        </button>
      )}
    </section>
  );
}

function Row({ item, login, forge, waiting }: { item: ForgeItem; login: string; forge: Forge; waiting: boolean }) {
  const kind = item.is_pr ? (item.draft ? "PR rascunho" : "PR") : "issue";
  const [checks, setChecks] = useState<ChecksStatus | "loading" | null>(null);
  const wait = waiting && item.is_pr ? daysSince(item.created_at) : null;

  async function loadChecks() {
    setChecks("loading");
    try {
      setChecks(forge === "github" ? await api.githubPrChecks(item.repo, item.number) : await api.gitlabMrChecks(item.repo, item.number));
    } catch {
      setChecks("none");
    }
  }

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
            <span className="truncate">{item.reference}</span>
            {item.draft && <span className="shrink-0 text-faint">rascunho</span>}
            {item.author && item.author !== login && <span className="shrink-0 truncate text-faint">@{item.author}</span>}
            {wait !== null && (
              <span className={`shrink-0 ${wait >= 3 ? "text-danger" : "text-faint"}`}>aguardando há {wait <= 0 ? "menos de 1 d" : `${wait} d`}</span>
            )}
            <span className="ml-auto shrink-0 text-faint">{timeAgo(item.updated_at)}</span>
          </span>
        </span>
      </button>
      {item.is_pr && (
        <div className="mt-1 flex items-center gap-2 pl-7 text-[11px]">
          {checks === null ? (
            <button type="button" onClick={() => void loadChecks()} className="text-muted underline decoration-dotted hover:text-fg">
              ver CI
            </button>
          ) : (
            <ChecksBadge status={checks} />
          )}
        </div>
      )}
    </li>
  );
}

function ChecksBadge({ status }: { status: ChecksStatus | "loading" }) {
  const map: Record<ChecksStatus | "loading", { label: string; className: string }> = {
    loading: { label: "verificando…", className: "text-faint" },
    success: { label: "✓ CI passou", className: "text-accent" },
    failure: { label: "✗ CI falhou", className: "text-danger" },
    running: { label: "● CI rodando", className: "text-muted" },
    none: { label: "sem CI", className: "text-faint" },
  };
  const { label, className } = map[status];
  return <span className={className}>{label}</span>;
}
