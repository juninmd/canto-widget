const base = { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export const RefreshIcon = () => (
  <svg {...base}>
    <path d="M21 12a9 9 0 1 1-2.64-6.36M21 4v5h-5" />
  </svg>
);

export const SortIcon = () => (
  <svg {...base}>
    <path d="M3 6h13M3 12h9M3 18h5M18 8v12m0 0-3-3m3 3 3-3" />
  </svg>
);
