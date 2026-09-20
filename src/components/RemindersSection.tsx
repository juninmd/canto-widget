import { LEAD_OPTIONS, type LeadMinutes } from "../lib/reminderLead";

type Props = { lead: LeadMinutes; onChange: (lead: LeadMinutes) => void };

const LABEL = (m: number) => (m === 0 ? "na hora" : `${m} min antes`);

export default function RemindersSection({ lead, onChange }: Props) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1 text-xs font-semibold text-fg">Lembretes</legend>
      <label className="flex min-h-6 items-center gap-2 text-xs text-muted">
        avisar
        <select
          value={lead}
          onChange={(e) => onChange(Number(e.target.value) as LeadMinutes)}
          className="rounded border border-line bg-transparent px-1.5 py-0.5 text-xs text-fg"
        >
          {LEAD_OPTIONS.map((m) => (
            <option key={m} value={m}>
              {LABEL(m)}
            </option>
          ))}
        </select>
      </label>
    </fieldset>
  );
}
