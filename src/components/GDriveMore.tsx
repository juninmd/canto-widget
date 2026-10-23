import { useEffect, useRef } from "react";
import { t } from "../i18n";

/** The next page loads as the list scrolls near its end, or on a click where scrolling can't tell. */
export default function GDriveMore({ loading, onMore }: { loading: boolean; onMore: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const latest = useRef(onMore);
  latest.current = onMore;
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && latest.current(), {
      rootMargin: "240px",
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <button
      ref={ref}
      type="button"
      onClick={onMore}
      disabled={loading}
      className="canto-hit shrink-0 rounded-lg border border-edge bg-ink/60 py-1.5 text-[11px] text-muted hover:border-accent/50 hover:text-fg disabled:opacity-60"
    >
      {loading ? t("gdrive.loadingMore") : t("gdrive.more")}
    </button>
  );
}
