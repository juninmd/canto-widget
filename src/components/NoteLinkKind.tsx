import { CalendarIcon, CheckIcon } from "./Icons";

/** Marks a note link as a task or an agenda event, in the skin's colors instead of an emoji. */
export default function NoteLinkKind({ kind }: { kind: "task" | "event" }) {
  return (
    <span aria-hidden="true" className="mr-1 inline-block align-[-2px]">
      {kind === "task" ? <CheckIcon /> : <CalendarIcon />}
    </span>
  );
}
