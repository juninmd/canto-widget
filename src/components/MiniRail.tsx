import { useEffect, useRef, useState } from "react";
import { api, type AgendaItem } from "../lib/api";
import { kindOf, toneOf, type AlertKind, type Tone } from "../lib/alerts";
import { miniSize, type Mode, type MiniView } from "../lib/windowMode";
import { t } from "../i18n";
import { summary } from "./AlertStrip";
import { BellIcon, ChecklistIcon, ClockIcon, NoteIcon, PullIcon } from "./Icons";
import ModeSwitcher from "./ModeSwitcher";

const ICON: Record<AlertKind, () => React.JSX.Element> = {
  meeting: ClockIcon,
  pr: PullIcon,
  task: ChecklistIcon,
  status: () => <BellIcon on={false} />,
  model: () => <BellIcon on={false} />,
  mention: NoteIcon,
};
const BAR: Record<Tone, string> = { danger: "bg-danger", warn: "bg-warn", accent: "bg-accent", muted: "bg-muted" };
const TINT: Record<Tone, string> = {
  danger: "bg-danger/15 text-danger",
  warn: "bg-warn/15 text-warn",
  accent: "bg-accent/15 text-accent-text",
  muted: "bg-muted/15 text-muted",
};
/** A new alert shows the icons for a moment, then the dock goes back to bars. */
const PEEK_MS = 2600;
/** Moving between two rows passes through the gap; without this the window would shrink and grow again. */
const LEAVE_MS = 250;

type Props = { alerts: AgendaItem[]; mode: Mode; onOpen: (id: string) => void; onMode: (mode: Mode) => void };

/** Mini mode: the whole window is this edge dock, one bar per pending alert. The window resizes to what is showing. */
export default function MiniRail({ alerts, mode, onOpen, onMode }: Props) {
  const [hover, setHover] = useState(false);
  const [row, setRow] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const [peek, setPeek] = useState(false);
  const leave = useRef<ReturnType<typeof setTimeout>>(undefined);
  const known = useRef(alerts.length);

  useEffect(() => {
    if (alerts.length > known.current) {
      setPeek(true);
      const id = setTimeout(() => setPeek(false), PEEK_MS);
      known.current = alerts.length;
      return () => clearTimeout(id);
    }
    known.current = alerts.length;
  }, [alerts.length]);

  const view: MiniView = menu ? "menu" : row ? "label" : hover || peek ? "icons" : "bars";
  const { width, height } = miniSize(view, alerts.length);
  useEffect(() => {
    void api.windowMiniResize(width, height).catch(() => {});
  }, [width, height]);
  useEffect(() => () => clearTimeout(leave.current), []);

  const enter = (id: string | null) => {
    clearTimeout(leave.current);
    setHover(true);
    setRow(id);
  };
  const exit = () => {
    clearTimeout(leave.current);
    leave.current = setTimeout(() => {
      setHover(false);
      setRow(null);
    }, LEAVE_MS);
  };
  const expanded = view !== "bars";

  return (
    <div
      role="group"
      aria-label={t("app.mini.label")}
      onPointerEnter={() => enter(row)}
      onPointerLeave={exit}
      className="flex h-screen flex-col items-end justify-center gap-2 overflow-hidden py-3"
    >
      <div className={`mr-1.5 transition-opacity duration-150 ${expanded ? "opacity-100" : "opacity-0"}`}>
        <ModeSwitcher
          mode={mode}
          onPick={onMode}
          onOpenChange={setMenu}
          buttonClassName="rounded-full border border-edge bg-panel/95 text-muted backdrop-blur"
          menuClassName="right-9 top-0"
        />
      </div>
      {alerts.length === 0 && (
        <span role="status" aria-label={t("app.mini.empty")} className="h-7 w-1.5 rounded-l-full bg-line" />
      )}
      {alerts.map((e, i) => {
        const tone = toneOf(e);
        const Icon = ICON[kindOf(e)];
        const label = row === e.id;
        return (
          <button
            key={e.id}
            type="button"
            onClick={() => onOpen(e.id)}
            onFocus={() => enter(e.id)}
            onBlur={exit}
            onPointerEnter={() => enter(e.id)}
            aria-label={t("app.mini.open", { title: e.title })}
            style={{ animationDelay: `${i * 45}ms` }}
            className={`canto-hit relative flex shrink-0 flex-row-reverse items-center overflow-hidden whitespace-nowrap rounded-l-full border border-r-0 p-0 text-left motion-safe:animate-borda motion-safe:transition-[width,height,background-color] motion-safe:duration-300 motion-safe:ease-entrar ${
              expanded ? "h-10 border-edge bg-panel/95 backdrop-blur" : "h-7 border-transparent"
            } ${label ? "w-[17rem] border-line" : expanded ? "w-10" : "w-6"}`}
          >
            <span aria-hidden="true" className={`absolute right-0 top-0 h-full w-1.5 transition-opacity duration-150 ${BAR[tone]} ${expanded ? "opacity-0" : "opacity-100"}`} />
            <span className={`m-1 grid size-8 shrink-0 place-items-center rounded-full transition-opacity duration-150 ${TINT[tone]} ${expanded ? "opacity-100" : "opacity-0"}`}>
              <Icon />
            </span>
            <span className={`min-w-0 flex-1 pl-3 leading-tight transition-opacity duration-150 ${label ? "opacity-100" : "opacity-0"}`}>
              <span className="block truncate text-xs font-semibold text-fg">{e.title}</span>
              <span className="block truncate text-[10.5px] text-muted">{summary(e)}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
