import type { ReactNode } from "react";
import { BellIcon, CalendarIcon, ChecklistIcon, ClockIcon, PullIcon, PulseIcon } from "../../components/Icons";
import type { StripItem } from "../../lib/api";

const Line = ({ children }: { children: ReactNode }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {children}
  </svg>
);

export const ICONS: Record<StripItem, ReactNode> = {
  clock: <ClockIcon />,
  cpu: <PulseIcon size={14} />,
  memory: (
    <Line>
      <rect x="3" y="8" width="18" height="8" rx="1.5" />
      <path d="M7 12h.01M12 12h.01M17 12h.01" />
    </Line>
  ),
  gpu: (
    <Line>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <path d="M10 10h4v4h-4zM9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
    </Line>
  ),
  temp: (
    <Line>
      <path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z" />
    </Line>
  ),
  disk: (
    <Line>
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
    </Line>
  ),
  network: (
    <Line>
      <path d="M8 3v14M4 13l4 4 4-4M16 21V7M12 11l4-4 4 4" />
    </Line>
  ),
  battery: (
    <Line>
      <rect x="2" y="8" width="17" height="8" rx="2" />
      <path d="M22 11v2" />
    </Line>
  ),
  tasks: <ChecklistIcon />,
  weather: (
    <Line>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
    </Line>
  ),
  event: <CalendarIcon />,
  reviews: <PullIcon />,
  notices: <BellIcon on={false} />,
  health: (
    <Line>
      <path d="M3 12h4l2-5 4 10 2-5h6" />
    </Line>
  ),
  market: (
    <Line>
      <path d="m3 17 6-6 4 4 8-8M15 7h6v6" />
    </Line>
  ),
};
