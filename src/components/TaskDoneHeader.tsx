import { t } from "../i18n";
import { ChevronIcon } from "./Icons";

type Props = { n: number; open: boolean; onToggle: () => void };

/** The "Concluídas · n" header: finished tasks stay folded until asked for. */
export default function TaskDoneHeader({ n, open, onToggle }: Props) {
  return (
    <li className="pt-1.5">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="canto-hit flex min-h-[24px] w-full items-center gap-1 rounded-md px-1 text-left text-[11px] uppercase tracking-wider text-faint hover:bg-hover hover:text-fg active:bg-active"
      >
        <span aria-hidden="true" className={`grid size-3 place-items-center motion-safe:transition-transform ${open ? "rotate-90" : ""}`}>
          <ChevronIcon dir="right" />
        </span>
        {t("tasks.group.done", { n })}
      </button>
    </li>
  );
}
