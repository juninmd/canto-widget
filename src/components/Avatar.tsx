import { avatarTone, initials } from "../lib/agenda";

/** Initials avatar: the CSP blocks remote images and Calendar sends no photo URL. */
export default function Avatar({ name, email = "", size = "sm" }: { name: string; email?: string; size?: "sm" | "md" }) {
  const box = size === "md" ? "h-7 w-7 text-[11px]" : "h-5 w-5 text-[9px]";
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-fg ${box} ${avatarTone(email || name)}`}
    >
      {initials(name)}
    </span>
  );
}
