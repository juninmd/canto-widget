import { api } from "../lib/api";
import { t } from "../i18n";

/** A Google refusal that says an API is off ends with the console page that turns it on. */
const CONSOLE = /https:\/\/console\.(?:developers|cloud)\.google\.com\/\S+$/;

/** One shape for "something failed": says what, keeps whatever data is on screen, and offers the retry. */
export default function ErrorBanner({ message, onRetry, busy = false }: { message: string; onRetry: () => void; busy?: boolean }) {
  const enable = CONSOLE.exec(message)?.[0];
  const text = enable ? message.slice(0, -enable.length).trim() : message;
  return (
    <div role="alert" className="flex items-center gap-2 rounded-lg border border-danger/40 bg-danger/10 px-2.5 py-1.5 text-xs">
      <span className="min-w-0 flex-1 break-words">{text}</span>
      {enable && (
        <button
          type="button"
          onClick={() => void api.openLink(enable).catch(() => {})}
          className="canto-hit min-h-[24px] shrink-0 rounded-md bg-danger/20 px-2 font-semibold text-danger hover:bg-danger/30"
        >
          {t("google.enableApi")}
        </button>
      )}
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
