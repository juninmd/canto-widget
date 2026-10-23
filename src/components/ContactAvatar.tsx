import type { Contact } from "../lib/api";
import { avatarTone } from "../lib/agenda";
import { initials } from "../lib/google";
import { isPhoto } from "../lib/useGuestPhotos";

type Props = { contact: Contact; photos: Record<string, string>; className: string };

/** The contact's Google photo once Rust has embedded it, the initials on its colour until then or without one. */
export default function ContactAvatar({ contact, photos, className }: Props) {
  const photo = contact.photo ? photos[contact.photo] : undefined;
  if (isPhoto(photo)) {
    return <img src={photo} alt="" aria-hidden="true" data-contact-photo className={`shrink-0 rounded-full object-cover ${className}`} />;
  }
  return (
    <span aria-hidden="true" className={`grid shrink-0 place-items-center rounded-full text-[11px] font-bold text-fg ${className} ${avatarTone(contact.emails[0] ?? contact.name)}`}>
      {initials(contact.name)}
    </span>
  );
}
