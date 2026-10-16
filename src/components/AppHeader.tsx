import { getCurrentWindow } from "@tauri-apps/api/window";
import { TOGGLE_LABEL } from "../lib/platform";
import { PALETTE_KEYS } from "../lib/shortcuts";
import type { Mode } from "../lib/windowMode";
import { t } from "../i18n";
import DndIndicator from "./DndIndicator";
import { BellIcon, ExpandIcon, EyeIcon, EyeOffIcon, HelpIcon, LockIcon, MinimizeIcon, ShrinkIcon } from "./Icons";
import ModeSwitcher from "./ModeSwitcher";

type Props = {
  unlocked: boolean;
  online: boolean;
  privacy: boolean;
  mode: Mode;
  /** Alerts waiting for an answer; announced to screen readers when it changes, and the bell's badge. */
  pending: number;
  /** Opens the alerts screen; the bell is the only way in, so it shows even with nothing pending. */
  onBell: () => void;
  onHelp: () => void;
  onLock: () => void;
  onTogglePrivacy: () => void;
  onPickMode: (mode: Mode) => void;
  onToggleFullscreen: () => void;
  onError: (message: string) => void;
};

const BUTTON = "canto-hit grid size-7 place-items-center rounded-lg hover:bg-hover hover:text-fg active:bg-active";

/** The title bar. It is a container: the lock label gives way below ~384 px so the buttons never push the drag area out. */
export default function AppHeader(p: Props) {
  const fullscreen = p.mode === "max";
  return (
    <header
      data-tauri-drag-region
      className="@container flex items-center justify-between gap-2 border-b border-edge px-3 py-1.5"
    >
      <span data-tauri-drag-region className="flex min-w-0 flex-1 items-center gap-2 text-xs font-semibold tracking-wide text-fg">
        <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)]" />
        <span data-tauri-drag-region className="truncate">
          {t("app.name")}
        </span>
      </span>
      <div className="flex shrink-0 items-center gap-0.5 text-[11px] text-muted">
        {!p.online && (
          <span
            role="status"
            title={t("common.offlineStale")}
            className="mr-1 rounded-md border border-warn/40 bg-warn/10 px-1.5 py-0.5 text-warn"
          >
            {t("common.offline")}
          </span>
        )}
        <DndIndicator onError={p.onError} />
        <span role="status" className="sr-only">
          {p.pending > 0 ? t("app.bell", { n: p.pending }) : ""}
        </span>
        {p.unlocked && (
          <>
            <button
              type="button"
              onClick={p.onBell}
              aria-label={t("app.bell", { n: p.pending })}
              title={t("app.bell.title", { n: p.pending })}
              className={`${BUTTON} relative ${p.pending > 0 ? "text-warn" : ""}`}
            >
              <BellIcon on={p.pending > 0} />
              {p.pending > 0 && (
                <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 min-w-3.5 rounded-full bg-warn px-1 text-center text-[9px] font-semibold leading-3.5 text-on-accent">
                  {p.pending}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={p.onHelp}
              aria-label={t("app.shortcuts")}
              title={t("app.shortcuts.title", { keys: PALETTE_KEYS.join("+") })}
              className={BUTTON}
            >
              <HelpIcon />
            </button>
            <button
              type="button"
              onClick={p.onLock}
              aria-label={t("app.lock")}
              title={t("app.lock.title")}
              className="canto-hit inline-flex h-7 items-center gap-1.5 rounded-lg px-2 hover:bg-hover hover:text-fg active:bg-active"
            >
              <LockIcon />
              <span className="hidden @[24rem]:inline">{t("app.lock")}</span>
            </button>
            <button
              type="button"
              onClick={p.onTogglePrivacy}
              aria-pressed={p.privacy}
              aria-label={p.privacy ? t("app.privacy.disable") : t("app.privacy.enable")}
              title={p.privacy ? t("app.privacy.onTitle") : t("app.privacy.offTitle")}
              className={`${BUTTON} ${p.privacy ? "text-accent-text" : ""}`}
            >
              {p.privacy ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </>
        )}
        <ModeSwitcher mode={p.mode} onPick={p.onPickMode} />
        <button
          type="button"
          onClick={p.onToggleFullscreen}
          aria-pressed={fullscreen}
          aria-label={fullscreen ? t("app.fullscreen.exit") : t("app.fullscreen.enter")}
          title={fullscreen ? t("app.fullscreen.exitTitle") : t("app.fullscreen.enterTitle")}
          className={BUTTON}
        >
          {fullscreen ? <ShrinkIcon /> : <ExpandIcon />}
        </button>
        <button
          type="button"
          onClick={() => void getCurrentWindow().hide()}
          className={BUTTON}
          title={t("app.hide.title", { shortcut: TOGGLE_LABEL })}
          aria-label={t("app.hide")}
        >
          <MinimizeIcon />
        </button>
      </div>
    </header>
  );
}
