import type { ReactNode } from "react";

/** A list with nothing in it says so with a mark and one line, instead of a lone grey sentence. */
export default function EmptyState({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex flex-col items-center gap-2 px-4 py-10 text-center text-xs text-faint">
      <span aria-hidden="true" className="grid size-10 place-items-center rounded-full bg-edge/60 text-muted [&>svg]:size-5">
        {icon}
      </span>
      <span className="max-w-[24ch]">{children}</span>
    </li>
  );
}
