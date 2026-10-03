import { api, type Attachment } from "../lib/api";

/** The jobs that made a CI red, one line each; a job with a link opens its page on click. */
export default function AlertJobs({ jobs }: { jobs: Attachment[] }) {
  if (jobs.length === 0) return null;
  return (
    <ul className="mt-2 space-y-1">
      {jobs.map((j) => (
        <li key={j.title}>
          {j.url ? (
            <button
              type="button"
              onClick={() => void api.openLink(j.url)}
              title={j.url}
              className="w-full break-words rounded bg-edge px-2 py-1 text-left text-xs text-fg"
            >
              ✖ {j.title}
            </button>
          ) : (
            <p className="break-words rounded bg-edge px-2 py-1 text-xs text-fg">✖ {j.title}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
