import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { isSafeImageUrl } from "../lib/noteImages";
import { t } from "../i18n";

/** Loads a sealed note image on demand; missing (backup restored elsewhere, other machine) degrades to a label. */
export default function NoteImage({ id, alt, thumb = false }: { id: string; alt: string; thumb?: boolean }) {
  const [state, setState] = useState<{ id: string; src: string | null } | null>(null);
  useEffect(() => {
    let live = true;
    api.noteImageGet(id).then(
      (url) => live && setState({ id, src: isSafeImageUrl(url) ? url : null }),
      () => live && setState({ id, src: null }),
    );
    return () => {
      live = false;
    };
  }, [id]);
  if (thumb) {
    const box = "size-12 shrink-0 rounded border border-edge";
    if (state?.id !== id) return <span role="img" aria-label={t("notes.imageLoading")} className={`${box} animate-pulse bg-edge`} />;
    if (!state.src) {
      return (
        <span role="img" aria-label={t("notes.imageUnavailable")} title={t("notes.imageUnavailable")} className={`${box} grid place-items-center border-dashed text-faint`}>
          ?
        </span>
      );
    }
    return <img src={state.src} alt={alt || t("notes.imageLabel")} className={`${box} object-cover`} />;
  }
  if (state?.id !== id) return <span className="text-xs text-faint">{t("notes.imageLoading")}</span>;
  if (!state.src) {
    return (
      <span role="img" aria-label={t("notes.imageUnavailable")} className="inline-block rounded border border-dashed border-line px-2 py-1 text-xs text-faint">
        {t("notes.imageUnavailable")}
      </span>
    );
  }
  return <img src={state.src} alt={alt || t("notes.imageLabel")} className="my-1 block max-h-64 max-w-full rounded border border-edge" />;
}
