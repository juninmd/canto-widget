import type { focus as source } from "../pt-BR/focus";

export const focus: Record<keyof typeof source, string> = {
  "focus.start": "start focus on {title}",
  "focus.pause": "pause focus on {title}",
  "focus.estimate": "estimate",
  "focus.estimateOf": "estimate for {title}",
  "focus.noEstimate": "no estimate",
  "focus.minutes": "{min} min",
  "focus.tracked": "{spent}/{est} min",
  "focus.trackedOnly": "{spent} min",
  "focus.over": "over the estimate",
  "focus.barLabel": "task in focus",
  "focus.badge": "in focus",
  "focus.pauseButton": "Pause",
  "focus.doneButton": "Done",
  "focus.overNudge": "You went over the estimate on {title}. How about a break?",
  "focus.saveFailed": "Could not save the focus time: {error}",
  "focus.summaryHeading": "Focused time",
  "focus.settingsTitle": "Focus",
  "focus.settingsHint": "The timer runs on the task you start. Time is saved to the vault every minute and on pause.",
  "focus.settingsOverNudge": "Warn when the estimate is exceeded",
  "focus.reportLine": "Focused time",
};
