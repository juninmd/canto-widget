import type { ReactNode } from "react";
import type { ClipKind } from "../lib/clip";
import { LinkIcon } from "./Icons";

const svg = { viewBox: "0 0 24 24", width: 16, height: 16, fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

const ICON: Record<Exclude<ClipKind, "color">, ReactNode> = {
  link: <LinkIcon />,
  json: (
    <svg {...svg}>
      <path d="M8 4c-2 0-2.5 1-2.5 2.5v2C5.5 10 4.5 12 4 12c.5 0 1.5 2 1.5 3.5v2C5.5 19 6 20 8 20M16 4c2 0 2.5 1 2.5 2.5v2c0 1.5 1 3.5 1.5 3.5-.5 0-1.5 2-1.5 3.5v2c0 1.5-.5 2.5-2.5 2.5" />
    </svg>
  ),
  code: (
    <svg {...svg}>
      <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14" />
    </svg>
  ),
  text: (
    <svg {...svg}>
      <path d="M5 7h14M5 12h14M5 17h9" />
    </svg>
  ),
  email: (
    <svg {...svg}>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M15.5 12v1.5a2.5 2.5 0 0 0 5 0V12a8.5 8.5 0 1 0-3.4 6.8" />
    </svg>
  ),
  phone: (
    <svg {...svg}>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A15 15 0 0 1 4 5a1 1 0 0 1 1-1Z" />
    </svg>
  ),
};

/** Per-kind colors come from the skin's category tokens so every theme keeps its contrast. */
const TONE: Record<ClipKind, string> = {
  link: "bg-cat-meet/15 text-cat-meet",
  color: "bg-edge text-muted",
  json: "bg-cat-docs/15 text-cat-docs",
  code: "bg-cat-chat/15 text-cat-chat",
  text: "bg-edge text-muted",
  email: "bg-cat-web/15 text-cat-web",
  phone: "bg-cat-games/15 text-cat-games",
};

/** The left tile of a card: an icon in the kind's own color; a color item shows the color itself. */
export default function ClipKindTile({ kind, color, blur }: { kind: ClipKind; color?: string; blur?: boolean }) {
  return (
    <span aria-hidden="true" data-kind={kind} className={`grid size-9 shrink-0 place-items-center rounded-lg ${TONE[kind]}`}>
      {kind === "color" ? (
        <span className={`size-5 rounded border border-line ${blur ? "blur-sm" : ""}`} style={{ background: color }} />
      ) : (
        ICON[kind]
      )}
    </span>
  );
}
