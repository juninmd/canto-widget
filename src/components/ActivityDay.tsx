import { withoutHidden, type Category } from "../lib/activity";
import { mergeFocus, type Day } from "../lib/activityView";
import ActivityGoal, { type GoalDay } from "./ActivityGoal";
import ActivityHero from "./ActivityHero";
import ActivityList from "./ActivityList";
import ActivityTiles from "./ActivityTiles";
import ActivityTimeline from "./ActivityTimeline";
import { COLUMN, LAYOUT } from "./activityLayout";

const sum = (apps: { secs: number }[]) => apps.reduce((s, a) => s + a.secs, 0);

/** One day: the summary and the goal on one side, the timeline and the lists on the other (stacked on a narrow window). */
export default function ActivityDay({ day, before, hidden, onToggle, nowSec, goal, onRecategorize }: {
  day: Day;
  before: Day | undefined;
  hidden: ReadonlySet<Category>;
  onToggle: (c: Category) => void;
  nowSec: number | null;
  goal: { codeSecs: number; minutes: number; streakDays: number; days: GoalDay[]; editing: boolean; onEditing: (open: boolean) => void; onGoal: (min: number) => void };
  onRecategorize: (app: string, c: Category) => void;
}) {
  const shown = withoutHidden(day.apps, hidden);
  const spans = withoutHidden(day.spans, hidden);
  const dayStartMs = day.day;
  return (
    <div className={LAYOUT}>
      <div className={COLUMN}>
        <ActivityHero all={day.apps} shown={shown} hidden={hidden} onToggle={onToggle} reference={before ? sum(withoutHidden(before.apps, hidden)) : null} idleSecs={day.idleSecs} />
        <ActivityGoal codeSecs={goal.codeSecs} goalMin={goal.minutes} streakDays={goal.streakDays} days={goal.days} editing={goal.editing} onEditing={goal.onEditing} onGoal={goal.onGoal} />
        <ActivityTiles spans={spans} before={before ? withoutHidden(before.spans, hidden) : null} dayStartSec={Math.floor(dayStartMs / 1000)} />
      </div>
      <div className={COLUMN}>
        <ActivityTimeline spans={spans} allSpans={day.spans} idle={day.idle} apps={shown} dayStartMs={dayStartMs} nowSec={nowSec} />
        <ActivityList apps={shown} focus={mergeFocus([day])} scope="day" onRecategorize={onRecategorize} />
      </div>
    </div>
  );
}
