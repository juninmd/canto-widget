import { useRef } from "react";
import { t } from "../i18n";
import { clampLeft, keyLeft, LEFT_DEFAULT, LEFT_MIN, maxLeft } from "../lib/split";

type Props = {
  left: number;
  /** Width the two columns share. */
  total: number;
  onChange: (left: number) => void;
  /** The drag ended or a key moved it: time to remember the width. */
  onCommit: (left: number) => void;
};

/** The divider between the task list and the notifications: drag it or use the arrow keys. */
export default function Splitter({ left, total, onChange, onCommit }: Props) {
  const drag = useRef<{ x: number; left: number; now: number } | null>(null);

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={t("notif.resize")}
      aria-valuenow={left}
      aria-valuemin={LEFT_MIN}
      aria-valuemax={maxLeft(total)}
      tabIndex={0}
      title={t("notif.resizeHint")}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = { x: e.clientX, left, now: left };
        document.body.classList.add("canto-resizing");
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        d.now = clampLeft(d.left + e.clientX - d.x, total);
        onChange(d.now);
      }}
      onPointerUp={() => {
        const d = drag.current;
        drag.current = null;
        document.body.classList.remove("canto-resizing");
        if (d) onCommit(d.now);
      }}
      onPointerCancel={() => {
        drag.current = null;
        document.body.classList.remove("canto-resizing");
      }}
      onDoubleClick={() => onCommit(clampLeft(LEFT_DEFAULT, total))}
      onKeyDown={(e) => {
        const next = keyLeft(e.key, left, total, e.shiftKey);
        if (next === null) return;
        e.preventDefault();
        onCommit(next);
      }}
      className="group relative z-10 -mx-1.5 w-3 shrink-0 cursor-col-resize touch-none outline-offset-[-2px]"
    >
      <span aria-hidden="true" className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-edge transition-colors group-hover:bg-accent group-focus-visible:bg-accent" />
      <span aria-hidden="true" className="absolute left-1/2 top-1/2 h-9 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-line opacity-0 transition-opacity group-hover:opacity-90 group-focus-visible:opacity-90" />
    </div>
  );
}
