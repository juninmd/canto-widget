/** Ícones de traço em currentColor: seguem a skin, ao contrário de emoji colorido. */
const base = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export const IconeRelogio = () => (
  <svg {...base}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2 2M5 3 2 6M22 6l-3-3" />
  </svg>
);

export const IconeAlfinete = ({ cheio }: { cheio: boolean }) => (
  <svg {...base} fill={cheio ? "currentColor" : "none"}>
    <path d="M12 17v5M9 10.76V4h6v6.76l2.5 2.74H6.5z" />
  </svg>
);
