import { t } from "../i18n";
import { timeAgo } from "../lib/time";
import ForgeDisconnect from "./ForgeDisconnect";
import { RefreshIcon } from "./ForgeIcons";
import Spinner from "./Spinner";

type Props = {
  login: string;
  host?: string;
  /** The lists are the last copy, kept after a failed refresh. */
  cached: boolean;
  fetchedAt: number | null;
  busy: boolean;
  onRefresh: () => void;
  onDisconnect: () => void;
};

/** Who is connected and how fresh the lists are; "atualizar" is an icon button, "desconectar" lives in the "···" menu. */
export default function ForgeHeader({ login, host, cached, fetchedAt, busy, onRefresh, onDisconnect }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[11px] text-faint">
      <span className="flex min-w-0 items-center gap-1.5">
        <span aria-hidden="true" className="grid size-[22px] shrink-0 place-items-center rounded-full bg-accent/20 text-[11px] font-semibold uppercase text-accent-text">
          {login.slice(0, 1)}
        </span>
        <span className="min-w-0 truncate text-xs font-semibold text-fg">
          @{login}
          {host && ` · ${host}`}
        </span>
      </span>
      <span className="flex flex-wrap items-center gap-x-2">
        {cached && <span className="rounded-full bg-edge px-2 text-muted">{t("common.cached")}</span>}
        {!!fetchedAt && <span title={t("forge.cacheTitle")}>{t("forge.updatedAgo", { ago: timeAgo(fetchedAt) })}</span>}
        <button
          type="button"
          aria-busy={busy}
          aria-label={t("forge.refresh")}
          title={t("forge.refresh")}
          onClick={onRefresh}
          disabled={busy}
          className="canto-hit grid h-[28px] min-w-[28px] place-items-center rounded-lg text-muted hover:bg-hover hover:text-fg active:bg-active disabled:opacity-60"
        >
          {busy ? <Spinner /> : <RefreshIcon />}
        </button>
        <ForgeDisconnect onConfirm={onDisconnect} />
      </span>
    </div>
  );
}
