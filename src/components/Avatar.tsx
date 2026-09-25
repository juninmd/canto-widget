import { avatarTone, initials } from "../lib/agenda";
import { isPhoto } from "../lib/useGuestPhotos";

type Props = { name: string; email?: string; size?: "sm" | "md"; photo?: string };

/** Directory photo when Rust found one (as a `data:` URL, the only kind the CSP allows), initials otherwise. */
export default function Avatar({ name, email = "", size = "sm", photo }: Props) {
  const box = size === "md" ? "h-7 w-7 text-[11px]" : "h-5 w-5 text-[9px]";
  if (isPhoto(photo)) {
    return <img src={photo} alt="" aria-hidden="true" className={`shrink-0 rounded-full object-cover ${box}`} />;
  }
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-fg ${box} ${avatarTone(email || name)}`}
    >
      {initials(name)}
    </span>
  );
}
