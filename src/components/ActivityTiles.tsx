import { t } from "../i18n";
import { appName, focusStats, secsLabel } from "../lib/activity";
import type { ActivitySpan } from "../lib/api";
import { clockOf, peakHour } from "../lib/activityView";
import ActivityTile from "./ActivityTile";

/** Three numbers about how the day went: the longest stretch in one app, how often focus moved, the busiest hour. */
export default function ActivityTiles({ spans, before, dayStartSec }: { spans: ActivitySpan[]; before: ActivitySpan[] | null; dayStartSec: number }) {
  const { longest, switches } = focusStats(spans);
  const peak = peakHour(spans, dayStartSec);
  return (
    <div className="grid grid-cols-3 gap-2">
      <ActivityTile label={t("activity.tileLongest")} value={longest.secs ? secsLabel(longest.secs) : "—"} sub={longest.secs ? `${appName(longest.app)} · ${clockOf(longest.start)}` : ""} />
      <ActivityTile label={t("activity.switches")} value={String(switches)} sub={before ? t("activity.yesterdaySwitches", { n: focusStats(before).switches }) : ""} />
      <ActivityTile label={t("activity.tilePeak")} value={peak ? `${peak.hour}h` : "—"} sub={peak ? t("activity.peakActive", { time: secsLabel(peak.secs) }) : ""} />
    </div>
  );
}
