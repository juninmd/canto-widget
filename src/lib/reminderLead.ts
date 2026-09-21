import { useCallback, useState } from "react";

const KEY = "canto.reminderLeadMinutes";
export const LEAD_OPTIONS = [0, 5, 10, 15, 30] as const;
export type LeadMinutes = (typeof LEAD_OPTIONS)[number];

/** Nothing saved, or a value that isn't one of the offered options, means "on time". */
export function parseLead(raw: string | null): LeadMinutes {
  const n = Number(raw);
  return (LEAD_OPTIONS as readonly number[]).includes(n) ? (n as LeadMinutes) : 0;
}

export function useReminderLead() {
  const [lead, setLead] = useState<LeadMinutes>(() => parseLead(localStorage.getItem(KEY)));
  const change = useCallback((next: LeadMinutes) => {
    setLead(next);
    localStorage.setItem(KEY, String(next));
  }, []);
  return [lead, change] as const;
}
