import { Component, type ReactNode } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { t } from "../i18n";

type Props = { children: ReactNode };
type State = { error: string | null };

/**
 * Every Canto window is transparent and always on top: a render error would unmount everything and leave an
 * invisible window that still swallows clicks, so a crash draws a solid panel the user can reload or hide.
 */
export default class WindowBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error: error instanceof Error ? error.message : String(error) };
  }

  render() {
    if (this.state.error === null) return this.props.children;
    return (
      <div role="alert" className="flex h-screen flex-col justify-center gap-3 rounded-2xl border border-edge bg-panel p-4 text-fg">
        <p className="text-sm">{t("common.loadFailed", { error: this.state.error })}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => location.reload()}
            className="min-h-8 rounded-lg border border-edge px-3 text-xs text-fg hover:bg-ink"
          >
            {t("common.retry")}
          </button>
          <button
            type="button"
            onClick={() => void getCurrentWindow().hide()}
            className="min-h-8 rounded-lg border border-edge px-3 text-xs text-muted hover:text-fg"
          >
            {t("capture.close")}
          </button>
        </div>
      </div>
    );
  }
}
