import { createContext, useContext, useId, type ReactNode } from "react";
import { t } from "../i18n";

/** Sections sit one heading level under whatever holds them: the group, or the sensitive zone inside it. */
const LevelContext = createContext<3 | 4>(3);

export function SettingsSection({ id, title, error, className = "", children }: {
  id?: string;
  title: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  const auto = useId();
  const headingId = id ?? auto;
  const Heading = useContext(LevelContext) === 3 ? "h3" : "h4";
  return (
    <div role="group" aria-labelledby={headingId} className={`flex flex-col gap-2 ${className}`}>
      <Heading id={headingId} className="text-xs font-semibold text-fg">
        {title}
      </Heading>
      {children}
      {error && (
        <p role="alert" className="break-words text-[11px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/** Password, backup and sync: one frame and a heading so they read as the careful part. */
export function SensitiveZone({ children }: { children: ReactNode }) {
  const id = useId();
  return (
    <div role="group" aria-labelledby={id} className="flex flex-col gap-3 rounded-lg border border-danger/30 bg-danger/5 p-2.5">
      <h3 id={id} className="text-[11px] font-semibold uppercase tracking-wide text-danger">
        {t("settings.sensitive")}
      </h3>
      <LevelContext.Provider value={4}>{children}</LevelContext.Provider>
    </div>
  );
}
