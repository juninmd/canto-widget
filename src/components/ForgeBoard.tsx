import { freshness, isFiltered, visibleSections, type Forge } from "../lib/forge";
import type { ForgeListsState } from "../lib/useForgeLists";
import { timeAgo } from "../lib/time";
import ForgeFilterBar from "./ForgeFilterBar";
import ForgeSection from "./ForgeSection";
import Skeleton from "./Skeleton";

type Props = { forge: Forge; login: string; host?: string; lists: ForgeListsState; onDisconnect: () => void };

const clock = (ms: number) => new Date(ms).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

/** Issue and PR/MR lists of one connected forge: header, filter, sections. */
export default function ForgeBoard({ forge, login, host, lists: gh, onDisconnect }: Props) {
  const { lists } = gh;
  const fresh = lists ? freshness(lists) : null;
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between gap-2 text-[11px] text-faint">
        <span className="truncate">
          @{login}
          {host && ` · ${host}`}
        </span>
        <span className="flex shrink-0 gap-3">
          {fresh?.fetchedAt && <span title="as listas ficam guardadas por 5 min para poupar o limite da API">atualizado {timeAgo(fresh.fetchedAt)}</span>}
          <button
            type="button"
            onClick={() => void gh.load(gh.filter, true, true)}
            disabled={gh.loading}
            className="min-h-6 underline decoration-dotted hover:text-muted"
          >
            {gh.loading ? "..." : "atualizar"}
          </button>
          <button type="button" onClick={onDisconnect} className="min-h-6 underline decoration-dotted hover:text-muted">
            desconectar
          </button>
        </span>
      </div>
      <ForgeFilterBar forge={forge} filter={gh.filter} onApply={(f) => void gh.load(f, false)} />
      {fresh?.limitedUntil && (
        <p role="status" className="text-[11px] text-muted">
          limite de requisições perto do fim: mostrando a última cópia; dados novos a partir das {clock(fresh.limitedUntil)}
        </p>
      )}
      {gh.error && (
        <p role="alert" className="text-xs text-danger">
          {gh.error}
        </p>
      )}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {!lists && gh.loading && <Skeleton label="carregando issues e PRs" rows={4} />}
        {lists &&
          visibleSections(forge, gh.filter.kind).map(({ key, title }) => (
            <ForgeSection
              key={key}
              title={title}
              list={lists[key]}
              login={login}
              filtered={isFiltered(gh.filter)}
              loadingMore={gh.loadingMore === key}
              onMore={() => void gh.more(key)}
            />
          ))}
      </div>
    </div>
  );
}
