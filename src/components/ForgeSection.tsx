import { api, type ForgeItem, type ForgeList } from "../lib/api";
import { timeAgo } from "../lib/time";
import { IssueIcon, PullIcon } from "./Icons";

type Props = {
  title: string;
  list: ForgeList;
  login: string;
  filtered: boolean;
  loadingMore: boolean;
  onMore: () => void;
};

export default function ForgeSection({ title, list, login, filtered, loadingMore, onMore }: Props) {
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
            <Row key={it.url} item={it} login={login} />
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

function Row({ item, login }: { item: ForgeItem; login: string }) {
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
            <span className="truncate">{item.reference}</span>
            {item.draft && <span className="shrink-0 text-faint">rascunho</span>}
            {item.author && item.author !== login && <span className="shrink-0 truncate text-faint">@{item.author}</span>}
            <span className="ml-auto shrink-0 text-faint">{timeAgo(item.updated_at)}</span>
          </span>
        </span>
      </button>
    </li>
  );
}
