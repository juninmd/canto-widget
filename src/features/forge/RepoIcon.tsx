/** The group's or repository's icon (a `data:` URL Rust embedded), or its initial until it arrives or when it has none. */
export default function RepoIcon({ src, name, size = "md" }: { src?: string; name: string; size?: "sm" | "md" | "lg" }) {
  const box = size === "lg" ? "size-9 text-sm" : size === "md" ? "size-5 text-[10px]" : "size-4 text-[9px]";
  if (src) return <img loading="lazy" decoding="async" src={src} alt="" aria-hidden="true" className={`shrink-0 rounded-md object-cover ${box}`} />;
  return (
    <span aria-hidden="true" className={`inline-flex shrink-0 items-center justify-center rounded-md bg-edge font-semibold uppercase text-muted ${box}`}>
      {(name.trim()[0] ?? "?").toUpperCase()}
    </span>
  );
}
