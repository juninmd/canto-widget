import { t } from "../i18n";

/** One shape for "something failed": says what, keeps whatever data is on screen, and offers the retry. */
export default function ErrorBanner({ message, onRetry, busy = false }: { message: string; onRetry: () => void; busy?: boolean }) {
  return (
    <div role="alert" className="flex items-center gap-2 rounded-lg border border-danger/40 bg-danger/10 px-2.5 py-1.5 text-xs">
      <span className="min-w-0 flex-1 break-words">{message}</span>
      <button
        type="button"
        onClick={onRetry}
        disabled={busy}
        className="canto-hit min-h-[24px] shrink-0 rounded-md border border-danger/60 px-2 font-semibold text-danger hover:bg-danger/10 disabled:opacity-50"
      >
        {t("common.retry")}
      </button>
    </div>
  );
}
