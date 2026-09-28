import { imageIds } from "../lib/noteImages";
import { t } from "../i18n";
import NoteImage from "./NoteImage";

const MAX_THUMBS = 4;

/** The note's images as small thumbnails, where the markdown itself isn't rendered (card, write mode). */
export default function NoteThumbs({ body, className = "" }: { body: string; className?: string }) {
  const ids = imageIds(body);
  if (ids.length === 0) return null;
  const hidden = ids.length - MAX_THUMBS;
  return (
    <span role="group" aria-label={t("notes.imagesLabel")} className={`flex items-center gap-1.5 ${className}`}>
      {ids.slice(0, MAX_THUMBS).map((id) => (
        <NoteImage key={id} id={id} alt="" thumb />
      ))}
      {hidden > 0 && <span className="text-[11px] text-faint">+{hidden}</span>}
    </span>
  );
}
