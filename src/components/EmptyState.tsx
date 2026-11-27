import type { ReactNode } from "react";
import { EmptyState as SonidoEmptyState } from "@juninmd/sonido";

type Props = {
  icon: ReactNode;
  /** The one line that says what is missing. */
  title: string;
  /** Optional second line, e.g. how to make results appear. */
  description?: ReactNode;
  /** Optional way out: retry, clear the search, open Settings. */
  action?: ReactNode;
  className?: string;
};

/** A list with nothing in it says so with a mark, one line and a way out, instead of a lone grey sentence. */
export default function EmptyState({ icon, title, description, action, className = "" }: Props) {
  return (
    <li className={className}>
      <SonidoEmptyState icon={icon} title={title} description={description} action={action} />
    </li>
  );
}
