import type { ReactNode } from "react";

const UNION = (
  <>
    <rect width="28" height="20" fill="#012169" />
    <path d="M0 0 28 20M28 0 0 20" stroke="#fff" strokeWidth="4" />
    <path d="M0 0 28 20M28 0 0 20" stroke="#c8102e" strokeWidth="1.5" />
    <path d="M14 0v20M0 10h28" stroke="#fff" strokeWidth="6" />
    <path d="M14 0v20M0 10h28" stroke="#c8102e" strokeWidth="3.4" />
  </>
);

/** Simplified flags drawn inline: emoji flags don't render on Windows, and the CSP allows no remote image. */
const FLAGS: Record<string, ReactNode> = {
  BR: (
    <>
      <rect width="28" height="20" fill="#009c3b" />
      <path d="M14 2.5 25.5 10 14 17.5 2.5 10z" fill="#ffdf00" />
      <circle cx="14" cy="10" r="4.6" fill="#002776" />
      <path d="M9.6 9.2q4.4-1.4 8.8 1.4" stroke="#fff" strokeWidth=".9" fill="none" />
    </>
  ),
  US: (
    <>
      <rect width="28" height="20" fill="#fff" />
      {[0, 2, 4, 6, 8, 10, 12].map((i) => (
        <rect key={i} y={(i * 20) / 13} width="28" height={20 / 13} fill="#b22234" />
      ))}
      <rect width="12" height="10.8" fill="#3c3b6e" />
    </>
  ),
  EU: (
    <>
      <rect width="28" height="20" fill="#003399" />
      {Array.from({ length: 12 }, (_, i) => (
        <circle key={i} cx={14 + 6 * Math.cos((i * Math.PI) / 6)} cy={10 + 6 * Math.sin((i * Math.PI) / 6)} r=".9" fill="#ffcc00" />
      ))}
    </>
  ),
  GB: UNION,
  JP: (
    <>
      <rect width="28" height="20" fill="#fff" />
      <circle cx="14" cy="10" r="5.5" fill="#bc002d" />
    </>
  ),
  CN: (
    <>
      <rect width="28" height="20" fill="#de2910" />
      <path d="M5 2.5l1 3h3.1l-2.5 1.9 1 3L5 8.5l-2.6 1.9 1-3L1 5.5h3.1z" fill="#ffde00" />
      {[
        [10, 2],
        [12, 4.5],
        [12, 7.5],
        [10, 10],
      ].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r=".9" fill="#ffde00" />
      ))}
    </>
  ),
  AU: (
    <>
      <rect width="28" height="20" fill="#00008b" />
      <g transform="scale(.5)">{UNION}</g>
      {[
        [7, 15.5, 1.4],
        [21, 4, 0.8],
        [24, 8.5, 0.8],
        [21, 16, 0.8],
        [18, 9, 0.8],
      ].map(([x, y, r]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill="#fff" />
      ))}
    </>
  ),
  CA: (
    <>
      <rect width="28" height="20" fill="#fff" />
      <rect width="7" height="20" fill="#d80621" />
      <rect x="21" width="7" height="20" fill="#d80621" />
      <path d="M14 4l1.2 2.4 1.6-.6-.6 3.2 2-1.6.6 1.4 1.8-.4-.8 2 1 .6-3.6 2.6.4 1.4-3.4-.6V17h-.4v-2.6l-3.4.6.4-1.4-3.6-2.6 1-.6-.8-2 1.8.4.6-1.4 2 1.6-.6-3.2 1.6.6z" fill="#d80621" />
    </>
  ),
  CH: (
    <>
      <rect width="28" height="20" fill="#d52b1e" />
      <path d="M12.3 4h3.4v4.3H20v3.4h-4.3V16h-3.4v-4.3H8V8.3h4.3z" fill="#fff" />
    </>
  ),
  KR: (
    <>
      <rect width="28" height="20" fill="#fff" />
      <circle cx="14" cy="10" r="4.5" fill="#cd2e3a" />
      <path d="M9.5 10a4.5 4.5 0 0 0 9 0 2.25 2.25 0 0 0-4.5 0 2.25 2.25 0 0 1-4.5 0" fill="#0047a0" />
      {[
        [5, 4, 35],
        [23, 4, -35],
        [5, 16, -35],
        [23, 16, 35],
      ].map(([x, y, a]) => (
        <g key={`${x}${y}`} transform={`translate(${x} ${y}) rotate(${a})`}>
          <rect x="-2.2" y="-1.6" width="4.4" height=".7" />
          <rect x="-2.2" y="-.35" width="4.4" height=".7" />
          <rect x="-2.2" y=".9" width="4.4" height=".7" />
        </g>
      ))}
    </>
  ),
  IN: (
    <>
      <rect width="28" height="20" fill="#fff" />
      <rect width="28" height="6.67" fill="#ff9933" />
      <rect y="13.33" width="28" height="6.67" fill="#138808" />
      <circle cx="14" cy="10" r="2.4" fill="none" stroke="#000080" strokeWidth=".7" />
    </>
  ),
  MX: (
    <>
      <rect width="28" height="20" fill="#fff" />
      <rect width="9.33" height="20" fill="#006847" />
      <rect x="18.67" width="9.33" height="20" fill="#ce1126" />
      <circle cx="14" cy="10" r="2.6" fill="#8c5a2b" />
    </>
  ),
};

export default function SteamFlag({ country }: { country: string }) {
  return (
    <svg viewBox="0 0 28 20" aria-hidden="true" className="h-3.5 w-5 shrink-0 overflow-hidden rounded-[3px] shadow-[0_0_0_1px_rgb(0_0_0/0.25)]">
      {FLAGS[country] ?? <rect width="28" height="20" fill="currentColor" opacity=".3" />}
    </svg>
  );
}
