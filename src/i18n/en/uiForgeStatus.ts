import type { uiForgeStatus as source } from "../pt-BR/uiForgeStatus";

export const uiForgeStatus: Record<keyof typeof source, string> = {
  "uiForge.more": "more actions",
  "uiForge.sortButton": "sort by: {sort}",
  "uiForge.sortMenu": "sorting",
  "uiForge.tileTitle": "show only {label}; press again to see everything",
  "uiForge.focusEmpty": "nothing in this slice with the current filter",
  "uiStatus.filter.label": "filter services by state",
  "uiStatus.filter.all": "All",
  "uiStatus.filter.problems": "With problems",
  "uiStatus.filter.ok": "Operational",
  "uiStatus.filter.maintenance": "Maintenance",
  "uiStatus.filter.empty": "no service in this filter",
  "uiStatus.none": "couldn't read any status page right now; check the connection and try again",
  "uiStatus.bar": "{down} down, {warn} unstable, {maint} in maintenance, {ok} operational",
  "uiStatus.add": "+ address",
  "uiStatus.emptyAdd": "add endpoint",
  "uiStatus.pills.label": "endpoint summary",
  "uiStatus.pill.down": "{n} down",
  "uiStatus.pill.slow": "{n} slow",
  "uiStatus.pill.cert": "{n} expiring",
  "uiStatus.count": "{n} endpoints",
};
