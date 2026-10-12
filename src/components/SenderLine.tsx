import type { Sender } from "../lib/api";
import Avatar from "./Avatar";

/** Who mentioned the user: photo (or initials), full name and @login. */
export default function SenderLine({ sender }: { sender: Sender }) {
  const name = sender.name || sender.login;
  return (
    <div className="flex min-w-0 items-center gap-2" data-sender>
      <Avatar name={name} email={sender.login} photo={sender.avatar} size="md" />
      <div className="min-w-0 leading-tight">
        <p className="truncate text-xs font-semibold text-fg">{name}</p>
        {sender.name && <p className="truncate text-[11px] text-muted">@{sender.login}</p>}
      </div>
    </div>
  );
}
