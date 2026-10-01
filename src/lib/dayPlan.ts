import type { AgendaItem, Task } from "./api";

/** A task with a time but no estimate still takes a slot on the day. */
export const DEFAULT_TASK_MIN = 30;
const STEP = 15;
const DAY_END = 24 * 60;

export type PlanBlock = {
  id: string;
  title: string;
  /** Minutes since local midnight. */
  start: number;
  end: number;
  kind: "event" | "task";
  clash: boolean;
  /** Side-by-side slot among the blocks it overlaps; `lanes` is how many share the width. */
  lane: number;
  lanes: number;
};

const minuteOf = (d: Date) => d.getHours() * 60 + d.getMinutes();

/** Events that take my time today: timed, not declined, clipped to the day. */
function eventBlocks(agenda: AgendaItem[]): PlanBlock[] {
  return agenda
    .filter((e) => !e.all_day && e.response !== "declined")
    .flatMap((e) => {
      const [s, f] = [new Date(e.start), new Date(e.end)];
      if (Number.isNaN(s.getTime()) || Number.isNaN(f.getTime()) || f <= s) return [];
      const start = minuteOf(s);
      const end = f.getDate() === s.getDate() ? minuteOf(f) : DAY_END;
      return end > start ? [{ id: e.id, title: e.title, start, end, kind: "event" as const, clash: false, lane: 0, lanes: 1 }] : [];
    });
}

export function taskStart(hora: string): number | null {
  const m = /^(\d{2}):(\d{2})$/.exec(hora);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

function taskBlocks(tasks: Task[]): PlanBlock[] {
  return tasks.flatMap((task) => {
    const start = task.done || !task.hora ? null : taskStart(task.hora);
    if (start === null) return [];
    const end = Math.min(DAY_END, start + (task.estimate_min ?? DEFAULT_TASK_MIN));
    return [{ id: task.id, title: task.title, start, end, kind: "task" as const, clash: false, lane: 0, lanes: 1 }];
  });
}

const overlaps = (a: PlanBlock, b: PlanBlock) => a.start < b.end && b.start < a.end;

/** Blocks that overlap (even through a chain) split the width: each takes the first free lane. */
function withLanes(sorted: PlanBlock[]): PlanBlock[] {
  const out: PlanBlock[] = [];
  let cluster: PlanBlock[] = [];
  let laneEnds: number[] = [];
  let clusterEnd = -1;
  const close = () => {
    cluster.forEach((b) => out.push({ ...b, lanes: laneEnds.length }));
    cluster = [];
    laneEnds = [];
  };
  for (const b of sorted) {
    if (b.start >= clusterEnd) close();
    let lane = laneEnds.findIndex((end) => end <= b.start);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = b.end;
    cluster.push({ ...b, lane });
    clusterEnd = cluster.length === 1 ? b.end : Math.max(clusterEnd, b.end);
  }
  close();
  return out;
}

/** A task clashes with anything else on the day; two events overlapping is the agenda's own conflict badge. */
export function dayBlocks(agenda: AgendaItem[], tasks: Task[]): PlanBlock[] {
  const all = [...eventBlocks(agenda), ...taskBlocks(tasks)].sort((a, b) => a.start - b.start || a.end - b.end);
  return withLanes(
    all.map((b) => ({
      ...b,
      clash: b.kind === "task" && all.some((o) => o.id !== b.id && overlaps(b, o)),
    })),
  );
}

/** Open tasks with no time: candidates for a free slot. */
export const unscheduled = (tasks: Task[]) => tasks.filter((task) => !task.done && !task.hora);

/** The hours the grid shows: the working day, widened to whatever falls outside it. */
export function hourRange(blocks: PlanBlock[]): [number, number] {
  const first = Math.min(8, ...blocks.map((b) => Math.floor(b.start / 60)));
  const last = Math.max(18, ...blocks.map((b) => Math.ceil(b.end / 60)));
  return [first, Math.min(24, last)];
}

/** Earliest quarter hour at or after `from` where `minutes` fits between the blocks; null when the day is over. */
export function firstFreeSlot(blocks: PlanBlock[], minutes: number, from: number): number | null {
  let start = Math.ceil(from / STEP) * STEP;
  for (const b of [...blocks].sort((x, y) => x.start - y.start)) {
    if (b.end <= start) continue;
    if (b.start >= start + minutes) break;
    start = Math.ceil(b.end / STEP) * STEP;
  }
  return start + minutes <= DAY_END ? start : null;
}

export const hhmm = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
