import type { DriveStatus } from "../lib/api";
import { t } from "../i18n";

type Props = { status: DriveStatus; busy: boolean; signingOut: boolean; onSignOut: () => void };

/** Connected account card: who it is, with sign-out always in view. */
export default function GoogleAccount({ status, busy, signingOut, onSignOut }: Props) {
  const name = status.name?.trim() || status.email || t("google.connectedAccount");
  // Only image data: URLs go in the <img>; CSP blocks the rest, and the initial covers the gap.
  const photo = status.avatar?.startsWith("data:image/") ? status.avatar : "";

  return (
    <div className="mt-1 flex items-center gap-3 rounded-lg border border-edge bg-ink/60 p-2">
      {photo ? (
        <img src={photo} alt="" referrerPolicy="no-referrer" className="size-9 shrink-0 rounded-full object-cover" />
      ) : (
        <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-on-accent">
          {name.charAt(0).toUpperCase()}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-fg" title={name}>
          {name}
        </p>
        {status.name?.trim() && status.email && (
          <p className="truncate text-[11px] text-muted" title={status.email}>
            {status.email}
          </p>
        )}
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={onSignOut}
        aria-label={t("google.signOutLabel", { account: status.email || name })}
        className="shrink-0 rounded-lg border border-line px-2.5 py-1 text-xs text-fg hover:border-danger hover:text-danger disabled:opacity-40"
      >
        {signingOut ? t("google.signingOut") : t("google.signOut")}
      </button>
    </div>
  );
}
