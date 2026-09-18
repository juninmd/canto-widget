/** Line icons in currentColor: they follow the skin, unlike colored emoji. */
const base = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export const ClockIcon = () => (
  <svg {...base}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2 2M5 3 2 6M22 6l-3-3" />
  </svg>
);

export const PinIcon = ({ filled }: { filled: boolean }) => (
  <svg {...base} fill={filled ? "currentColor" : "none"}>
    <path d="M12 17v5M9 10.76V4h6v6.76l2.5 2.74H6.5z" />
  </svg>
);

export const IssueIcon = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

export const PullIcon = () => (
  <svg {...base}>
    <circle cx="6" cy="5" r="2" />
    <circle cx="6" cy="19" r="2" />
    <circle cx="18" cy="19" r="2" />
    <path d="M6 7v10M18 17V9a3 3 0 0 0-3-3h-4m2-2-2 2 2 2" />
  </svg>
);
