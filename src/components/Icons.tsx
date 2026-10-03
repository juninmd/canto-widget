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

export const GripIcon = () => (
  <svg {...base}>
    <circle cx="9" cy="6" r="1" fill="currentColor" stroke="none" />
    <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="9" cy="18" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="6" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="18" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const EyeIcon = () => (
  <svg {...base}>
    <path d="M1.6 12c1.4-4 5.4-8 10.4-8s9 4 10.4 8c-1.4 4-5.4 8-10.4 8s-9-4-10.4-8Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeOffIcon = () => (
  <svg {...base}>
    <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.4 4.6A10.4 10.4 0 0 1 12 4c5 0 9 4 10.4 8a13 13 0 0 1-3.2 4.6M6.3 6.3A13 13 0 0 0 1.6 12c1.4 4 5.4 8 10.4 8 1.4 0 2.7-.3 4-.8" />
  </svg>
);

export const DownloadIcon = () => (
  <svg {...base}>
    <path d="M12 3v12m0 0-4-4m4 4 4-4M4 19h16" />
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

export const BellIcon = ({ on }: { on: boolean }) => (
  <svg {...base} fill={on ? "currentColor" : "none"}>
    <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

export const MoonIcon = () => (
  <svg {...base}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

export const PlayIcon = () => (
  <svg {...base}>
    <path d="M7 4v16l13-8z" fill="currentColor" />
  </svg>
);

export const PauseIcon = () => (
  <svg {...base}>
    <path d="M8 5v14M16 5v14" />
  </svg>
);

export const PlusIcon = () => (
  <svg {...base}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const HelpIcon = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.2a2.6 2.6 0 0 1 5 .9c0 1.7-2.5 2.2-2.5 3.9M12 17.2v.1" />
  </svg>
);

export const LockIcon = () => (
  <svg {...base}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

export const ExpandIcon = () => (
  <svg {...base}>
    <path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" />
  </svg>
);

export const ShrinkIcon = () => (
  <svg {...base}>
    <path d="M20 10h-6V4M4 14h6v6M14 10l7-7M3 21l7-7" />
  </svg>
);

export const MinimizeIcon = () => (
  <svg {...base}>
    <path d="M5 12h14" />
  </svg>
);

export const ChecklistIcon = () => (
  <svg {...base}>
    <path d="m4 7 2 2 3-4M4 17l2 2 3-4M13 8h7M13 18h7" />
  </svg>
);

export const ClipboardIcon = () => (
  <svg {...base}>
    <rect x="6" y="4" width="12" height="17" rx="2" />
    <path d="M9 4h6v3H9z" />
  </svg>
);

export const SearchIcon = () => (
  <svg {...base}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const NoteIcon = () => (
  <svg {...base}>
    <path d="M6 3h9l4 4v14H6z" />
    <path d="M14 3v5h5M9 13h7M9 17h5" />
  </svg>
);
