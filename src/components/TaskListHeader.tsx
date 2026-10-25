import type { Priority } from "../lib/api";
import TaskMenu from "./TaskMenu";
import TaskPriorityFilter from "./TaskPriorityFilter";
import TaskProgress from "./TaskProgress";

type Props = {
  done: number;
  total: number;
  priorityFilter: Priority | "";
  onPriorityFilter: (p: Priority | "") => void;
  onSummary: () => void;
  onCarryOver: () => void;
  onClearDone: () => void;
};

export default function TaskListHeader({ done, total, priorityFilter, onPriorityFilter, onSummary, onCarryOver, onClearDone }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
      <TaskProgress done={done} total={total} />
      <div className="ml-auto flex items-center gap-1">
        <TaskPriorityFilter value={priorityFilter} onChange={onPriorityFilter} />
        <TaskMenu canClearDone={done > 0} onSummary={onSummary} onCarryOver={onCarryOver} onClearDone={onClearDone} />
      </div>
    </div>
  );
}
