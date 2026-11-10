import type { SystemSub } from "./SystemTab";

/** Line icons for the Sistema tab, in currentColor like `Icons.tsx`. */
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

const PATHS: Record<SystemSub, React.ReactNode> = {
  overview: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  cpu: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="0.5" />
      <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
    </>
  ),
  gpu: (
    <>
      <rect x="2" y="6" width="20" height="11" rx="2" />
      <circle cx="9" cy="11.5" r="2.5" />
      <path d="M15 10h3M15 13h3M5 17v3M2 6V4" />
    </>
  ),
  memory: (
    <>
      <rect x="2" y="7" width="20" height="10" rx="1.5" />
      <path d="M6 11v2M10 11v2M14 11v2M18 11v2M5 17v3M9 17v3M15 17v3M19 17v3" />
    </>
  ),
  disk: (
    <>
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
    </>
  ),
  network: <path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M2 9a15 15 0 0 1 20 0M12 19.5h.01" />,
  power: (
    <>
      <rect x="2" y="7" width="17" height="10" rx="2" />
      <path d="M22 11v2M11 9l-2.5 3.5h4L10 16" />
    </>
  ),
};

export function SubIcon({ sub, size = 14 }: { sub: SystemSub; size?: number }) {
  return (
    <svg {...base} width={size} height={size}>
      {PATHS[sub]}
    </svg>
  );
}

export const ThermoIcon = ({ size = 14 }: { size?: number }) => (
  <svg {...base} width={size} height={size}>
    <path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0zM12 9v7" />
  </svg>
);

export const AppsIcon = ({ size = 14 }: { size?: number }) => (
  <svg {...base} width={size} height={size}>
    <rect x="3" y="3" width="7" height="7" rx="2" />
    <rect x="14" y="3" width="7" height="7" rx="2" />
    <rect x="3" y="14" width="7" height="7" rx="2" />
    <rect x="14" y="14" width="7" height="7" rx="2" />
  </svg>
);

export const PulseCheckIcon = ({ ok, size = 16 }: { ok: boolean; size?: number }) => (
  <svg {...base} width={size} height={size}>
    {ok ? <path d="M20 6 9 17l-5-5" /> : <path d="M12 8v5M12 16.5h.01M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />}
  </svg>
);
